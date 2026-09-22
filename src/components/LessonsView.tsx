import React from 'react';
import { getLessonsByBook, getAllWordsByBook } from '../data/lessonsData';
import { BookOpen, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useBookStore } from '../store/bookStore';

interface LessonsViewProps {
  onSelectLesson: (lessonNumber: number) => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({ onSelectLesson }) => {
  const { currentBook } = useBookStore();
  const LESSONS = getLessonsByBook(currentBook);
  const ALL_WORDS = getAllWordsByBook(currentBook);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-pink-950/50 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentBook === 'book2' ? 'できる日本語 初中級 • 15 Lessons' : 'できる日本語 初級 • 15 Lessons'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {currentBook === 'book2' ? 'বই ২ (প্রাক-মধ্যম) সকল লেসন' : 'বইয়ের সকল লেসন (Lesson 1 - 15)'}
          </h2>
          <p className="text-sm text-slate-400">
            {currentBook === 'book2' 
              ? 'নিশিকাওয়া সাহেবের প্রথম বইয়ের পরের লেভেলের ১৫টি লেসনের বিস্তারিত শব্দমালা' 
              : 'শুরু থেকে শেষ পর্যন্ত কোনো শব্দ বাদ না দিয়ে সম্পূর্ণ সিলেবাস'}
          </p>
        </div>
        <div className="bg-pink-950/40 border border-pink-500/30 px-4 py-3 rounded-2xl text-center">
          <span className="text-xs text-pink-300 block font-medium">মোট শব্দ</span>
          <span className="text-xl font-bold text-white">{ALL_WORDS.length} টি</span>
        </div>
      </div>

      {/* Lesson Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LESSONS.map((lesson) => {
          const lessonWords = ALL_WORDS.filter(w => w.lessonNumber === lesson.number);
          return (
            <div
              key={lesson.number}
              onClick={() => onSelectLesson(lesson.number)}
              className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-pink-500/50 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:shadow-pink-950/20 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-pink-500/30 group-hover:scale-105 transition-transform">
                    {lesson.number}
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                    {lessonWords.length} শব্দ
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors mb-1">
                  {lesson.titleJp}
                </h3>
                <p className="text-xs font-medium text-pink-400 mb-3">{lesson.titleBn}</p>
                
                <p className="text-xs text-slate-300 bg-slate-800/60 border border-slate-700/50 p-3 rounded-xl mb-4 leading-relaxed">
                  <span className="text-pink-300 font-semibold block mb-1">🎯 শেখার উদ্দেশ্য:</span>
                  {lesson.canDoBn}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-sm font-semibold text-pink-400 group-hover:text-pink-300">
                <span>লেসন স্টাডি করুন</span>
                <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
