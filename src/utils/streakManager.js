import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const STREAK_KEY = '@quitter_streak';

export const getLocalStreak = async () => {
  try {
    const data = await AsyncStorage.getItem(STREAK_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error getting local streak:', error);
    return null;
  }
};

export const saveLocalStreak = async (streakData) => {
  try {
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
    return true;
  } catch (error) {
    console.error('Error saving local streak:', error);
    return false;
  }
};

export const getFirestoreStreak = async (userId) => {
  try {
    const docRef = doc(db, 'streaks', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting Firestore streak:', error);
    return null;
  }
};

export const saveFirestoreStreak = async (userId, streakData) => {
  try {
    const docRef = doc(db, 'streaks', userId);
    await setDoc(docRef, streakData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving Firestore streak:', error);
    return false;
  }
};

export const checkAndUpdateStreak = (streakData) => {
  const now = new Date();
  const lastCheck = new Date(streakData.lastCheckDate);
  
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDate = new Date(lastCheck.getFullYear(), lastCheck.getMonth(), lastCheck.getDate());
  
  const diffTime = nowDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return streakData;
  }
  
  if (diffDays === 1) {
    const newStreak = streakData.currentStreak + 1;
    return {
      ...streakData,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streakData.longestStreak),
      lastCheckDate: now.toISOString(),
    };
  }
  
  if (diffDays > 1) {
    return {
      ...streakData,
      currentStreak: 0,
      lastCheckDate: now.toISOString(),
      relapses: streakData.relapses + 1,
    };
  }
  
  return streakData;
};

export const resetStreak = (streakData) => {
  const now = new Date();
  return {
    ...streakData,
    currentStreak: 0,
    startDate: now.toISOString(),
    lastCheckDate: now.toISOString(),
    relapses: streakData.relapses + 1,
  };
};

export const createInitialStreak = (userId) => {
  const now = new Date();
  return {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastCheckDate: now.toISOString(),
    startDate: now.toISOString(),
    relapses: 0,
  };
};

export const calculateBrainRewiring = (currentStreak) => {
  const maxDays = 90;
  const percentage = Math.min((currentStreak / maxDays) * 100, 100);
  return Math.round(percentage);
};

export const getStreakTimer = (startDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const diff = now.getTime() - start.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
};
