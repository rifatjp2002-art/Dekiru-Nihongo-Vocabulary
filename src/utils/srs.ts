import { UserWordProgress } from '../types';

/**
 * Calculates the next review interval, ease factor, and review date for a word
 * based on the SuperMemo SM-2 algorithm modified for language learning.
 * 
 * @param progress Current user progress for the word
 * @param quality Quality rating of the review (0-5)
 * @returns Updated UserWordProgress
 */
export function calculateSRS(
  progress: Partial<UserWordProgress> & { wordId: string },
  quality: number
): UserWordProgress {
  const now = new Date();
  
  // Set default starting values
  let easeFactor = progress.easeFactor ?? 2.5;
  let interval = progress.interval && progress.interval > 0 ? progress.interval : 0;
  let correctCount = progress.correctCount ?? 0;
  let incorrectCount = progress.incorrectCount ?? 0;
  let status = progress.status ?? 'new';
  let difficulty: 'easy' | 'medium' | 'hard' = progress.difficulty ?? 'medium';

  if (quality >= 3) {
    // Correct response
    correctCount += 1;
    if (correctCount === 1) {
      interval = 1; // 1 day
    } else if (correctCount === 2) {
      interval = 3; // 3 days
    } else {
      const baseInterval = interval > 0 ? interval : 3;
      interval = Math.ceil(baseInterval * easeFactor);
    }
    
    // Adjust ease factor based on quality: SM-2 formula
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;
    
    // Set status based on mastery
    if (correctCount >= 5) {
      status = 'mastered';
    } else {
      status = 'learning';
    }
  } else {
    // Incorrect response
    incorrectCount += 1;
    correctCount = 0; // reset streak
    interval = 1; // repeat tomorrow (1 day)
    status = 'learning';
    
    // Decrease ease factor slightly
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  // Set difficulty label based on quality and easeFactor
  if (quality === 5) {
    difficulty = 'easy';
  } else if (quality === 3 || quality <= 2) {
    difficulty = 'hard';
  } else {
    difficulty = 'medium';
  }

  // Calculate next review date
  const nextReview = new Date();
  if (interval < 1) {
    interval = 1;
  }
  nextReview.setDate(now.getDate() + interval);

  return {
    wordId: progress.wordId,
    status,
    correctCount,
    incorrectCount,
    lastReviewed: now.toISOString(),
    nextReviewDate: nextReview.toISOString(),
    interval,
    easeFactor,
    difficulty,
    bookmarked: progress.bookmarked ?? false,
  };
}
