import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 px-2 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold text-white shadow-md shadow-pink-500/20 hover:shadow-pink-500/30 transition-all cursor-pointer active:scale-95 animate-pulse shrink-0"
      >
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="hidden sm:inline">সেভ করুন (Install App)</span>
        <span className="sm:hidden">ইনস্টল</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 px-2 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold text-white shadow-md shadow-pink-500/20 hover:shadow-pink-500/30 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="hidden sm:inline">মোবাইলে সেভ করুন (iOS)</span>
          <span className="sm:hidden">iOS সেভ</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl border border-pink-500/30 bg-slate-900 p-6 shadow-2xl relative text-left">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 text-pink-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                iPhone বা iPad-এ সেভ করুন
              </h3>
              <p className="mt-2 text-sm text-slate-300 space-y-3 leading-relaxed">
                ১. Safari ব্রাউজারের নিচের টুলবারের <strong className="text-pink-400 font-semibold">Share (শেয়ার)</strong> বাটনে চাপ দিন।<br />
                ২. নিচের দিকে স্ক্রোল করে <strong className="text-pink-400 font-semibold">Add to Home Screen (হোম স্ক্রিনে যোগ করুন)</strong> অপশনটি সিলেক্ট করুন।
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-2xl bg-slate-800 hover:bg-slate-700 py-3 text-sm font-bold text-slate-200 transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
