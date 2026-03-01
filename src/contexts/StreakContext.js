import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import {
  getLocalStreak,
  saveLocalStreak,
  getFirestoreStreak,
  saveFirestoreStreak,
  checkAndUpdateStreak,
  resetStreak,
  createInitialStreak,
  calculateBrainRewiring,
  getStreakTimer,
} from '../utils/streakManager';
import {
  checkAndNotifyMilestone,
  resetNotifiedMilestones,
} from '../services/notificationService';

const StreakContext = createContext({});

export const StreakProvider = ({ children }) => {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [timer, setTimer] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStreak();
    } else {
      setStreakData(null);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!streakData?.startDate) return;

    const interval = setInterval(() => {
      const newTimer = getStreakTimer(streakData.startDate);
      setTimer(newTimer);
    }, 1000);

    return () => clearInterval(interval);
  }, [streakData?.startDate]);

  const loadStreak = async () => {
    setLoading(true);
    try {
      let data = await getLocalStreak();
      
      if (!data && user) {
        data = await getFirestoreStreak(user.uid);
      }
      
      if (!data && user) {
        data = createInitialStreak(user.uid);
        await saveLocalStreak(data);
        await saveFirestoreStreak(user.uid, data);
      }
      
      if (data) {
        const updatedData = checkAndUpdateStreak(data);
        if (updatedData !== data) {
          await saveLocalStreak(updatedData);
          if (user) {
            await saveFirestoreStreak(user.uid, updatedData);
          }
        }
        setStreakData(updatedData);
        setTimer(getStreakTimer(updatedData.startDate));
        checkAndNotifyMilestone(updatedData.currentStreak);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!streakData || !user) return;

    const newData = resetStreak(streakData);
    setStreakData(newData);
    setTimer({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    await saveLocalStreak(newData);
    await saveFirestoreStreak(user.uid, newData);
    resetNotifiedMilestones(); // sıfırlama sonrası milestone bildirimlerini de sıfırla
  };

  const syncWithFirestore = async () => {
    if (!user || !streakData) return;

    try {
      await saveFirestoreStreak(user.uid, streakData);
    } catch (error) {
      console.error('Error syncing with Firestore:', error);
    }
  };

  const handleEditStreak = async (days) => {
    if (!streakData || !user) return;

    const now = new Date();
    const newStartDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const newData = {
      ...streakData,
      currentStreak: days,
      longestStreak: Math.max(days, streakData.longestStreak || 0),
      startDate: newStartDate,
      lastCheckDate: now,
    };

    setStreakData(newData);
    setTimer(getStreakTimer(newStartDate));
    await saveLocalStreak(newData);
    await saveFirestoreStreak(user.uid, newData);
    checkAndNotifyMilestone(days);
  };

  const brainRewiring = streakData ? calculateBrainRewiring(streakData.currentStreak) : 0;

  return (
    <StreakContext.Provider
      value={{
        streakData,
        timer,
        loading,
        brainRewiring,
        resetStreak: handleReset,
        editStreak: handleEditStreak,
        refreshStreak: loadStreak,
        syncWithFirestore,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => useContext(StreakContext);
