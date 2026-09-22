import React, { useState, useEffect } from 'react';
import { getLessonsByBook, getAllWordsByBook } from '../data/lessonsData';
import { WordItem } from '../types';
import { saveQuizResult, updateUserStats, getAllWordProgress, getUserWordProgress, saveWordProgress } from '../db/storage';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, Sparkles, Volume2, Eye, EyeOff, Image as ImageIcon, ImageOff } from 'lucide-react';
import { speakJapanese } from '../utils/audio';
import { calculateSRS } from '../utils/srs';
import confetti from 'canvas-confetti';
import { useBookStore } from '../store/bookStore';

interface QuizViewProps {
  initialLessonNumber?: number;
}

export const QuizView: React.FC<QuizViewProps> = ({ initialLessonNumber = 1 }) => {
  const { currentBook } = useBookStore();
  const LESSONS = getLessonsByBook(currentBook);
  const ALL_WORDS = getAllWordsByBook(currentBook);

  const [selectedLesson, setSelectedLesson] = useState<number>(initialLessonNumber);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  // Preference toggles with localStorage persistence
  const [showFurigana, setShowFurigana] = useState<boolean>(() => {
    const saved = localStorage.getItem('srs_show_furigana');
    return saved !== null ? saved === 'true' : true;
  });
  const [showVisuals, setShowVisuals] = useState<boolean>(() => {
    const saved = localStorage.getItem('srs_show_visuals');
    return saved !== null ? saved === 'true' : true;
  });

  // Save preference updates
  const toggleFurigana = () => {
    setShowFurigana(prev => {
      const newVal = !prev;
      localStorage.setItem('srs_show_furigana', String(newVal));
      return newVal;
    });
  };

  const toggleVisuals = () => {
    setShowVisuals(prev => {
      const newVal = !prev;
      localStorage.setItem('srs_show_visuals', String(newVal));
      return newVal;
    });
  };

  useEffect(() => {
    generateQuiz(selectedLesson);
  }, [selectedLesson, currentBook]);

  const generateQuiz = async (lessonNum: number) => {
    const lessonWords = ALL_WORDS.filter(w => w.lessonNumber === lessonNum);
    
    // Load progress of all words from IndexedDB to prioritize based on SRS and difficulty!
    const progressList = await getAllWordProgress();
    const progressMap = new Map(progressList.map(p => [p.wordId, p]));

    const weightedWords = lessonWords.map(word => {
      const prog = progressMap.get(word.id);
      let weight = 1.0;

      if (!prog) {
        weight = 1.2; // slightly favor new words
      } else {
        // Words marked 'hard' get extremely high weight
        if (prog.difficulty === 'hard') {
          weight += 3.0;
        } else if (prog.difficulty === 'medium') {
          weight += 1.2;
        }

        // Favor bookmarked words
        if (prog.bookmarked) {
          weight += 1.5;
        }

        // Favor words with high failure rate
        if (prog.incorrectCount > 0) {
          weight += (prog.incorrectCount / (prog.correctCount + 1)) * 2.0;
        }

        // Favor words that are due or overdue for SRS review
        if (prog.nextReviewDate) {
          const dueDiff = Date.now() - new Date(prog.nextReviewDate).getTime();
          if (dueDiff > 0) {
            // Overdue! Scale weight based on days overdue
            weight += 2.5 + Math.min(3, dueDiff / (1000 * 60 * 60 * 24));
          }
        }
      }

      return { word, weight };
    });

    // Shuffle with randomized weight to keep quizzes fresh while keeping hard/due words prioritized
    const shuffled = weightedWords
      .map(item => ({ ...item, finalWeight: item.weight * (0.5 + Math.random() * 0.8) }))
      .sort((a, b) => b.finalWeight - a.finalWeight)
      .slice(0, 10)
      .map(item => item.word);
    
    const quizItems = shuffled.map((word) => {
      // Pick 3 wrong options from all words
      const wrongOptions = ALL_WORDS
        .filter(w => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.bengali);

      const options = [...wrongOptions, word.bengali].sort(() => 0.5 - Math.random());

      return {
        word,
        options,
        correctAnswer: word.bengali
      };
    });

    setQuestions(quizItems);
    setCurrentIndex(0);
    setScore(0);
    setIsCompleted(false);
    setSelectedOption(null);
    setIsAnswerChecked(false);
  };

  const handleSelectOption = async (option: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(option);
    setIsAnswerChecked(true);

    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // UPDATE SRS progress in IndexedDB!
    const existingProgress = await getUserWordProgress(currentQ.word.id);
    const progress = existingProgress || {
      wordId: currentQ.word.id,
      status: 'new' as const,
      correctCount: 0,
      incorrectCount: 0,
      bookmarked: false
    };

    // Quality is 4 if correct, 1 if incorrect
    const srsQuality = isCorrect ? 4 : 1;
    const updatedProgress = calculateSRS(progress, srsQuality);
    await saveWordProgress(updatedProgress);
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Save quiz result
      const finalScore = score + (selectedOption === questions[currentIndex].correctAnswer ? 1 : 0);
      await saveQuizResult({
        id: `quiz_${Date.now()}`,
        lessonNumber: selectedLesson,
        score: finalScore,
        totalQuestions: questions.length,
        date: new Date().toISOString(),
        mode: 'meaning',
        book: currentBook
      });

      await updateUserStats(prev => ({
        ...prev,
        totalQuizzesTaken: prev.totalQuizzesTaken + 1
      }));
    }
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header & Lesson Selector */}
      <div className="bg-slate-900/80 border border-pink-950/50 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vocabulary Skill Quiz</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">কুইজের মাধ্যমে দক্ষতা যাচাই</h2>
        </div>

        <select
          value={selectedLesson}
          onChange={(e) => setSelectedLesson(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 focus:border-pink-500 text-white text-sm rounded-xl px-4 py-2.5 outline-none cursor-pointer"
        >
          {LESSONS.map((l) => (
            <option key={l.number} value={l.number}>
              Lesson {l.number}: {l.titleJp}
            </option>
          ))}
        </select>
      </div>

      {isCompleted ? (
        <div className="bg-slate-900/90 border border-pink-950/80 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-white mb-2">কুইজ সম্পন্ন হয়েছে!</h3>
            <p className="text-slate-300 text-sm">
              আপনার স্কোর: <span className="text-pink-400 font-bold text-xl">{score}</span> / {questions.length}
            </p>
          </div>

          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 text-sm text-slate-300">
            {score >= questions.length * 0.8
              ? 'চমৎকার! আপনার জাপানি শব্দভান্ডার দারুণ প্রস্তুত। 🎉'
              : 'ভালো প্রচেষ্টা! আরও একবার রিভিও করে চেষ্টা করুন। 💪'}
          </div>

          <button
            onClick={() => generateQuiz(selectedLesson)}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold text-sm shadow-lg shadow-pink-600/30 hover:opacity-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>আবার কুইজ দিন</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-pink-950/80 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-800 pb-4">
            <span>প্রশ্ন {currentIndex + 1} / {questions.length}</span>
            
            {/* Preferences Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFurigana}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer text-[10px] font-bold ${
                  showFurigana 
                    ? 'bg-pink-500/10 text-pink-300 border-pink-500/30 shadow-inner' 
                    : 'bg-slate-800/80 text-slate-500 border-slate-700/80 hover:text-slate-300'
                }`}
                title="ফুরিগানা [ふりがな] অন/অফ"
              >
                {showFurigana ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">ফুরিগানা</span>
              </button>

              <button
                onClick={toggleVisuals}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer text-[10px] font-bold ${
                  showVisuals 
                    ? 'bg-pink-500/10 text-pink-300 border-pink-500/30 shadow-inner' 
                    : 'bg-slate-800/80 text-slate-500 border-slate-700/80 hover:text-slate-300'
                }`}
                title="ছবি ও ইমোজি [🎨] অন/অফ"
              >
                {showVisuals ? <ImageIcon className="w-3.5 h-3.5" /> : <ImageOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">ইমোজি</span>
              </button>
            </div>

            <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
              স্কোর: {score}
            </span>
          </div>

          {/* Question Word */}
          <div className="text-center space-y-3 py-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 p-6">
            <div className="flex items-center justify-center gap-3">
              {showVisuals && <span className="text-4xl">{currentQ.word.emoji}</span>}
              <h3 className="text-4xl font-extrabold text-white tracking-wide">{currentQ.word.japanese}</h3>
              <button
                onClick={() => speakJapanese(currentQ.word.japanese)}
                className="p-2.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 transition-colors cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            
            {showFurigana || isAnswerChecked ? (
              <p className="text-sm font-medium text-pink-400 animate-fade-in">[{currentQ.word.reading}]</p>
            ) : (
              <p className="text-sm font-medium text-slate-600 select-none cursor-pointer hover:text-slate-400 transition-colors" onClick={toggleFurigana} title="ফুরিগানা দেখতে ক্লিক করুন">
                [ふりがな লুকানো - দেখতে চাপুন]
              </p>
            )}
            <p className="text-xs text-slate-400">সঠিক বাংলা অর্থটি বেছে নিন:</p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((option: string, idx: number) => {
              let btnStyle = "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-white";
              if (isAnswerChecked) {
                if (option === currentQ.correctAnswer) {
                  btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-950/30";
                } else if (option === selectedOption) {
                  btnStyle = "bg-rose-950/60 border-rose-500 text-rose-200";
                } else {
                  btnStyle = "bg-slate-800/40 border-slate-800 text-slate-500 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswerChecked}
                  className={`p-4 rounded-2xl border text-left font-semibold text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswerChecked && option === currentQ.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  {isAnswerChecked && option === selectedOption && option !== currentQ.correctAnswer && (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswerChecked && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold text-sm shadow-lg shadow-pink-600/30 hover:opacity-95 transition-all cursor-pointer"
              >
                <span>পরবর্তী প্রশ্ন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
