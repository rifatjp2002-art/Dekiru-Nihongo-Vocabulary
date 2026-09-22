import { create } from 'zustand';

interface BookState {
  currentBook: 'book1' | 'book2';
  setBook: (book: 'book1' | 'book2') => void;
}

export const useBookStore = create<BookState>((set) => ({
  currentBook: (localStorage.getItem('dekiru_current_book') as 'book1' | 'book2') || 'book1',
  setBook: (book) => {
    localStorage.setItem('dekiru_current_book', book);
    set({ currentBook: book });
  },
}));
