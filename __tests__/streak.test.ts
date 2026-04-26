jest.mock('react-native-mmkv', () => {
  const store: Record<string, string> = {};
  return {
    createMMKV: () => ({
      getString: (key: string) => store[key] ?? undefined,
      set: (key: string, value: string) => { store[key] = value; },
      delete: (key: string) => { delete store[key]; },
      clearAll: () => { Object.keys(store).forEach((k) => delete store[k]); },
    }),
  };
});

import { storageService } from '../src/services/storage';
import { updateStreak } from '../src/features/profile/hooks/useStreak';

beforeEach(() => { storageService.clearAll(); });

const mockDate = (dateStr: string) => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(dateStr));
};

afterEach(() => { jest.useRealTimers(); });

describe('updateStreak', () => {
  it('starts streak at 1 on first open', () => {
    mockDate('2026-04-26');
    const result = updateStreak();
    expect(result.currentStreak).toBe(1);
    expect(result.lastOpenDate).toBe('2026-04-26');
  });

  it('increments streak for consecutive day', () => {
    mockDate('2026-04-25');
    updateStreak();
    mockDate('2026-04-26');
    const result = updateStreak();
    expect(result.currentStreak).toBe(2);
  });

  it('does not change streak for same day', () => {
    mockDate('2026-04-26');
    updateStreak();
    const result = updateStreak();
    expect(result.currentStreak).toBe(1);
  });

  it('resets streak after gap', () => {
    mockDate('2026-04-24');
    updateStreak();
    mockDate('2026-04-26');
    const result = updateStreak();
    expect(result.currentStreak).toBe(1);
  });

  it('updates longestStreak when exceeded', () => {
    mockDate('2026-04-25');
    updateStreak();
    mockDate('2026-04-26');
    const result = updateStreak();
    expect(result.longestStreak).toBe(2);
  });

  it('awards 7_days badge at streak 7', () => {
    for (let i = 0; i < 7; i++) {
      const d = new Date('2026-04-20');
      d.setDate(d.getDate() + i);
      mockDate(d.toISOString().split('T')[0]);
      updateStreak();
    }
    const streak = storageService.getUserStreak();
    expect(streak.badges).toContain('7_days');
  });
});
