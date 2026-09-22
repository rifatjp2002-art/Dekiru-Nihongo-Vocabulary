import React, { useState, useEffect } from 'react';
import { WordItem, Lesson, UserWordProgress } from '../types';
import { getLessonsByBook, getAllWordsByBook } from '../data/lessonsData';
import { Volume2, RotateCw, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Bookmark, Flame, Calendar, Eye, EyeOff, Image as ImageIcon, ImageOff } from 'lucide-react';
import { speakJapanese } from '../utils/audio';
import { getUserWordProgress, saveWordProgress, toggleBookmark, getAllWordProgress } from '../db/storage';
import { calculateSRS } from '../utils/srs';
import { useBookStore } from '../store/bookStore';

interface FlashcardViewProps {
  initialLessonNumber?: number;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ initialLessonNumber = 1 }) => {
  const { currentBook } = useBookStore();
  const LESSONS = getLessonsByBook(currentBook);
  const ALL_WORDS = getAllWordsByBook(currentBook);

  const [selectedLesson, setSelectedLesson] = useState<number>(initialLessonNumber);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [srsData, setSrsData] = useState<UserWordProgress | null>(null);

  // Sorting Mode Preference
  const [sortMode, setSortMode] = useState<'sequential' | 'smart'>(() => {
    const saved = localStorage.getItem('flashcard_sort_mode');
    return (saved as 'sequential' | 'smart') || 'smart';
  });

  const [orderedWords, setOrderedWords] = useState<WordItem[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, UserWordProgress>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);

  // Preference toggles with localStorage persistence
  const [showFurigana, setShowFurigana] = useState<boolean>(() => {
    const saved = localStorage.getItem('srs_show_furigana');
    return saved !== null ? saved === 'true' : true;
  });
  const [showVisuals, setShowVisuals] = useState<boolean>(() => {
    const saved = localStorage.getItem('srs_show_visuals');
    return saved !== null ? saved === 'true' : true;
  });

  // Handle updates across views instantly via storage event or manual state updates
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

  // Load and order words whenever lesson or sorting mode changes
  useEffect(() => {
    async function loadAndOrderWords() {
      setLoading(true);
      const lessonWords = ALL_WORDS.filter(w => w.lessonNumber === selectedLesson);
      const progressList = await getAllWordProgress();
      const pMap = new Map(progressList.map(p => [p.wordId, p]));
      setProgressMap(pMap);

      if (sortMode === 'smart') {
        // New (0) < Learning (1) < Hard (2) < Medium (3) < Easy (4) < Mastered (5)
        const sorted = [...lessonWords].sort((a, b) => {
          const progA = pMap.get(a.id);
          const progB = pMap.get(b.id);

          const getWeight = (p: UserWordProgress | undefined) => {
            if (!p) return 0; // New
            if (p.status === 'mastered') return 5;
            if (p.difficulty === 'easy') return 4;
            if (p.difficulty === 'medium') return 3;
            if (p.difficulty === 'hard') return 2;
            if (p.status === 'learning') return 1;
            return 0; // default
          };

          return getWeight(progA) - getWeight(progB);
        });
        setOrderedWords(sorted);
      } else {
        setOrderedWords(lessonWords);
      }
      
      setCurrentIndex(0);
      setIsFlipped(false);
      setLoading(false);
    }
    loadAndOrderWords();
  }, [selectedLesson, sortMode, currentBook]);

  const currentWord = orderedWords[currentIndex] || orderedWords[0];

  useEffect(() => {
    async function loadWordProgress() {
      if (currentWord) {
        const p = await getUserWordProgress(currentWord.id);
        setIsBookmarked(p?.bookmarked || false);
        setSrsData(p || null);
      } else {
        setIsBookmarked(false);
        setSrsData(null);
      }
    }
    loadWordProgress();
  }, [currentWord, currentIndex, selectedLesson]);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < orderedWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(orderedWords.length - 1);
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent flipping the card
    if (!currentWord) return;
    const bookmarked = await toggleBookmark(currentWord.id);
    setIsBookmarked(bookmarked);
    
    const updatedProgress: UserWordProgress = srsData 
      ? { ...srsData, bookmarked } 
      : { wordId: currentWord.id, bookmarked, status: 'new', correctCount: 0, incorrectCount: 0 };
    
    setSrsData(updatedProgress);
    setProgressMap(prev => {
      const newMap = new Map(prev);
      newMap.set(currentWord.id, updatedProgress);
      return newMap;
    });
  };

  const handleRateSRS = async (quality: number) => {
    if (!currentWord) return;
    const progress = srsData || {
      wordId: currentWord.id,
      status: 'new' as const,
      correctCount: 0,
      incorrectCount: 0,
      bookmarked: isBookmarked
    };
    const updated = calculateSRS(progress, quality);
    await saveWordProgress(updated);
    setSrsData(updated);
    setProgressMap(prev => {
      const newMap = new Map(prev);
      newMap.set(currentWord.id, updated);
      return newMap;
    });
    
    // Smooth transition to next card after a short delay
    setTimeout(() => {
      handleNext();
    }, 400);
  };

  const handleMarkMastered = async () => {
    if (!currentWord) return;
    const now = new Date();
    const nextReview = new Date();
    nextReview.setDate(now.getDate() + 14); // Mastered words scheduled for review in 14 days

    const updated: UserWordProgress = {
      wordId: currentWord.id,
      status: 'mastered',
      correctCount: 5,
      incorrectCount: 0,
      interval: 14,
      easeFactor: 2.5,
      difficulty: 'easy',
      lastReviewed: now.toISOString(),
      nextReviewDate: nextReview.toISOString(),
      bookmarked: isBookmarked
    };
    await saveWordProgress(updated);
    setSrsData(updated);
    setProgressMap(prev => {
      const newMap = new Map(prev);
      newMap.set(currentWord.id, updated);
      return newMap;
    });
    handleNext();
  };

  if (loading || !currentWord) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-slate-900/80 border border-pink-950/50 rounded-3xl shadow-xl space-y-4">
        <Sparkles className="w-10 h-10 text-pink-400 mx-auto animate-pulse" />
        <span className="text-sm text-slate-400 block font-medium">শব্দগুলো লোড করা হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header & Lesson Selector */}
      <div className="bg-slate-900/80 border border-pink-950/50 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Flashcards</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">শব্দ শেখার ফ্ল্যাশকার্ড</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          {/* Sorting Order Preference */}
          <select
            value={sortMode}
            onChange={(e) => {
              const val = e.target.value as 'sequential' | 'smart';
              setSortMode(val);
              localStorage.setItem('flashcard_sort_mode', val);
            }}
            className="bg-slate-800 border border-slate-700 focus:border-pink-500 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold transition-colors"
          >
            <option value="smart">🧠 স্মার্ট রি-শিডিউল (নতুন ➡️ কঠিন)</option>
            <option value="sequential">🔢 ক্রমানুসারে (Sequential)</option>
          </select>

          {/* Lesson Selector */}
          <select
            value={selectedLesson}
            onChange={(e) => {
              setSelectedLesson(Number(e.target.value));
            }}
            className="bg-slate-800 border border-slate-700 focus:border-pink-500 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none cursor-pointer font-bold transition-colors"
          >
            {LESSONS.map((l) => (
              <option key={l.number} value={l.number}>
                Lesson {l.number}: {l.titleJp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress counter & Preferences Toggles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-slate-400 px-2 gap-3 sm:gap-0 pb-1">
        <div className="flex items-center gap-4">
          {loading ? (
            <span className="text-xs animate-pulse">লোড হচ্ছে...</span>
          ) : (
            <>
              <span>শব্দ {currentIndex + 1} / {orderedWords.length}</span>
              <span className="text-xs bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700 font-bold">লেসন {selectedLesson}</span>
            </>
          )}
        </div>
        
        {/* Preference Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFurigana();
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer text-[10px] font-bold ${
              showFurigana 
                ? 'bg-pink-500/10 text-pink-300 border-pink-500/30 shadow-inner' 
                : 'bg-slate-800/80 text-slate-500 border-slate-700/80 hover:text-slate-300'
            }`}
            title="ফুরিগানা [ふりがな] অন/অফ"
          >
            {showFurigana ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>ফুরিগানা</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleVisuals();
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer text-[10px] font-bold ${
              showVisuals 
                ? 'bg-pink-500/10 text-pink-300 border-pink-500/30 shadow-inner' 
                : 'bg-slate-800/80 text-slate-500 border-slate-700/80 hover:text-slate-300'
            }`}
            title="ছবি ও ইমোজি [🎨] অন/অফ"
          >
            {showVisuals ? <ImageIcon className="w-3.5 h-3.5" /> : <ImageOff className="w-3.5 h-3.5" />}
            <span>ইমোজি</span>
          </button>
        </div>
      </div>

      {/* Flashcard Card with Flip Effect */}
      <div
        id="flashcard-container"
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative h-96 w-full cursor-pointer perspective-1000 group select-none"
      >
        <div 
          id="flashcard-flipper"
          className="relative w-full h-full rounded-3xl transition-transform duration-500 transform-style-3d shadow-2xl"
          style={{
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            WebkitTransform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          
          {/* Front Side */}
          <div 
            id="flashcard-front"
            className={`card-face-front absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-pink-950/40 border border-pink-950/80 rounded-3xl p-8 flex flex-col items-center justify-between backface-hidden ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg) translateZ(1px)',
              WebkitTransform: 'rotateY(0deg) translateZ(1px)',
            }}
          >
            <div className="w-full flex items-center justify-between">
              <span className="text-xs px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/30">
                Front Side (উল্টাতে ক্লিক করুন)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleBookmark}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isBookmarked 
                      ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/30' 
                      : 'bg-pink-600/10 hover:bg-pink-600/20 text-pink-300 border-pink-500/30'
                  }`}
                  title="বুকমার্ক করুন"
                >
                  <Bookmark className="w-4.5 h-4.5 fill-current" />
                </button>
                <button
                  id="btn-speak-front"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakJapanese(currentWord.japanese);
                  }}
                  className="p-2.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 transition-colors"
                  title="উচ্চারণ শুনুন"
                >
                  <Volume2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            <div className="text-center space-y-4">
              {showVisuals && (
                <span className="text-7xl block p-4 bg-slate-800/60 rounded-3xl border border-slate-700/50 w-28 h-28 mx-auto flex items-center justify-center shadow-inner animate-fade-in">
                  {currentWord.emoji}
                </span>
              )}
              <h3 className="text-5xl font-extrabold text-white tracking-wide">{currentWord.japanese}</h3>
              
              {showFurigana || isFlipped ? (
                <p className="text-xl font-medium text-pink-400 animate-fade-in">[{currentWord.reading}]</p>
              ) : (
                <p className="text-sm font-medium text-slate-600 select-none animate-fade-in" onClick={(e) => { e.stopPropagation(); toggleFurigana(); }} title="ফুরিগানা দেখতে ক্লিক করুন">
                  [ふりがな লুকানো - দেখতে চাপুন]
                </p>
              )}
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              <RotateCw className="w-4 h-4 text-pink-400" />
              <span>কার্ড উল্টাতে ক্লিক করুন</span>
            </div>
          </div>

          {/* Back Side */}
          <div 
            id="flashcard-back"
            className={`card-face-back absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-pink-950/30 to-slate-900 border border-pink-500/30 rounded-3xl p-8 flex flex-col items-center justify-between backface-hidden ${isFlipped ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1px)',
              WebkitTransform: 'rotateY(180deg) translateZ(1px)',
            }}
          >
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  Back Side
                </span>
                {srsData?.difficulty && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    srsData.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                    srsData.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {srsData.difficulty === 'hard' ? 'কঠিন (Hard)' :
                     srsData.difficulty === 'medium' ? 'মাঝারি (Med)' :
                     'সহজ (Easy)'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleBookmark}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isBookmarked 
                      ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/30' 
                      : 'bg-pink-600/10 hover:bg-pink-600/20 text-pink-300 border-pink-500/30'
                  }`}
                  title="বুকমার্ক করুন"
                >
                  <Bookmark className="w-4.5 h-4.5 fill-current" />
                </button>
                <button
                  id="btn-speak-back"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakJapanese(currentWord.japanese);
                  }}
                  className="p-2.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 transition-colors"
                  title="উচ্চারণ শুনুন"
                >
                  <Volume2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            <div className="text-center space-y-4 max-w-md w-full">
              <div className="space-y-2 bg-slate-800/60 border border-slate-700 p-5 rounded-2xl shadow-inner">
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">বাংলা অর্থ</div>
                <div className="text-3xl font-bold text-white">{currentWord.bengali}</div>
                <div className="text-sm text-pink-300 font-medium mt-1">English: {currentWord.english}</div>
              </div>

              {currentWord.exampleJp && (
                <div className="text-xs sm:text-sm text-slate-200 bg-pink-950/40 border border-pink-500/20 p-4 rounded-xl space-y-1.5 text-left">
                  <div className="text-pink-300 font-semibold">বাক্যে ব্যবহার:</div>
                  <div>{currentWord.exampleJp}</div>
                  <div className="text-slate-400">{currentWord.exampleBn}</div>
                </div>
              )}
            </div>

            {/* SRS Spaced Repetition Rating Panel */}
            <div className="w-full space-y-1.5 pt-2 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
              <p className="text-[11px] text-slate-400 font-semibold mb-1 text-center">শব্দটি আপনার কাছে কেমন লেগেছে?</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRateSRS(3)}
                  className="px-2 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>কঠিন (Hard)</span>
                </button>
                <button
                  onClick={() => handleRateSRS(4)}
                  className="px-2 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>মাঝারি (Med)</span>
                </button>
                <button
                  onClick={() => handleRateSRS(5)}
                  className="px-2 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>সহজ (Easy)</span>
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-800/80 px-4 py-1.5 rounded-xl border border-slate-700">
              <RotateCw className="w-3.5 h-3.5 text-pink-400" />
              <span>সামনে ফিরতে ক্লিক করুন</span>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <button
          onClick={handlePrev}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-semibold text-sm transition-all cursor-pointer shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 text-pink-400" />
          <span>পূর্ববর্তী</span>
        </button>

        <button
          onClick={handleMarkMastered}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-sm border border-emerald-500/30 transition-all cursor-pointer shadow-lg"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>মুখস্থ হয়েছে</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold text-sm shadow-lg shadow-pink-600/30 hover:opacity-95 transition-all cursor-pointer"
        >
          <span>পরবর্তী</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
