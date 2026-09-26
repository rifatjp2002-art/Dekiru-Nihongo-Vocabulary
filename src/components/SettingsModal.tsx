import React, { useEffect, useState } from 'react';
import { 
  X, 
  Cloud, 
  Bell, 
  BellOff, 
  RefreshCw, 
  LogIn, 
  LogOut, 
  Clock, 
  ShieldCheck, 
  Wifi, 
  WifiOff,
  Mail,
  User as UserIcon,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ResetConfirmModal } from './ResetConfirmModal';
import { sendNotification, requestNotificationPermission } from '../utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSynced: string | null;
  onLogin: () => void;
  onLogout: () => void;
  onSync: () => void;
  isOnline: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  syncStatus,
  lastSynced,
  onLogin,
  onLogout,
  onSync,
  isOnline
}) => {
  // Local Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('notificationsEnabled') === 'true' && 
      ('Notification' in window && Notification.permission === 'granted');
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem('reminderTime') || '21:00';
  });
  const [devPhotoUrl, setDevPhotoUrl] = useState<string>(() => {
    return localStorage.getItem('devPhotoUrl') || 'https://i.postimg.cc/fJKXQ1MP/image.jpg';
  });
  const [testSent, setTestSent] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setDevPhotoUrl(result);
      localStorage.setItem('devPhotoUrl', result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!isOpen) return;
    // Keep notification states in sync with storage when modal opens
    setNotificationsEnabled(
      localStorage.getItem('notificationsEnabled') === 'true' && 
      ('Notification' in window && Notification.permission === 'granted')
    );
    setReminderTime(localStorage.getItem('reminderTime') || '21:00');
  }, [isOpen]);

  if (!isOpen) return null;

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

    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        localStorage.setItem('notificationsEnabled', 'true');
        setNotificationsEnabled(true);
        
        await sendNotification('Dekiru A1-B1 🌸', 'অভিনন্দন! দৈনিক জাপানি শব্দ অনুশীলনের রিমাইন্ডার সফলভাবে চালু হয়েছে।');
      } else {
        alert('নোটিফিকেশন অনুমতি প্রত্যাখ্যান করা হয়েছে। রিমাইন্ডার সক্রিয় করতে দয়া করে ব্রাউজার সেটিংস থেকে অনুমতি (Permission) দিন।');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      alert('আইফ্রেম সীমাবদ্ধতা: দয়া করে আপনার লাইভ ওয়েবসাইটটি (GitHub Pages) সরাসরি ব্রাউজারে ওপেন করে নোটিফিকেশন অনুমতি দিন।');
    }
  };

  const sendTestNotification = async () => {
    if (!('Notification' in window)) {
      alert('দুঃখিত, আপনার ব্রাউজারটি পুশ নোটিফিকেশন সমর্থন করে না।');
      return;
    }

    if (Notification.permission !== 'granted') {
      await handleToggleNotifications();
      return;
    }
    
    await sendNotification('Dekiru A1-B1 (টেস্ট রিমাইন্ডার) 🌸', 'আজকের জাপানি শব্দগুলো রিভিশন দেওয়ার সময় হয়েছে!');
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReminderTime(val);
    localStorage.setItem('reminderTime', val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-pink-950 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-pink-950/50 overflow-hidden animate-scale-up">
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>অ্যাপ সেটিংস ও ক্লাউড ব্যাকআপ</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">আপনার ব্যাকআপ ও নোটিফিকেশন কাস্টমাইজ করুন</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          
          {/* Section 1: Cloud Backup & Sync */}
          <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/20">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>ক্লাউড ব্যাকআপ ও সিঙ্ক</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-[11px] text-slate-400">আপনার সমস্ত ডাটা ক্লাউডে সুরক্ষিত রাখুন</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 mb-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">ইন্টারনেট কানেকশন:</span>
                <span className={`font-bold flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                  isOnline 
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}>
                  {isOnline ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-400" />
                      <span>অনলাইন</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-amber-400" />
                      <span>অফলাইন</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-800/80 pt-2.5">
                <span className="text-slate-400">ব্যাকআপ অবস্থা:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  user 
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}>
                  {user ? 'সংযুক্ত (Connected)' : 'সংযুক্ত নয় (Not Synced)'}
                </span>
              </div>

              {user ? (
                <>
                  <div className="flex justify-between items-center border-t border-slate-800/80 pt-2.5">
                    <span className="text-slate-400">ব্যবহারকারী:</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[180px]">{user.displayName || user.email}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-800/80 pt-2.5">
                    <span className="text-slate-400">সর্বশেষ ব্যাকআপ সিঙ্ক:</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-pink-400" />
                      {lastSynced || 'কখনো সিঙ্ক করা হয়নি'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2.5">
                  গুগল অ্যাকাউন্ট দিয়ে লগইন করুন যাতে আপনার অনুশীলনের প্রোগ্রেস ও কুইজ রিপোর্ট নিরাপদে ক্লাউডে ব্যাকআপ থাকে।
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {user ? (
                <>
                  <button
                    onClick={onSync}
                    disabled={syncStatus === 'syncing' || !isOnline}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    <span>{syncStatus === 'syncing' ? 'সিঙ্ক হচ্ছে...' : 'ব্যাকআপ করুন'}</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-rose-400 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={onLogin}
                  disabled={!isOnline}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-pink-600/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>গুগল দিয়ে লগইন ও ব্যাকআপ করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Daily Reminder Notifications */}
          <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
                {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>দৈনিক রিমাইন্ডার</span>
                  {notificationsEnabled && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                </h3>
                <p className="text-[11px] text-slate-400">জাপানি অনুশীলনের জন্য পুশ নোটিফিকেশন</p>
              </div>
            </div>

            <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 mb-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">রিমাইন্ডার নোটিফিকেশন:</span>
                <button
                  onClick={handleToggleNotifications}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                    notificationsEnabled ? 'bg-pink-600' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-between items-center border-t border-slate-800/80 pt-3">
                <span className="text-slate-400">রিমাইন্ডার দেওয়ার সময়:</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={handleReminderTimeChange}
                  disabled={!notificationsEnabled}
                  className="bg-slate-900 text-slate-100 px-2 py-1 rounded-lg border border-slate-700 text-xs font-semibold focus:outline-none focus:border-pink-500 disabled:opacity-40"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={sendTestNotification}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                  testSent
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                    : 'bg-slate-850 hover:bg-slate-800 text-orange-300 border-orange-500/20 hover:border-orange-500/40'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-orange-400" />
                <span>{testSent ? 'নোটিফিকেশন পাঠানো হয়েছে! ✅' : 'টেস্ট নোটিফিকেশন পাঠান'}</span>
              </button>
            </div>

            {/* Iframe limitation warning */}
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[10px] sm:text-xs text-amber-300 leading-relaxed">
              <span className="font-bold">⚠️ আইফ্রেমের সীমাবদ্ধতা:</span> গুগল এআই স্টুডিও প্রিভিউয়ের ভেতর ব্রাউজার সিকিউরিটির কারণে নোটিফিকেশন চালু করা সম্ভব হয় না। নোটিফিকেশন ও রিমাইন্ডার সঠিকভাবে টেস্ট করতে অ্যাপের উপরে থাকা <span className="font-semibold text-white">"Preview"</span> বাটন বা <a href="https://ais-dev-n3xbvuvsbrufciyleuzoo7-67190130237.asia-northeast1.run.app" target="_blank" rel="noreferrer" className="underline hover:text-white font-bold">নতুন ট্যাব লিঙ্কে</a> ক্লিক করে অ্যাপটি ওপেন করুন।
            </div>
          </div>

          {/* Section 3: App Developer & Creator Profile */}
          <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/20">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>অ্যাপ ডেভেলপার ও ক্রিয়েটর</span>
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                </h3>
                <p className="text-[11px] text-slate-400">এই অ্যাপটির প্রতিষ্ঠাতা ও নির্দেশক</p>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 p-0.5 shadow-md shadow-pink-600/30 overflow-hidden">
                  <img src="https://i.postimg.cc/fJKXQ1MP/image.jpg" alt="MD Rifat" className="w-full h-full object-cover rounded-[14px]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg" title="Verified Creator">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">MD Rifat</h4>
                <p className="text-xs text-pink-300 font-medium truncate">Lead Developer & Creator</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <a href="mailto:rifatjp2002@gmail.com" className="hover:text-pink-300 transition-colors truncate">
                    rifatjp2002@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <a
                href="mailto:rifatjp2002@gmail.com"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/20 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>সরাসরি ইমেল করুন</span>
              </a>
            </div>

            {/* Reset All User Data / Progress */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowResetModal(true)}
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer pointer-events-auto"
              >
                <span>⚠️ সমস্ত শেখার প্রোগ্রেস ও কুইজ ডেটা রিসেট করুন (Reset Data)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-600/25 hover:opacity-95 cursor-pointer"
          >
            ঠিক আছে
          </button>
        </div>

        {/* Custom In-App Reset Confirmation Modal */}
        <ResetConfirmModal 
          isOpen={showResetModal} 
          onClose={() => setShowResetModal(false)} 
        />
      </div>
    </div>
  );
};
