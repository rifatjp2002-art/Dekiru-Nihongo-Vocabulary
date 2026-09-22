import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Flame, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  Play, 
  BookMarked, 
  Sparkles,
  Bell,
  BellOff,
  Cloud,
  RefreshCw,
  LogIn,
  LogOut,
  Clock,
  ShieldCheck,
  Settings,
  Calendar,
  Volume2
} from 'lucide-react';
import { getLessonsByBook, getAllWordsByBook } from '../data/lessonsData';
import { getAllWordProgress, getAllQuizResults, getUserStats } from '../db/storage';
import { speakJapanese } from '../utils/audio';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { User } from 'firebase/auth';
import { useBookStore } from '../store/bookStore';
import { ResetConfirmModal } from './ResetConfirmModal';

interface DashboardViewProps {
  onSelectLesson: (lessonNumber: number) => void;
  onNavigateTab: (tab: 'lessons' | 'flashcards' | 'review' | 'quiz') => void;
  user: User | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSynced: string | null;
  onLogin: () => void;
  onLogout: () => void;
  onSync: () => void;
  isOnline: boolean;
  onOpenSettings: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onSelectLesson, 
  onNavigateTab,
  user,
  syncStatus,
  lastSynced,
  onLogin,
  onLogout,
  onSync,
  isOnline,
  onOpenSettings
}) => {
  const { currentBook, setBook } = useBookStore();
  const LESSONS = getLessonsByBook(currentBook);
  const ALL_WORDS = getAllWordsByBook(currentBook);

  const [stats, setStats] = useState({ streakDays: 1, totalQuizzesTaken: 0, wordsMasteredCount: 0 });
  const [learnedCount, setLearnedCount] = useState(0);
  const [bookmarkedCount, setBookmarkedCount] = useState(0);
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [showQuizReports, setShowQuizReports] = useState<boolean>(true);

  // Local Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('notificationsEnabled') === 'true' && ('Notification' in window && Notification.permission === 'granted');
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem('reminderTime') || '21:00';
  });
  const [testSent, setTestSent] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [wordOffset, setWordOffset] = useState<number>(0);

  // Daily Reminder Scheduler
  useEffect(() => {
    if (!notificationsEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      const lastTriggered = localStorage.getItem('lastNotificationTriggerDate');
      const todayString = now.toDateString();

      if (currentTime === reminderTime && lastTriggered !== todayString) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Dekiru Nihongo', {
            body: 'আজকের জাপানি শব্দগুলো রিভিশন দেওয়ার সময় হয়েছে! 🌸',
            icon: 'https://cdn-icons-png.flaticon.com/512/188/188333.png'
          });
          localStorage.setItem('lastNotificationTriggerDate', todayString);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [notificationsEnabled, reminderTime]);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      localStorage.setItem('notificationsEnabled', 'false');
      setNotificationsEnabled(false);
      return;
    }

    if (!('Notification' in window)) {
      alert('দুঃখিত, আপনার ব্রাউজারটি পুশ নোটিফিকেশন সমর্থন করে না।');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem('notificationsEnabled', 'true');
      setNotificationsEnabled(true);
      
      new Notification('Dekiru Nihongo', {
        body: 'অভিনন্দন! দৈনিক জাপানি শব্দ অনুশীলনের রিমাইন্ডার সফলভাবে চালু হয়েছে। 🌸',
        icon: 'https://cdn-icons-png.flaticon.com/512/188/188333.png'
      });
    } else {
      alert('নোটিফিকেশন অনুমতি প্রত্যাখ্যান করা হয়েছে। দয়া করে ব্রাউজার সেটিংস থেকে পারমিশন দিন।');
    }
  };

  const sendTestNotification = () => {
    if (!('Notification' in window)) {
      alert('দুঃখিত, আপনার ব্রাউজারটি পুশ নোটিফিকেশন সমর্থন করে না。');
      return;
    }

    if (Notification.permission !== 'granted') {
      handleToggleNotifications();
      return;
    }
    
    new Notification('Dekiru Nihongo', {
      body: 'আজকের জাপানি শব্দগুলো রিভিশন দেওয়ার সময় হয়েছে! 🌸',
      icon: 'https://cdn-icons-png.flaticon.com/512/188/188333.png'
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReminderTime(val);
    localStorage.setItem('reminderTime', val);
  };

  useEffect(() => {
    async function loadData() {
      const userStats = await getUserStats();
      const pList = await getAllWordProgress();
      const quizzes = await getAllQuizResults();

      setStats(userStats);
      setProgressList(pList);
      
      // Filter counts based on current book selection (using wordId prefix)
      const learned = pList.filter(p => {
        const isB2 = p.wordId.startsWith('b2-');
        if (currentBook === 'book2' && !isB2) return false;
        if (currentBook === 'book1' && isB2) return false;
        return p.status === 'mastered' || p.status === 'learning';
      }).length;

      const bookmarked = pList.filter(p => {
        const isB2 = p.wordId.startsWith('b2-');
        if (currentBook === 'book2' && !isB2) return false;
        if (currentBook === 'book1' && isB2) return false;
        return p.bookmarked;
      }).length;

      const filteredQuizzes = quizzes.filter(q => {
        // If q.book matches, or defaults to book1
        const qBook = q.book || 'book1';
        return qBook === currentBook;
      });

      setLearnedCount(learned);
      setBookmarkedCount(bookmarked);
      setRecentQuizzes(filteredQuizzes.slice(-10).reverse());
    }
    loadData();
  }, [currentBook]);

  // Prepare chart data showing learned vs total words for all lessons
  const chartData = LESSONS.map((lesson) => {
    const lessonWords = ALL_WORDS.filter(w => w.lessonNumber === lesson.number);
    const learnedInLesson = lessonWords.filter(w => {
      const p = progressList.find(item => item.wordId === w.id);
      return p && (p.status === 'mastered' || p.status === 'learning');
    }).length;
    return {
      name: `L-${lesson.number}`,
      learned: learnedInLesson,
      total: lessonWords.length,
      label: `L${lesson.number}: ${learnedInLesson}/${lessonWords.length}`
    };
  });

  const totalWords = ALL_WORDS.length;
  const progressPercent = Math.round((learnedCount / totalWords) * 100) || 0;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-950/80 via-slate-900 to-rose-950/70 p-8 border border-pink-500/20 shadow-xl shadow-pink-950/30">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentBook === 'book2' ? 'できる日本語 初中級 • Complete 15 Lessons' : 'できる日本語 初級 • Complete 15 Lessons'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
            {currentBook === 'book2' ? 'Dekiru Nihongo Shokyuchu (প্রাক-মধ্যম) শব্দমালা ✨' : 'Dekiru Nihongo Shokyu (প্রাথমিক) শব্দমালা ✨'}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            {currentBook === 'book2' 
              ? 'দ্বিতীয় বই বা প্রাক-মধ্যম লেভেলের ১৫টি লেসনের সমস্ত শব্দ, অর্থ, উচ্চারণ, রিভিও এবং কুইজের মাধ্যমে আপনার দক্ষতা বৃদ্ধি করুন।'
              : 'প্রথম বই বা প্রাথমিক লেভেলের ১৫টি লেসনের সমস্ত শব্দ, অর্থ, উচ্চারণ, রিভিও এবং কুইজের মাধ্যমে আপনার দক্ষতা যাচাই করুন।'}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('flashcards')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold text-sm shadow-lg shadow-pink-600/30 hover:opacity-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>শব্দ শেখা শুরু করুন</span>
            </button>
            <button
              onClick={() => onNavigateTab('quiz')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-pink-300 font-semibold text-sm border border-pink-500/20 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>কুইজে অংশ নিন</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-semibold text-sm border border-slate-800 hover:border-pink-500/10 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-pink-400" />
              <span>সেটিংস ও ব্যাকআপ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-pink-950/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">মোট শব্দ শেখা</span>
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
            {learnedCount} <span className="text-xs text-slate-400 font-normal">/ {totalWords}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-pink-950/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">ডেইলি স্ট্রীক</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
            {stats.streakDays} দিন <span className="text-xs text-orange-400 font-normal">🔥</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">নিয়মিত চর্চা চালিয়ে যান</p>
        </div>

        <div className="bg-slate-900/80 border border-pink-950/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">স্টাডি টাইম (পড়ার সময়)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
            {(() => {
              const [mins, setMins] = useState<number>(() => {
                const saved = localStorage.getItem('study_time_minutes');
                return saved ? parseInt(saved, 10) : 5;
              });
              useEffect(() => {
                const interval = setInterval(() => {
                  setMins(prev => {
                    const next = prev + 1;
                    localStorage.setItem('study_time_minutes', String(next));
                    return next;
                  });
                }, 60000); // every minute
                return () => clearInterval(interval);
              }, []);
              const hrs = Math.floor(mins / 60);
              const m = mins % 60;
              return hrs > 0 ? `${hrs} ঘণ্টা ${m} মিনিট` : `${mins} মিনিট`;
            })()}
          </div>
          <p className="text-xs text-slate-400 mt-3">আজকের সক্রিয় সময়</p>
        </div>

        <div className="bg-slate-900/80 border border-pink-950/50 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">সম্পন্ন কুইজ</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
            {recentQuizzes.length} বার
          </div>
          <p className="text-xs text-slate-400 mt-3">দক্ষতা যাচাই সম্পন্ন</p>
        </div>
      </div>

      {/* Main Grid: Analytical Report & Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Quiz Reports Card */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-pink-950/50 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="text-pink-400 w-5 h-5" />
                  <span>সাম্প্রতিক কুইজ রিপোর্ট</span>
                </h3>
                <p className="text-xs text-slate-400">আপনার শেষ কয়েকটি কুইজের ফলাফল ও দক্ষতা</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowQuizReports(!showQuizReports)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  {showQuizReports ? 'হাইড করুন 👁️‍🗨️' : 'সব দেখুন 👁️'}
                </button>
                <button
                  onClick={() => onNavigateTab('quiz')}
                  className="text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors cursor-pointer"
                >
                  নতুন কুইজ দিন →
                </button>
              </div>
            </div>

            {showQuizReports && (
              recentQuizzes.length > 0 ? (
                <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar animate-fade-in">
                  {recentQuizzes.map((quiz, idx) => {
                    const percent = Math.round((quiz.score / quiz.totalQuestions) * 100);
                    const modeLabels: Record<string, string> = {
                      meaning: 'অর্থ পরীক্ষা 📝',
                      listening: 'লিসেনিং পরীক্ষা 🎧',
                      typing: 'টাইপিং পরীক্ষা ⌨️'
                    };
                    return (
                      <div 
                        key={quiz.id || idx}
                        className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/25 flex items-center justify-center font-bold text-pink-300 text-xs">
                            L{quiz.lessonNumber}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">লেসন {quiz.lessonNumber} - কুইজ</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[10px] font-medium bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800/80 text-slate-400">
                                {modeLabels[quiz.mode] || quiz.mode}
                              </span>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                {quiz.date}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0">
                          <div className="text-left sm:text-right">
                            <span className="text-xs text-slate-400 block sm:inline mr-1">স্কোর:</span>
                            <span className={`text-sm font-extrabold ${percent >= 80 ? 'text-emerald-400' : percent >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {quiz.score} / {quiz.totalQuestions}
                            </span>
                          </div>
                          <div className="w-14 text-center">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                              percent >= 80 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : percent >= 50 
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' 
                                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            }`}>
                              {percent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-800/20 border border-slate-800/50 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[260px]">
                  <Award className="w-12 h-12 text-slate-700 mb-3" />
                  <h4 className="text-sm font-bold text-slate-300 mb-1">কোনো কুইজ নেওয়া হয়নি</h4>
                  <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
                    আপনার কুইজের অগ্রগতি ট্র্যাক করতে যেকোনো লেসনের ওপর কুইজ পরীক্ষা দিন। এতে আপনার জ্ঞান দীর্ঘস্থায়ী হবে।
                  </p>
                  <button
                    onClick={() => onNavigateTab('quiz')}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/15 cursor-pointer transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>প্রথম কুইজ শুরু করুন</span>
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Word of the Day Card - Hourly Dynamic Across All Words */}
        {(() => {
          const currentHourSlot = Math.floor(Date.now() / (1000 * 60 * 60));
          const wordIndex = Math.abs((currentHourSlot * 73 + wordOffset * 47) % ALL_WORDS.length);
          const wordOfTheHour = ALL_WORDS[wordIndex] || ALL_WORDS[0];
          return (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-pink-950/40 border border-pink-950/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>বিশেষ শব্দ (ঘণ্টায় পরিবর্তিত)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setWordOffset(prev => prev + 1)}
                      className="text-[11px] text-pink-300 hover:text-white flex items-center gap-1 bg-pink-500/10 hover:bg-pink-500/20 px-2.5 py-1 rounded-lg border border-pink-500/30 transition-all cursor-pointer"
                      title="আরেকটি নতুন শব্দ দেখুন"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>পরবর্তী শব্দ</span>
                    </button>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 font-bold">
                      লেসন {wordOfTheHour.lessonNumber}
                    </span>
                  </div>
                </div>

                <div className="text-center py-5 bg-slate-800/40 border border-slate-800/80 rounded-2xl p-4 mb-4 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => speakJapanese(wordOfTheHour.japanese)}
                      className="p-2 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 transition-colors cursor-pointer"
                      title="উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                  <span className="text-5xl block mb-2">{wordOfTheHour.emoji}</span>
                  <h3 className="text-3xl font-extrabold text-white mb-1">{wordOfTheHour.japanese}</h3>
                  <p className="text-sm font-medium text-pink-400 mb-3">[{wordOfTheHour.reading}]</p>
                  <div className="text-xl font-bold text-slate-100">{wordOfTheHour.bengali}</div>
                  <div className="text-xs text-slate-400 mt-1">English: {wordOfTheHour.english}</div>
                </div>

                {wordOfTheHour.exampleJp && (
                  <div className="text-xs text-slate-300 bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-xl space-y-1">
                    <div className="text-pink-300 font-bold">উদাহরণ:</div>
                    <div className="font-medium">{wordOfTheHour.exampleJp}</div>
                    <div className="text-slate-400">{wordOfTheHour.exampleBn}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onNavigateTab('flashcards')}
                className="w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-pink-600/20 hover:opacity-95 transition-all cursor-pointer"
              >
                <span>ফ্ল্যাশকার্ডে অনুশীলন করুন</span>
              </button>
            </div>
          );
        })()}
      </div>

      {/* Progress Chart Full Width */}
      <div className="bg-slate-900/80 border border-pink-950/50 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              <span>শেখার অগ্রগতি (Progress Chart)</span>
            </h3>
            <p className="text-xs text-slate-400">লেসন অনুযায়ী শব্দ শেখার পরিসংখ্যান</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetModal(true)}
              type="button"
              className="text-[11px] font-bold px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all cursor-pointer pointer-events-auto"
            >
              🔄 সমস্ত ডেটা রিসেট করুন
            </button>
            <div className="text-xs font-bold text-pink-400 bg-pink-500/10 px-3 py-1.5 rounded-xl border border-pink-500/20">
              সামগ্রিক সম্পন্ন: {progressPercent}%
            </div>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#831843', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="words" fill="#db2777" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ec4899' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Custom In-App Reset Confirmation Modal */}
      <ResetConfirmModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
      />
    </div>
  );
};
