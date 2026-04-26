import { useEffect } from 'react';

import { storageService } from '@services/storage';
import type { UserStreak } from '@features/onboarding/types';

const today = (): string => new Date().toISOString().split('T')[0];

const isYesterday = (dateStr: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
};

const STREAK_BADGES: { id: string; threshold: number }[] = [
  { id: '7_days', threshold: 7 },
  { id: '30_days', threshold: 30 },
  { id: '100_days', threshold: 100 },
];

export const updateStreak = (): UserStreak => {
  const streak = storageService.getUserStreak();
  const todayStr = today();

  if (streak.lastOpenDate === todayStr) {
    return streak;
  }

  let newStreak: number;
  if (isYesterday(streak.lastOpenDate)) {
    newStreak = streak.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(streak.longestStreak, newStreak);

  const badges = [...streak.badges];
  for (const badge of STREAK_BADGES) {
    if (newStreak >= badge.threshold && !badges.includes(badge.id)) {
      badges.push(badge.id);
    }
  }

  const collectedCards = storageService.getCollectedCards();
  if (collectedCards.length === 22 && !badges.includes('all_arcana')) {
    badges.push('all_arcana');
  }

  const updated: UserStreak = {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastOpenDate: todayStr,
    badges,
  };

  storageService.setUserStreak(updated);
  return updated;
};

export const useStreak = () => {
  useEffect(() => {
    updateStreak();
  }, []);
};
