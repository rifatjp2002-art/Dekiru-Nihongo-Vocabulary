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
import { auth, signInWithGoogle, signOutUser, syncAll } from './db/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lessons' | 'flashcards' | 'review' | 'quiz'>('dashboard');
  const [selectedLessonNumber, setSelectedLessonNumber] = useState<number | null>(null);
  const [lastSelectedLesson, setLastSelectedLesson] = useState<number>(1);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

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

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
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
      await signInWithGoogle();
    } catch (err) {
      console.error('Error logging in:', err);
      setSyncStatus('error');
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
    </div>
  );
}
