import type { ZodiacSignId } from '@shared/utils/zodiac';

export type InterestId = 'love' | 'work' | 'health' | 'luck';

export type UserProfile = {
  zodiacSign: ZodiacSignId;
  birthDate: string;
  ascendant: ZodiacSignId | null;
  interests: InterestId[];
  onboardingCompleted: boolean;
  createdAt: string;
};

export type UserStreak = {
  currentStreak: number;
  longestStreak: number;
  lastOpenDate: string;
  badges: string[];
};

export type DailyUsage = {
  date: string;
  freeHoroscopeRead: boolean;
  tarotCardDrawn: boolean;
  wheelSpun: boolean;
  scratchUsed: boolean;
  rewardedAdsWatched: number;
};
