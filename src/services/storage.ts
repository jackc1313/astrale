import { createMMKV } from 'react-native-mmkv';

import type { DailyUsage, UserProfile, UserStreak } from '@features/onboarding/types';

export const storage = createMMKV();

const KEYS = {
  USER_PROFILE: 'user.profile',
  USER_STREAK: 'user.streak',
  DAILY_USAGE: 'daily.usage',
  COLLECTED_CARDS: 'collected.cards',
} as const;

const getObject = <T>(key: string): T | null => {
  const raw = storage.getString(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
};

const setObject = <T>(key: string, value: T): void => {
  storage.set(key, JSON.stringify(value));
};

export const storageService = {
  getUserProfile: (): UserProfile | null => getObject<UserProfile>(KEYS.USER_PROFILE),
  setUserProfile: (profile: UserProfile): void => setObject(KEYS.USER_PROFILE, profile),
  isOnboardingCompleted: (): boolean => {
    const profile = getObject<UserProfile>(KEYS.USER_PROFILE);
    return profile?.onboardingCompleted ?? false;
  },
  getUserStreak: (): UserStreak => {
    return getObject<UserStreak>(KEYS.USER_STREAK) ?? {
      currentStreak: 0, longestStreak: 0, lastOpenDate: '', badges: [],
    };
  },
  setUserStreak: (streak: UserStreak): void => setObject(KEYS.USER_STREAK, streak),
  getDailyUsage: (date: string): DailyUsage => {
    const usage = getObject<DailyUsage>(KEYS.DAILY_USAGE);
    if (usage?.date === date) return usage;
    return {
      date, freeHoroscopeRead: false, tarotCardDrawn: false,
      wheelSpun: false, scratchUsed: false, rewardedAdsWatched: 0,
    };
  },
  setDailyUsage: (usage: DailyUsage): void => setObject(KEYS.DAILY_USAGE, usage),
  getCollectedCards: (): string[] => {
    return getObject<string[]>(KEYS.COLLECTED_CARDS) ?? [];
  },
  addCollectedCard: (cardId: string): void => {
    const cards = storageService.getCollectedCards();
    if (!cards.includes(cardId)) {
      setObject(KEYS.COLLECTED_CARDS, [...cards, cardId]);
    }
  },
  clearAll: (): void => { storage.clearAll(); },
} as const;
