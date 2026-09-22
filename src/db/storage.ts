import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { QuizResult, UserWordProgress, UserStats } from '../types';

interface DekiruDB extends DBSchema {
  'word_progress': {
    key: string;
    value: UserWordProgress;
  };
  'quizzes': {
    key: string;
    value: QuizResult;
  };
  'stats': {
    key: string;
    value: UserStats;
  };
}

let dbPromise: Promise<IDBPDatabase<DekiruDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<DekiruDB>('dekiru_nihongo_vocab_db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('word_progress')) {
          db.createObjectStore('word_progress', { keyPath: 'wordId' });
        }
        if (!db.objectStoreNames.contains('quizzes')) {
          db.createObjectStore('quizzes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats');
        }
      },
    });
  }
  return dbPromise;
}

export async function getUserWordProgress(wordId: string): Promise<UserWordProgress | undefined> {
  const db = await getDB();
  return db.get('word_progress', wordId);
}

export async function getAllWordProgress(): Promise<UserWordProgress[]> {
  const db = await getDB();
  return db.getAll('word_progress');
}

export async function saveWordProgress(progress: UserWordProgress): Promise<void> {
  const db = await getDB();
  await db.put('word_progress', progress);
}

export async function toggleBookmark(wordId: string): Promise<boolean> {
  const db = await getDB();
  const existing = await db.get('word_progress', wordId);
  const newBookmarked = existing ? !existing.bookmarked : true;
  const updated: UserWordProgress = existing
    ? { ...existing, bookmarked: newBookmarked }
    : { wordId, status: 'new', correctCount: 0, incorrectCount: 0, bookmarked: true };
  await db.put('word_progress', updated);
  return newBookmarked;
}

export async function saveQuizResult(result: QuizResult): Promise<void> {
  const db = await getDB();
  await db.put('quizzes', result);
}

export async function getAllQuizResults(): Promise<QuizResult[]> {
  const db = await getDB();
  return db.getAll('quizzes');
}

export async function getUserStats(): Promise<UserStats> {
  const db = await getDB();
  let stats = await db.get('stats', 'user_stats');
  if (!stats) {
    stats = {
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      totalQuizzesTaken: 0,
      wordsMasteredCount: 0
    };
    await db.put('stats', stats, 'user_stats');
  }
  return stats;
}

export async function updateUserStats(updater: (prev: UserStats) => UserStats): Promise<UserStats> {
  const db = await getDB();
  const current = await getUserStats();
  const updated = updater(current);
  await db.put('stats', updated, 'user_stats');
  return updated;
}
