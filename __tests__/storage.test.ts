jest.mock('react-native-mmkv', () => {
  const store: Record<string, string> = {};
  return {
    createMMKV: jest.fn().mockReturnValue({
      getString: (key: string) => store[key] ?? undefined,
      set: (key: string, value: string) => { store[key] = value; },
      delete: (key: string) => { delete store[key]; },
      clearAll: () => { Object.keys(store).forEach((k) => delete store[k]); },
    }),
  };
});

import { storageService } from '../src/services/storage';

beforeEach(() => { storageService.clearAll(); });

describe('storageService', () => {
  it('returns null for missing profile', () => {
    expect(storageService.getUserProfile()).toBeNull();
  });

  it('stores and retrieves user profile', () => {
    const profile = {
      zodiacSign: 'taurus' as const,
      birthDate: '1990-05-15',
      ascendant: null,
      interests: ['love' as const, 'work' as const],
      onboardingCompleted: true,
      createdAt: '2026-04-24',
    };
    storageService.setUserProfile(profile);
    expect(storageService.getUserProfile()).toEqual(profile);
  });

  it('isOnboardingCompleted returns false by default', () => {
    expect(storageService.isOnboardingCompleted()).toBe(false);
  });

  it('returns default streak when none stored', () => {
    const streak = storageService.getUserStreak();
    expect(streak.currentStreak).toBe(0);
    expect(streak.badges).toEqual([]);
  });

  it('returns fresh daily usage for new date', () => {
    const usage = storageService.getDailyUsage('2026-04-24');
    expect(usage.date).toBe('2026-04-24');
    expect(usage.tarotCardDrawn).toBe(false);
  });

  it('tracks collected cards without duplicates', () => {
    storageService.addCollectedCard('the_fool');
    storageService.addCollectedCard('the_magician');
    storageService.addCollectedCard('the_fool');
    expect(storageService.getCollectedCards()).toEqual(['the_fool', 'the_magician']);
  });
});
