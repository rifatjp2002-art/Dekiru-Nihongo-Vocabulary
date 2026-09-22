import React, { useState, useEffect } from 'react';
import { getLessonsByBook, getAllWordsByBook } from '../data/lessonsData';
import { WordItem } from '../types';
import { Volume2, Bookmark, Search, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { speakJapanese } from '../utils/audio';
import { toggleBookmark, getAllWordProgress } from '../db/storage';
import { useBookStore } from '../store/bookStore';

interface LessonDetailViewProps {
  lessonNumber: number;
  onBack: () => void;
  onStartFlashcards: (lessonNumber: number) => void;
  onStartQuiz: (lessonNumber: number) => void;
}

export const LessonDetailView: React.FC<LessonDetailViewProps> = ({
  lessonNumber,
  onBack,
  onStartFlashcards,
  onStartQuiz
}) => {
  const { currentBook } = useBookStore();
  const LESSONS = getLessonsByBook(currentBook);
  const ALL_WORDS = getAllWordsByBook(currentBook);

  const lesson = LESSONS.find(l => l.number === lessonNumber);
  const words = ALL_WORDS.filter(w => w.lessonNumber === lessonNumber);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonNumber]);

  useEffect(() => {
    async function loadBookmarks() {
      const progress = await getAllWordProgress();
      const map: Record<string, boolean> = {};
      progress.forEach(p => {
        if (p.bookmarked) map[p.wordId] = true;
      });
      setBookmarkedIds(map);
    }
    loadBookmarks();
  }, []);

  const handleBookmark = async (wordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isBookmarked = await toggleBookmark(wordId);
    setBookmarkedIds(prev => ({ ...prev, [wordId]: isBookmarked }));
  };

  const filteredWords = words.filter(w =>
    w.japanese.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.reading.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.bengali.includes(searchTerm)
  );

  if (!lesson) return null;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-pink-950/50 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 font-semibold">
                Lesson {lesson.number}
              </span>
              <span className="text-xs text-slate-400">{words.length} টি শব্দ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">{lesson.titleJp} - {lesson.titleBn}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onStartFlashcards(lessonNumber)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-300 font-semibold text-xs sm:text-sm border border-pink-500/30 transition-all cursor-pointer hidden sm:flex items-center gap-2"
          >
            <span>ফ্ল্যাশকার্ড</span>
          </button>
          <button
            onClick={() => onStartQuiz(lessonNumber)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-pink-600/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>কুইজ দিন</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="শব্দ খুঁজুন (Japanese, English, বাংলা)..."
          className="w-full bg-slate-900/80 border border-slate-800 focus:border-pink-500/60 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 text-sm outline-none shadow-lg transition-all"
        />
      </div>

      {/* Words Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWords.map((word) => {
          const isBookmarked = !!bookmarkedIds[word.id];
          return (
            <div
              key={word.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-pink-500/40 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
                      {word.emoji}
                    </span>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold text-white tracking-wide">{word.japanese}</span>
                        <span className="text-sm font-medium text-pink-400">[{word.reading}]</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                        {word.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleBookmark(word.id, e)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'bg-pink-500/20 text-pink-400 border-pink-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title="বুকমার্ক করুন"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-pink-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => speakJapanese(word.japanese)}
                      className="p-2 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 transition-colors cursor-pointer"
                      title="উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 my-3 bg-slate-800/40 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 text-xs font-semibold">বাংলা অর্থ:</span>
                    <span className="text-white font-bold">{word.bengali}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 text-xs font-semibold">English:</span>
                    <span className="text-slate-200 font-medium">{word.english}</span>
                  </div>
                </div>

                {word.exampleJp && (
                  <div className="text-xs text-slate-300 bg-pink-950/20 border border-pink-950/40 p-2.5 rounded-xl space-y-1">
                    <div className="text-pink-300 font-medium">{word.exampleJp}</div>
                    <div className="text-slate-400">{word.exampleBn}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
