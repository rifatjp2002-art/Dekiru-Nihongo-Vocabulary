import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';
import { signOutUser } from '../db/firebase';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ isOpen, onClose }) => {
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      // 1. Sign out user from Firebase if logged in
      try {
        await signOutUser();
      } catch (e) {
        console.warn('Firebase signout ignored during reset:', e);
      }

      // 2. Delete IndexedDB database
      try {
        window.indexedDB.deleteDatabase('dekiru_nihongo_vocab_db');
        if (window.indexedDB.databases) {
          const dbs = await window.indexedDB.databases();
          for (const db of dbs) {
            if (db.name) window.indexedDB.deleteDatabase(db.name);
          }
        }
      } catch (e) {
        console.warn('IndexedDB delete error:', e);
      }

      // 3. Clear all LocalStorage and SessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // 4. Clear any cookies
      try {
        document.cookie.split(';').forEach((c) => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
      } catch (e) {
        console.warn('Cookie clear error:', e);
      }

      // 5. Reload cleanly
      window.location.href = window.location.href.split('#')[0].split('?')[0] + '?reset=' + Date.now();
    } catch (err) {
      console.error('Reset error:', err);
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isResetting}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">সমস্ত ডেটা রিসেট করবেন?</h3>
            <p className="text-xs text-rose-300/80 font-medium">এই কাজটি আর ফিরিয়ে আনা যাবে না</p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2 mb-6">
          <p className="leading-relaxed">
            আপনি রিসেট করলে নিচের সমস্ত তথ্য স্থায়ীভাবে মুছে যাবে:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
            <li>সকল শেখা শব্দের প্রোগ্রেস ও স্ট্যাটাস</li>
            <li>সকল কুইজের ফলাফল ও স্কোর হিস্ট্রি</li>
            <li>সংরক্ষিত স্টাডি টাইম (পড়ার সময়)</li>
            <li>বুকমার্ক করা শব্দের তালিকা</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs border border-slate-700 transition-all cursor-pointer text-center"
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            onClick={handleConfirmReset}
            disabled={isResetting}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isResetting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>রিসেট হচ্ছে...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, সব মুছে ফেলুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
