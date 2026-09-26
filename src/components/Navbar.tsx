import React from 'react';
import { 
  BookOpen, 
  BarChart3, 
  Layers, 
  Repeat, 
  Award, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  Cloud, 
  RefreshCw, 
  LogIn, 
  LogOut,
  Settings
} from 'lucide-react';
import { User } from 'firebase/auth';
import { useBookStore } from '../store/bookStore';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: 'dashboard' | 'lessons' | 'flashcards' | 'review' | 'quiz';
  setActiveTab: (tab: 'dashboard' | 'lessons' | 'flashcards' | 'review' | 'quiz') => void;
  isOnline: boolean;
  user: User | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  onLogin: () => void;
  onLogout: () => void;
  onSync: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOnline,
  user,
  syncStatus,
  onLogin,
  onLogout,
  onSync,
  onOpenSettings
}) => {
  const { currentBook, setBook } = useBookStore();
  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: BarChart3 },
    { id: 'lessons', label: '১৫টি লেসন', labelEn: 'Lessons', icon: BookOpen },
    { id: 'flashcards', label: 'শব্দ শেখা', labelEn: 'Flashcards', icon: Layers },
    { id: 'review', label: 'রিভিও', labelEn: 'Review', icon: Repeat },
    { id: 'quiz', label: 'কুইজ', labelEn: 'Quiz', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-pink-950/50 shadow-lg shadow-pink-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Title */}
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                Dekiru A1-B1
              </h1>
              <select
                value={currentBook}
                onChange={(e) => setBook(e.target.value as 'book1' | 'book2')}
                className="bg-slate-900 text-pink-300 text-[11px] font-bold py-1 px-1.5 rounded-lg border border-pink-500/30 focus:outline-none focus:border-pink-500 cursor-pointer mt-0.5"
              >
                <option value="book1">📘 Shokyu (প্রাথমিক)</option>
                <option value="book2">📙 Shokyuchu (প্রাক-মধ্যম)</option>
              </select>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-pink-950/40">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-pink-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Status, Sync & Auth badges */}
          <div className="flex items-center gap-2">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Online/Offline status */}
            <div className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isOnline 
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' 
                : 'bg-amber-950/40 text-amber-300 border-amber-800/50'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
              <span>{isOnline ? 'অনলাইন' : 'অফলাইন'}</span>
            </div>

            {/* Cloud Sync Status Button */}
            {user && isOnline && (
              <button
                onClick={onSync}
                disabled={syncStatus === 'syncing'}
                title="এখনই ক্লাউড ব্যাকআপ সিঙ্ক করুন"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer transition-all ${
                  syncStatus === 'syncing'
                    ? 'bg-blue-950/40 text-blue-300 border-blue-800/50 animate-pulse'
                    : syncStatus === 'error'
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/30'
                    : 'bg-pink-950/40 text-pink-300 border-pink-800/50 hover:bg-pink-900/30'
                }`}
              >
                <Cloud className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-bounce' : 'text-pink-400'}`} />
                <span className="hidden sm:inline">
                  {syncStatus === 'syncing' ? 'সিঙ্ক হচ্ছে...' : 'ব্যাকআপ করুন'}
                </span>
                <RefreshCw className={`w-2.5 h-2.5 ml-0.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Settings trigger */}
            <button
              onClick={onOpenSettings}
              title="সেটিংস ও ব্যাকআপ"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-pink-400 rounded-xl cursor-pointer transition-colors border border-slate-800 hover:border-pink-500/20 flex items-center justify-center"
            >
              <Settings className="w-4.5 h-4.5 text-pink-400" />
            </button>

            {/* User Auth Section */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-900/80 pl-2 pr-1 py-1 rounded-xl border border-pink-950/40">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-lg object-cover border border-pink-500/20"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 text-xs font-bold">
                    {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-slate-200 max-w-[80px] truncate">
                  {user.displayName?.split(' ')[0]}
                </span>
                <button
                  onClick={onLogout}
                  title="লগ আউট করুন"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-bold shadow-md shadow-pink-600/20 hover:opacity-95 cursor-pointer transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>ক্লাউড ব্যাকআপ</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-medium transition-all ${
                  isActive ? 'text-pink-400 bg-pink-950/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
