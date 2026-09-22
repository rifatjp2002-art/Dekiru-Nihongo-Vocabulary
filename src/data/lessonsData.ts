import { LESSONS as LESSONS_BOOK1, ALL_WORDS as ALL_WORDS_BOOK1 } from './lessons/index';
import { LESSONS_BOOK2, ALL_WORDS_BOOK2 } from './lessons_book2/index';
import { Lesson, WordItem } from '../types';

export { LESSONS_BOOK1, ALL_WORDS_BOOK1, LESSONS_BOOK2, ALL_WORDS_BOOK2 };

export function getLessonsByBook(book: 'book1' | 'book2'): Lesson[] {
  return book === 'book2' ? LESSONS_BOOK2 : LESSONS_BOOK1;
}

export function getAllWordsByBook(book: 'book1' | 'book2'): WordItem[] {
  return book === 'book2' ? ALL_WORDS_BOOK2 : ALL_WORDS_BOOK1;
}

// Default export compatibility
export const LESSONS = LESSONS_BOOK1;
export const ALL_WORDS = ALL_WORDS_BOOK1;
