import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  writeBatch
} from 'firebase/firestore';
import { 
  getAllWordProgress, 
  saveWordProgress, 
  getAllQuizResults, 
  saveQuizResult, 
  getUserStats, 
  updateUserStats 
} from './storage';
import { UserWordProgress, QuizResult, UserStats } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyBCnTqeZCWZzJiAvE6EdY8W5Wg-7AKCodk",
  authDomain: "chrome-tower-7mn89.firebaseapp.com",
  projectId: "chrome-tower-7mn89",
  storageBucket: "chrome-tower-7mn89.firebasestorage.app",
  messagingSenderId: "734894404253",
  appId: "1:734894404253:web:2aa94a9493e3066fd09a74"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore using the specific database ID from configuration
export const db = getFirestore(app, "ai-studio-dekirunihongovoc-5ffe69c6-4e62-4ce0-a5ad-acdb2193659e");

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Signs in the user using Firebase Auth Google popup
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Signs out the current user
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Synchronizes local IndexedDB data to Firestore
 */
export async function syncLocalToCloud(uid: string): Promise<void> {
  if (!navigator.onLine) return;

  try {
    // 1. Sync Word Progress
    const localProgress = await getAllWordProgress();
    if (localProgress.length > 0) {
      const batch = writeBatch(db);
      for (const progress of localProgress) {
        const docRef = doc(db, 'users', uid, 'word_progress', progress.wordId);
        batch.set(docRef, progress);
      }
      await batch.commit();
    }

    // 2. Sync Quizzes
    const localQuizzes = await getAllQuizResults();
    if (localQuizzes.length > 0) {
      const batch = writeBatch(db);
      for (const quiz of localQuizzes) {
        const docRef = doc(db, 'users', uid, 'quizzes', quiz.id);
        batch.set(docRef, quiz);
      }
      await batch.commit();
    }

    // 3. Sync User Stats
    const localStats = await getUserStats();
    const docRef = doc(db, 'users', uid, 'stats', 'user_stats');
    await setDoc(docRef, localStats);

    console.log('Successfully backed up all local progress to Cloud Firestore!');
  } catch (err) {
    console.error('Error during local-to-cloud sync:', err);
    throw err;
  }
}

/**
 * Synchronizes Firestore data down to local IndexedDB (with intelligent merging)
 */
export async function syncCloudToLocal(uid: string): Promise<void> {
  try {
    // 1. Fetch Cloud Word Progress
    const progressColl = collection(db, 'users', uid, 'word_progress');
    const cloudProgressSnap = await getDocs(progressColl);
    
    for (const d of cloudProgressSnap.docs) {
      const cloudData = d.data() as UserWordProgress;
      // Get local progress to merge
      const localProgress = await getAllWordProgress();
      const localItem = localProgress.find(p => p.wordId === cloudData.wordId);

      if (!localItem) {
        // Save directly if not exists locally
        await saveWordProgress(cloudData);
      } else {
        // Compare lastReviewed timestamps to keep the latest one
        const localTime = localItem.lastReviewed ? new Date(localItem.lastReviewed).getTime() : 0;
        const cloudTime = cloudData.lastReviewed ? new Date(cloudData.lastReviewed).getTime() : 0;
        
        if (cloudTime > localTime) {
          await saveWordProgress(cloudData);
        }
      }
    }

    // 2. Fetch Cloud Quizzes
    const quizzesColl = collection(db, 'users', uid, 'quizzes');
    const cloudQuizzesSnap = await getDocs(quizzesColl);
    for (const d of cloudQuizzesSnap.docs) {
      const quiz = d.data() as QuizResult;
      await saveQuizResult(quiz);
    }

    // 3. Fetch Cloud Stats
    const statsDocRef = doc(db, 'users', uid, 'stats', 'user_stats');
    const cloudStatsSnap = await getDoc(statsDocRef);
    if (cloudStatsSnap.exists()) {
      const cloudStats = cloudStatsSnap.data() as UserStats;
      await updateUserStats((local) => {
        // Choose the one with the higher streak or more recent date
        const localTime = local.lastActiveDate ? new Date(local.lastActiveDate).getTime() : 0;
        const cloudTime = cloudStats.lastActiveDate ? new Date(cloudStats.lastActiveDate).getTime() : 0;
        
        if (cloudTime >= localTime) {
          return cloudStats;
        }
        return local;
      });
    }

    console.log('Successfully synced Cloud Firestore progress down to local IndexedDB!');
  } catch (err) {
    console.error('Error during cloud-to-local sync:', err);
    throw err;
  }
}

/**
 * Full bidirectional sync
 */
export async function syncAll(uid: string): Promise<void> {
  if (!navigator.onLine) return;
  // First download new cloud progress to merge, then backup the final merged set back to cloud
  await syncCloudToLocal(uid);
  await syncLocalToCloud(uid);
}
