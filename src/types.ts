export interface WordItem {
  id: string;
  lessonNumber: number;
  japanese: string;
  reading: string; // Hiragana/Katakana
  english: string;
  bengali: string;
  category: string;
  emoji: string;
  exampleJp?: string;
  exampleEn?: string;
  exampleBn?: string;
}

export interface Lesson {
  number: number;
  titleJp: string;
  titleEn: string;
  titleBn: string;
  canDo: string;
  canDoBn: string;
  colorTheme: string;
}

export interface UserWordProgress {
  wordId: string;
  status: 'new' | 'learning' | 'mastered';
  correctCount: number;
  incorrectCount: number;
  lastReviewed?: string;
  nextReviewDate?: string;
  interval?: number;
  easeFactor?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  bookmarked: boolean;
}

export interface QuizResult {
  id: string;
  lessonNumber: number;
  score: number;
  totalQuestions: number;
  date: string;
  mode: 'meaning' | 'listening' | 'typing';
  book?: 'book1' | 'book2';
}

export interface UserStats {
  streakDays: number;
  lastActiveDate: string;
  totalQuizzesTaken: number;
  wordsMasteredCount: number;
}
