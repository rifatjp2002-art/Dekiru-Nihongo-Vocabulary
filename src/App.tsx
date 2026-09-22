/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { LessonsView } from './components/LessonsView';
import { LessonDetailView } from './components/LessonDetailView';
import { FlashcardView } from './components/FlashcardView';
import { ReviewView } from './components/ReviewView';
import { QuizView } from './components/QuizView';
import { SettingsModal } from './components/SettingsModal';
import { auth, signInWithGoogle, signOutUser, syncAll, checkRedirectResult } from './db/firebase';
import { startReminderScheduler } from './utils/notifications';
import { onAuthStateChanged, User } from 'firebase/auth';
import { AlertCircle, X, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lessons' | 'flashcards' | 'review' | 'quiz'>('dashboard');
  const [selectedLessonNumber, setSelectedLessonNumber] = useState<number | null>(null);
  const [lastSelectedLesson, setLastSelectedLesson] = useState<number>(1);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Firebase auth & sync states
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSynced, setLastSynced] = useState<string | null>(localStorage.getItem('lastSynced'));

  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Scroll to top on active tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Global Daily Notification Scheduler
  useEffect(() => {
    const cleanup = startReminderScheduler();
    return () => cleanup();
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    checkRedirectResult().catch((err) => console.error('Redirect sign-in error:', err));
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setAuthError(null);
        // Trigger automatic sync on login / application reload
        setSyncStatus('syncing');
        try {
          await syncAll(u.uid);
          setSyncStatus('synced');
          const timeString = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
          setLastSynced(timeString);
          localStorage.setItem('lastSynced', timeString);
        } catch (err) {
          console.error('Error during auto sync:', err);
          setSyncStatus('error');
        }
      } else {
        setSyncStatus('idle');
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto sync on returning online
  useEffect(() => {
    if (isOnline && user) {
      handleManualSync();
    }
  }, [isOnline]);

  const handleLogin = async () => {
    try {
      setSyncStatus('syncing');
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Error logging in:', err);
      setSyncStatus('error');
      if (err?.code === 'auth/unauthorized-domain') {
        setAuthError('unauthorized-domain');
      } else if (err?.code === 'auth/popup-blocked') {
        setAuthError('popup-blocked');
      } else if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(err?.message || 'লগইন ব্যর্থ হয়েছে');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      window.indexedDB.deleteDatabase('dekiru_nihongo_vocab_db');
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setSyncStatus('idle');
      window.location.reload();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleManualSync = async () => {
    if (!user || !isOnline) return;
    setSyncStatus('syncing');
    try {
      await syncAll(user.uid);
      setSyncStatus('synced');
      const timeString = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
      setLastSynced(timeString);
      localStorage.setItem('lastSynced', timeString);
    } catch (err) {
      console.error('Error during manual sync:', err);
      setSyncStatus('error');
    }
  };

  const handleSelectLesson = (lessonNumber: number) => {
    setSelectedLessonNumber(lessonNumber);
    setLastSelectedLesson(lessonNumber);
  };

  const handleStartFlashcardsForLesson = (lessonNumber: number) => {
    setLastSelectedLesson(lessonNumber);
    setSelectedLessonNumber(null);
    setActiveTab('flashcards');
  };

  const handleStartQuizForLesson = (lessonNumber: number) => {
    setLastSelectedLesson(lessonNumber);
    setSelectedLessonNumber(null);
    setActiveTab('quiz');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-pink-500 selection:text-white relative overflow-x-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'lessons') setSelectedLessonNumber(null);
        }}
        isOnline={isOnline}
        user={user}
        syncStatus={syncStatus}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSync={handleManualSync}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 relative z-10">
        {selectedLessonNumber !== null ? (
          <LessonDetailView
            lessonNumber={selectedLessonNumber}
            onBack={() => setSelectedLessonNumber(null)}
            onStartFlashcards={handleStartFlashcardsForLesson}
            onStartQuiz={handleStartQuizForLesson}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                onSelectLesson={handleSelectLesson}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  setSelectedLessonNumber(null);
                }}
                user={user}
                syncStatus={syncStatus}
                lastSynced={lastSynced}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onSync={handleManualSync}
                isOnline={isOnline}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}
            {activeTab === 'lessons' && (
              <LessonsView onSelectLesson={handleSelectLesson} />
            )}
            {activeTab === 'flashcards' && (
              <FlashcardView initialLessonNumber={lastSelectedLesson} />
            )}
            {activeTab === 'review' && (
              <ReviewView onNavigateLessons={() => setActiveTab('lessons')} />
            )}
            {activeTab === 'quiz' && (
              <QuizView initialLessonNumber={lastSelectedLesson} />
            )}
          </>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        syncStatus={syncStatus}
        lastSynced={lastSynced}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSync={handleManualSync}
        isOnline={isOnline}
      />

      {/* Auth Error Notification Modal */}
      {authError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-pink-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left">
            <button
              onClick={() => setAuthError(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-white">গুগল লগইন নোটিশ</h3>
            </div>
            {authError === 'unauthorized-domain' ? (
              <div className="space-y-3 text-sm text-slate-300">
                <p>
                  আপনার সাইটটি GitHub Pages ডোমেনে হোস্ট করায় ফায়ারবেসে ডোমেনটি অনুমতি দিতে হবে:
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-pink-300 break-all select-all">
                  rifatjp2002-art.github.io
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains-এ গিয়ে উপরের ডোমেনটি যোগ (Add domain) করলেই সরাসরি গুগল লগইন সচল হয়ে যাবে।
                </p>
              </div>
            ) : authError === 'popup-blocked' ? (
              <p className="text-sm text-slate-300">
                আপনার ব্রাউজারে পপআপ ব্লক করা আছে। অনুগ্রহ করে ব্রাউজার সেটিংসে গিয়ে পপআপ উইন্ডো এলাউ (Allow) করুন।
              </p>
            ) : (
              <p className="text-sm text-slate-300">{authError}</p>
            )}
            <button
              onClick={() => setAuthError(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
