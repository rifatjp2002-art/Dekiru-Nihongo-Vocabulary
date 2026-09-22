import React, { useState, useEffect } from 'react';
import { WordItem, UserWordProgress } from '../types';
import { getAllWordsByBook } from '../data/lessonsData';
import { getAllWordProgress, saveWordProgress, toggleBookmark } from '../db/storage';
import { calculateSRS } from '../utils/srs';
import { Repeat, Volume2, Bookmark, CheckCircle2, ArrowRight, Sparkles, Clock, Flame, Calendar, BookOpen, AlertCircle, Eye, EyeOff, Image as ImageIcon, ImageOff } from 'lucide-react';
import { speakJapanese } from '../utils/audio';
import { useBookStore } from '../store/bookStore';

interface ReviewViewProps {
  onNavigateLessons: () => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({ onNavigateLessons }) => {
  const { currentBook } = useBookStore();
  const ALL_WORDS = getAllWordsByBook(currentBook);

  const [activeTab, setActiveTab] = useState<'due' | 'hard' | 'bookmarked'>('due');
  const [reviewWords, setReviewWords] = useState<WordItem[]>([]);
  const [completedWordIds, setCompletedWordIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Progress map
  const [progressMap, setProgressMap] = useState<Map<string, UserWordProgress>>(new Map());

  // Preference toggles with localStorage persistence
  const [showFurigana, setShowFurigana] = useState<boolean>(() => {
    const saved = localStorage.getItem('srs_show_furigana');
    return saved !== null ? saved === 'true' : true;
  });
  const [showVisuals, setShowVisuals] = useState<boolean>(() => {
    const saved = localStorage.getItem('srs_show_visuals');
    return saved !== null ? saved === 'true' : true;
  });

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
  
  // Stats counters
  const [stats, setStats] = useState({
    dueCount: 0,
    hardCount: 0,
    bookmarkedCount: 0,
    masteredCount: 0
  });

  const loadData = async () => {
    const rawProgressList = await getAllWordProgress();
    
    // Filter progress list by current book
    const progressList = rawProgressList.filter(p => {
      const isB2 = p.wordId.startsWith('b2-');
      if (currentBook === 'book2') return isB2;
      return !isB2;
    });

    const map = new Map(progressList.map(p => [p.wordId, p]));
    setProgressMap(map);

    const now = new Date();
    
    // Count stats
    let due = 0;
    let hard = 0;
    let bookmarked = 0;
    let mastered = 0;

    progressList.forEach(p => {
      if (p.bookmarked) bookmarked++;
      if (p.status === 'mastered') mastered++;
      if (p.difficulty === 'hard') hard++;
      if (p.nextReviewDate && new Date(p.nextReviewDate) <= now) {
        due++;
      }
    });

    setStats({
      dueCount: due,
      hardCount: hard,
      bookmarkedCount: bookmarked,
      masteredCount: mastered
    });

    // Determine words to review based on active tab
    let filteredIds: string[] = [];
    if (activeTab === 'due') {
      filteredIds = progressList
        .filter(p => p.nextReviewDate && new Date(p.nextReviewDate) <= now)
        .map(p => p.wordId);
    } else if (activeTab === 'hard') {
      filteredIds = progressList
        .filter(p => p.difficulty === 'hard')
        .map(p => p.wordId);
    } else if (activeTab === 'bookmarked') {
      filteredIds = progressList
        .filter(p => p.bookmarked)
        .map(p => p.wordId);
    }

    const words = ALL_WORDS.filter(w => filteredIds.includes(w.id));
    setReviewWords(words);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  useEffect(() => {
    setCompletedWordIds(new Set());
    loadData();
  }, [activeTab, currentBook]);

  const visibleWords = reviewWords.filter(w => !completedWordIds.has(w.id));

  const currentWord = visibleWords[currentIndex] || visibleWords[0];
  const currentProgress = currentWord ? progressMap.get(currentWord.id) : undefined;

  const handleNext = () => {
    setShowAnswer(false);
    if (visibleWords.length === 0) return;
    if (currentIndex < visibleWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentWord) return;
    const bookmarked = await toggleBookmark(currentWord.id);
    
    // If in the bookmarked tab and we just unbookmarked, transition it out smoothly
    if (activeTab === 'bookmarked' && !bookmarked) {
      setCompletedWordIds(prev => {
        const nextSet = new Set(prev);
        nextSet.add(currentWord.id);
        return nextSet;
      });
      setCurrentIndex(0);
      setShowAnswer(false);
    }

    // Refresh data in background
    const progressList = await getAllWordProgress();
    const map = new Map(progressList.map(p => [p.wordId, p]));
    setProgressMap(map);

    let due = 0;
    let hard = 0;
    let bCount = 0;
    let mastered = 0;
    const now = new Date();
    progressList.forEach(p => {
      if (p.bookmarked) bCount++;
      if (p.status === 'mastered') mastered++;
      if (p.difficulty === 'hard') hard++;
      if (p.nextReviewDate && new Date(p.nextReviewDate) <= now) {
        due++;
      }
    });

    setStats({
      dueCount: due,
      hardCount: hard,
      bookmarkedCount: bCount,
      masteredCount: mastered
    });
  };

  const handleRateSRS = async (quality: number) => {
    if (!currentWord) return;
    const progress = currentProgress || {
      wordId: currentWord.id,
      status: 'learning' as const,
      correctCount: 0,
      incorrectCount: 0,
      bookmarked: false
    };
    
    const updated = calculateSRS(progress, quality);
    await saveWordProgress(updated);
    
    // Smooth transition: mark word as completed in the current session
    setTimeout(async () => {
      setCompletedWordIds(prev => {
        const nextSet = new Set(prev);
        nextSet.add(currentWord.id);
        return nextSet;
      });
      setShowAnswer(false);
      setCurrentIndex(0);

      // Refresh database records in the background without layout shifts
      const progressList = await getAllWordProgress();
      const map = new Map(progressList.map(p => [p.wordId, p]));
      setProgressMap(map);

      let due = 0;
      let hard = 0;
      let bookmarked = 0;
      let mastered = 0;
      const now = new Date();
      progressList.forEach(p => {
        if (p.bookmarked) bookmarked++;
        if (p.status === 'mastered') mastered++;
        if (p.difficulty === 'hard') hard++;
        if (p.nextReviewDate && new Date(p.nextReviewDate) <= now) {
          due++;
        }
      });

      setStats({
        dueCount: due,
        hardCount: hard,
        bookmarkedCount: bookmarked,
        masteredCount: mastered
      });
    }, 400);
  };

  const renderTabs = () => {
    const remainingDue = Math.max(0, stats.dueCount - (activeTab === 'due' ? completedWordIds.size : 0));
    const remainingHard = Math.max(0, stats.hardCount - (activeTab === 'hard' ? completedWordIds.size : 0));
    const remainingBookmarked = Math.max(0, stats.bookmarkedCount - (activeTab === 'bookmarked' ? completedWordIds.size : 0));

    return (
      <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('due')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'due'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <div className="flex flex-col sm:flex-row sm:gap-1.5 items-center">
            <span>রিভিও সময়</span>
            {remainingDue > 0 && (
              <span className="text-[10px] bg-white text-pink-600 px-1.5 py-0.5 rounded-full font-extrabold">
                {remainingDue}
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('hard')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'hard'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <div className="flex flex-col sm:flex-row sm:gap-1.5 items-center">
            <span>কঠিন শব্দ</span>
            {remainingHard > 0 && (
              <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-extrabold">
                {remainingHard}
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('bookmarked')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'bookmarked'
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <div className="flex flex-col sm:flex-row sm:gap-1.5 items-center">
            <span>বুকমার্ক</span>
            {remainingBookmarked > 0 && (
              <span className="text-[10px] bg-slate-800 text-pink-400 border border-pink-500/30 px-1.5 py-0.5 rounded-full font-extrabold">
                {remainingBookmarked}
              </span>
            )}
          </div>
        </button>
      </div>
    );
  };

  if (visibleWords.length === 0) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pb-12 animate-fade-in">
        {/* Header Tabs */}
        {renderTabs()}
        
        <div className="text-center py-12 px-6 bg-slate-900/80 border border-pink-950/50 rounded-3xl p-8 shadow-xl space-y-4">
          <Clock className="w-12 h-12 text-pink-400 mx-auto animate-pulse" />
          <h3 className="text-xl font-bold text-white">
            {activeTab === 'due' ? 'সব রিভিও সম্পন্ন হয়েছে! 🎉' :
             activeTab === 'hard' ? 'কঠিন চিহ্নিত কোনো শব্দ নেই! 🌟' :
             'বুকমার্ক করা কোনো শব্দ নেই! 📌'}
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            {activeTab === 'due' ? 'সাবাশ! এই মুহূর্তে আপনার রিভিও করার মতো কোনো শব্দ বাকি নেই। নতুন শব্দ শিখতে বা কুইজ দিয়ে অনুশীলন অব্যাহত রাখুন।' :
             activeTab === 'hard' ? 'কঠিন শব্দগুলো এখানে স্বয়ংক্রিয়ভাবে ফিল্টার হবে। আপনি ফ্ল্যাশকার্ড বা কুইজে ভুল করলে শব্দগুলো এখানে যুক্ত হবে।' :
             'শব্দ শেখার সময় বুকমার্ক আইকনে ক্লিক করে শব্দগুলো এখানে রিভিও লিস্টে যুক্ত করতে পারেন।'}
          </p>
          <button
            onClick={onNavigateLessons}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold text-sm shadow-lg shadow-pink-600/30 cursor-pointer hover:opacity-95 transition-opacity"
          >
            লেসনগুলো দেখুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header Tabs */}
      {renderTabs()}

      {/* Main Review Card */}
      {currentWord && (
        <div className="bg-slate-900/90 border border-pink-950/80 rounded-3xl p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Lesson {currentWord.lessonNumber} • {currentWord.category}
              </span>
              {currentProgress?.difficulty && (
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                  currentProgress.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                  currentProgress.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {currentProgress.difficulty === 'hard' ? 'কঠিন (Hard)' :
                   currentProgress.difficulty === 'medium' ? 'মাঝারি (Med)' :
                   'সহজ (Easy)'}
                </span>
              )}
            </div>
            
            {/* Preference Toggles in Card */}
            <div className="flex items-center gap-2 shrink-0">
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

              {/* Bookmark Toggle Button */}
              <button
                onClick={handleToggleBookmark}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer text-[10px] font-bold ${
                  currentProgress?.bookmarked 
                    ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20' 
                    : 'bg-slate-800/80 text-slate-500 hover:text-slate-300 border-slate-700/80'
                }`}
                title={currentProgress?.bookmarked ? "বুকমার্ক থেকে সরান" : "বুকমার্ক করুন"}
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>

              {/* Volume Button */}
              <button
                onClick={() => speakJapanese(currentWord.japanese)}
                className="p-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 transition-colors cursor-pointer"
                title="উচ্চারণ শুনুন"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 py-4">
            {showVisuals && <span className="text-5xl block animate-fade-in">{currentWord.emoji}</span>}
            <h3 className="text-5xl font-extrabold text-white tracking-wide">{currentWord.japanese}</h3>
            
            {showFurigana || showAnswer ? (
              <p className="text-xl font-medium text-pink-400 animate-fade-in">[{currentWord.reading}]</p>
            ) : (
              <p className="text-sm font-medium text-slate-600 select-none animate-fade-in cursor-pointer hover:text-slate-400 transition-colors" onClick={toggleFurigana} title="ফুরিগানা দেখতে ক্লিক করুন">
                [ふりがな লুকানো - দেখতে চাপুন]
              </p>
            )}
          </div>

          {showAnswer ? (
            <div className="space-y-4 bg-slate-800/60 border border-slate-700 p-6 rounded-2xl animate-fade-in text-left">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">বাংলা অর্থ:</span>
                <span className="text-2xl font-bold text-white">{currentWord.bengali}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">English:</span>
                <span className="text-slate-200 font-medium">{currentWord.english}</span>
              </div>
              {currentWord.exampleJp && (
                <div className="text-xs text-pink-300 pt-2 border-t border-slate-700 space-y-1">
                  <div className="font-semibold text-slate-400">বাক্যে ব্যবহার:</div>
                  <div className="text-white font-medium">{currentWord.exampleJp}</div>
                  <div className="text-slate-400">{currentWord.exampleBn}</div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-pink-300 font-bold text-sm border border-pink-500/30 transition-all cursor-pointer shadow-md"
            >
              উত্তর দেখুন (Show Answer)
            </button>
          )}

          {showAnswer && (
            <div className="space-y-4 pt-4 border-t border-slate-800/60 animate-fade-in">
              <p className="text-xs text-slate-400 font-semibold">শব্দটি স্মরণ করা কি সহজ ছিল?</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRateSRS(3)}
                  className="px-2 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>কঠিন (Hard)</span>
                </button>
                <button
                  onClick={() => handleRateSRS(4)}
                  className="px-2 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <Repeat className="w-4 h-4 text-amber-400" />
                  <span>মাঝারি (Med)</span>
                </button>
                <button
                  onClick={() => handleRateSRS(5)}
                  className="px-2 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>সহজ (Easy)</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation header info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>শব্দ {Math.min(currentIndex + 1, visibleWords.length)} / {visibleWords.length}</span>
            <span>Spaced Repetition Enabled</span>
          </div>

        </div>
      )}
    </div>
  );
};
