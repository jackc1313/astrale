# Astrale Fase 3 — Engagement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement engagement features: streak system with badges, local push notifications, reading history with calendar UI, and full profile screen rewrite.

**Architecture:** All engagement data lives in MMKV (streak, badges, reading history, notification settings). Notifications are local (Expo Notifications), no server push. The streak hook runs at root layout level on every app open. Reading history is populated by existing feature hooks (horoscope, tarot, wheel, scratch). Profile screen assembles all engagement UI.

**Tech Stack:** Expo Notifications, MMKV, React Native Reanimated (animations), existing shared components

---

## File Map

### New Files

| Path | Responsibility |
|------|---------------|
| `src/features/profile/types.ts` | ReadingEntry, ReadingHistoryDay, NotificationSettings, BadgeInfo |
| `src/features/profile/hooks/useStreak.ts` | Streak logic, badge assignment |
| `src/features/profile/hooks/useReadingHistory.ts` | Reading history CRUD |
| `src/features/profile/hooks/useNotifications.ts` | Notification scheduling management |
| `src/features/profile/hooks/index.ts` | Barrel export |
| `src/features/profile/components/StreakCounter.tsx` | Streak number + flame + longest |
| `src/features/profile/components/BadgeGrid.tsx` | Badge grid with progress |
| `src/features/profile/components/ReadingCalendar.tsx` | Monthly calendar grid with dots |
| `src/features/profile/components/ReadingDayDetail.tsx` | Day entries list |
| `src/features/profile/components/NotificationSettings.tsx` | Toggle + time picker |
| `src/features/profile/components/index.ts` | Barrel export |
| `src/services/notifications.ts` | Expo Notifications wrapper |
| `__tests__/streak.test.ts` | Streak logic tests |

### Modified Files

| Path | Change |
|------|--------|
| `src/services/storage.ts` | Add ReadingHistory + NotificationSettings keys and helpers |
| `src/services/index.ts` | Add notifications export |
| `src/i18n/locales/it.json` | Add Fase 3 translation keys |
| `app/_layout.tsx` | Add useStreak call |
| `app/profile.tsx` | Full rewrite |
| `src/features/horoscope/hooks/useHoroscope.ts` | Add ReadingHistory save |
| `src/features/tarot/hooks/useTarot.ts` | Add ReadingHistory save |
| `src/features/discover/hooks/useWheel.ts` | Add ReadingHistory save |
| `src/features/discover/hooks/useScratch.ts` | Add ReadingHistory save |

---

## Task 1: Profile Types & i18n Updates

**Files:**
- Create: `src/features/profile/types.ts`
- Modify: `src/i18n/locales/it.json`

- [ ] **Step 1: Create profile types**

`src/features/profile/types.ts`:

```typescript
export type ReadingEntry = {
  type: "horoscope" | "tarot" | "wheel" | "scratch";
  summary: string;
  timestamp: string;
};

export type ReadingHistoryDay = {
  date: string;
  entries: ReadingEntry[];
};

export type NotificationSettings = {
  morningEnabled: boolean;
  morningHour: number;
  morningMinute: number;
  eveningEnabled: boolean;
  eveningHour: number;
  eveningMinute: number;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  morningEnabled: true,
  morningHour: 8,
  morningMinute: 0,
  eveningEnabled: false,
  eveningHour: 20,
  eveningMinute: 0,
};

export type BadgeId = "7_days" | "30_days" | "100_days" | "all_arcana";

export type BadgeInfo = {
  id: BadgeId;
  nameKey: string;
  icon: string;
  current: number;
  total: number;
  earned: boolean;
};
```

- [ ] **Step 2: Update it.json with Fase 3 translations**

Read existing `src/i18n/locales/it.json`, then MERGE these new top-level keys (keep all existing):

```json
{
  "profile": {
    "title": "Profilo",
    "streak": "{{count}} giorni consecutivi",
    "longestStreak": "Record: {{count}} giorni",
    "badges": "Badge",
    "history": "Storico letture",
    "notifications": "Notifiche",
    "morning": "Oroscopo del mattino",
    "evening": "Carta della sera",
    "streakAlert": "Avviso streak",
    "premium": "Passa ad Astrale Plus"
  },
  "badges": {
    "7_days": "7 Giorni",
    "30_days": "30 Giorni",
    "100_days": "100 Giorni",
    "all_arcana": "Tutti gli Arcani",
    "progress": "{{current}}/{{total}}"
  },
  "notifications": {
    "morning": "Il tuo oroscopo di oggi e' pronto",
    "evening": "Hai pescato la tua carta oggi?",
    "streak": "Non perdere la tua serie di {{count}} giorni!"
  },
  "history": {
    "horoscope": "Oroscopo",
    "tarot": "Tarocchi",
    "wheel": "Ruota",
    "scratch": "Gratta",
    "noEntries": "Nessuna lettura per questo giorno",
    "limitFree": "Storico limitato a 7 giorni"
  }
}
```

NOTE: The `profile.title` key already exists — update it to include the new nested keys while keeping `title`.

- [ ] **Step 3: Commit**

```bash
git add src/features/profile/types.ts src/i18n/locales/it.json
git commit -m "feat: add profile types and Fase 3 Italian translations"
```

---

## Task 2: Storage Extensions

**Files:**
- Modify: `src/services/storage.ts`

- [ ] **Step 1: Add ReadingHistory and NotificationSettings to storage**

Read the existing `src/services/storage.ts`. Add new KEYS and helpers at the end of `storageService` (before the closing `} as const`), and add the import for the new types.

Add to imports at top:
```typescript
import type { ReadingHistoryDay, NotificationSettings } from '@features/profile/types';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@features/profile/types';
```

Add to KEYS:
```typescript
READING_HISTORY: 'reading.history',
NOTIFICATION_SETTINGS: 'notification.settings',
```

Add to storageService (before `clearAll`):
```typescript
getReadingHistory: (): ReadingHistoryDay[] => {
  return getObject<ReadingHistoryDay[]>(KEYS.READING_HISTORY) ?? [];
},

addReadingEntry: (type: ReadingHistoryDay['entries'][0]['type'], summary: string): void => {
  const history = storageService.getReadingHistory();
  const today = new Date().toISOString().split('T')[0];
  const entry = { type, summary, timestamp: new Date().toISOString() };

  const dayIndex = history.findIndex((d) => d.date === today);
  if (dayIndex >= 0) {
    history[dayIndex].entries.push(entry);
  } else {
    history.push({ date: today, entries: [entry] });
  }

  // Trim to 30 days max
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const trimmed = history.filter((d) => d.date >= cutoffStr);

  setObject(KEYS.READING_HISTORY, trimmed);
},

getNotificationSettings: (): NotificationSettings => {
  return getObject<NotificationSettings>(KEYS.NOTIFICATION_SETTINGS) ?? DEFAULT_NOTIFICATION_SETTINGS;
},

setNotificationSettings: (settings: NotificationSettings): void => {
  setObject(KEYS.NOTIFICATION_SETTINGS, settings);
},
```

- [ ] **Step 2: Commit**

```bash
git add src/services/storage.ts
git commit -m "feat: add ReadingHistory and NotificationSettings to storage service"
```

---

## Task 3: useStreak Hook & Tests

**Files:**
- Create: `src/features/profile/hooks/useStreak.ts`
- Create: `__tests__/streak.test.ts`

- [ ] **Step 1: Write streak logic tests**

`__tests__/streak.test.ts`:

```typescript
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
```

- [ ] **Step 2: Create useStreak hook with exported updateStreak function**

`src/features/profile/hooks/useStreak.ts`:

```typescript
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
```

- [ ] **Step 3: Run tests**

```bash
npx jest __tests__/streak.test.ts
```

Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/profile/hooks/useStreak.ts __tests__/streak.test.ts
git commit -m "feat: add useStreak hook with badge logic and tests"
```

---

## Task 4: Notifications Service

**Files:**
- Create: `src/services/notifications.ts`
- Modify: `src/services/index.ts`

- [ ] **Step 1: Create notifications wrapper**

`src/services/notifications.ts`:

```typescript
import * as Notifications from 'expo-notifications';
import i18n from '@i18n/index';
import type { NotificationSettings } from '@features/profile/types';

type NotificationType = 'morning' | 'evening' | 'streak';

const IDENTIFIERS: Record<NotificationType, string> = {
  morning: 'astrale-morning',
  evening: 'astrale-evening',
  streak: 'astrale-streak',
};

export const scheduleNotification = async (
  type: NotificationType,
  hour: number,
  minute: number,
): Promise<void> => {
  await cancelNotification(type);

  const contentMap: Record<NotificationType, { title: string; body: string }> = {
    morning: {
      title: 'Astrale',
      body: i18n.t('notifications.morning'),
    },
    evening: {
      title: 'Astrale',
      body: i18n.t('notifications.evening'),
    },
    streak: {
      title: 'Astrale',
      body: i18n.t('notifications.streak', { count: '' }),
    },
  };

  await Notifications.scheduleNotificationAsync({
    identifier: IDENTIFIERS[type],
    content: contentMap[type],
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};

export const cancelNotification = async (type: NotificationType): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(IDENTIFIERS[type]);
};

export const rescheduleAll = async (settings: NotificationSettings): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (settings.morningEnabled) {
    await scheduleNotification('morning', settings.morningHour, settings.morningMinute);
  }

  if (settings.eveningEnabled) {
    await scheduleNotification('evening', settings.eveningHour, settings.eveningMinute);
  }

  await scheduleNotification('streak', 21, 0);
};
```

- [ ] **Step 2: Update services barrel**

Add to `src/services/index.ts`:
```typescript
export { scheduleNotification, cancelNotification, rescheduleAll } from './notifications';
```

- [ ] **Step 3: Commit**

```bash
git add src/services/notifications.ts src/services/index.ts
git commit -m "feat: add local notifications service with Expo Notifications"
```

---

## Task 5: useReadingHistory & useNotifications Hooks

**Files:**
- Create: `src/features/profile/hooks/useReadingHistory.ts`
- Create: `src/features/profile/hooks/useNotifications.ts`
- Create: `src/features/profile/hooks/index.ts`

- [ ] **Step 1: Create useReadingHistory**

`src/features/profile/hooks/useReadingHistory.ts`:

```typescript
import { useCallback, useState } from 'react';

import { storageService } from '@services/storage';
import type { ReadingHistoryDay, ReadingEntry } from '../types';

export const useReadingHistory = () => {
  const [history] = useState<ReadingHistoryDay[]>(() => storageService.getReadingHistory());

  const getEntriesForDate = useCallback((date: string): ReadingEntry[] => {
    const day = history.find((d) => d.date === date);
    return day?.entries ?? [];
  }, [history]);

  const getDaysWithEntries = useCallback((month: number, year: number): Set<string> => {
    const days = new Set<string>();
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    for (const day of history) {
      if (day.date.startsWith(prefix)) {
        days.add(day.date);
      }
    }
    return days;
  }, [history]);

  return { history, getEntriesForDate, getDaysWithEntries };
};
```

- [ ] **Step 2: Create useNotifications**

`src/features/profile/hooks/useNotifications.ts`:

```typescript
import { useState, useCallback } from 'react';

import { storageService } from '@services/storage';
import { rescheduleAll } from '@services/notifications';
import type { NotificationSettings } from '../types';

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(
    () => storageService.getNotificationSettings(),
  );

  const updateSettings = useCallback(async (partial: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    storageService.setNotificationSettings(updated);
    await rescheduleAll(updated);
  }, [settings]);

  return { settings, updateSettings };
};
```

- [ ] **Step 3: Create barrel export**

`src/features/profile/hooks/index.ts`:

```typescript
export { useStreak, updateStreak } from './useStreak';
export { useReadingHistory } from './useReadingHistory';
export { useNotifications } from './useNotifications';
```

- [ ] **Step 4: Commit**

```bash
git add src/features/profile/hooks/
git commit -m "feat: add useReadingHistory and useNotifications hooks"
```

---

## Task 6: StreakCounter & BadgeGrid Components

**Files:**
- Create: `src/features/profile/components/StreakCounter.tsx`
- Create: `src/features/profile/components/BadgeGrid.tsx`

- [ ] **Step 1: Create StreakCounter**

`src/features/profile/components/StreakCounter.tsx`:

```tsx
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Body, Title } from '@shared/components';
import { Card } from '@shared/components';
import { colors, spacing } from '@shared/theme';

type StreakCounterProps = {
  currentStreak: number;
  longestStreak: number;
};

export const StreakCounter = ({ currentStreak, longestStreak }: StreakCounterProps) => {
  const { t } = useTranslation();

  return (
    <Card variant="gold">
      <View style={styles.row}>
        <Body style={styles.flame}>{'\uD83D\uDD25'}</Body>
        <View>
          <Title style={styles.count}>{currentStreak}</Title>
          <Body style={styles.label}>
            {t('profile.streak', { count: currentStreak })}
          </Body>
        </View>
      </View>
      <Body style={styles.longest}>
        {t('profile.longestStreak', { count: longestStreak })}
      </Body>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flame: { fontSize: 36 },
  count: { fontSize: 32, color: colors.gold },
  label: { fontSize: 13, opacity: 0.7 },
  longest: { fontSize: 11, opacity: 0.5, marginTop: spacing.sm },
});
```

- [ ] **Step 2: Create BadgeGrid**

`src/features/profile/components/BadgeGrid.tsx`:

```tsx
import { StyleSheet, View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Body, Label, Title } from '@shared/components';
import { colors, radius, spacing } from '@shared/theme';
import type { BadgeInfo } from '../types';

type BadgeGridProps = {
  badges: BadgeInfo[];
};

export const BadgeGrid = ({ badges }: BadgeGridProps) => {
  const { t } = useTranslation();

  return (
    <View>
      <Title style={styles.sectionTitle}>{t('profile.badges')}</Title>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {badges.map((badge) => (
          <View key={badge.id} style={[styles.badge, badge.earned ? styles.earned : styles.notEarned]}>
            <Body style={[styles.icon, !badge.earned && styles.iconGrey]}>{badge.icon}</Body>
            <Body style={[styles.name, !badge.earned && styles.nameGrey]}>{t(badge.nameKey)}</Body>
            {!badge.earned && (
              <Body style={styles.progress}>
                {t('badges.progress', { current: badge.current, total: badge.total })}
              </Body>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, marginBottom: spacing.md },
  scroll: { gap: spacing.md, paddingRight: spacing.xl },
  badge: {
    width: 90, borderRadius: radius.md, padding: spacing.md,
    alignItems: 'center', gap: spacing.xs,
  },
  earned: { backgroundColor: colors.goldMuted, borderWidth: 1, borderColor: colors.goldBorder },
  notEarned: { backgroundColor: colors.whiteOverlay, borderWidth: 1, borderColor: colors.whiteBorder },
  icon: { fontSize: 28 },
  iconGrey: { opacity: 0.3 },
  name: { fontSize: 10, color: colors.gold, textAlign: 'center', fontFamily: 'Inter-Medium' },
  nameGrey: { color: colors.whiteDim },
  progress: { fontSize: 9, color: colors.whiteDim, opacity: 0.6 },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/features/profile/components/StreakCounter.tsx src/features/profile/components/BadgeGrid.tsx
git commit -m "feat: add StreakCounter and BadgeGrid components"
```

---

## Task 7: ReadingCalendar, ReadingDayDetail & NotificationSettings Components

**Files:**
- Create: `src/features/profile/components/ReadingCalendar.tsx`
- Create: `src/features/profile/components/ReadingDayDetail.tsx`
- Create: `src/features/profile/components/NotificationSettings.tsx`

- [ ] **Step 1: Create ReadingCalendar**

`src/features/profile/components/ReadingCalendar.tsx`:

```tsx
import { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Body, Title } from '@shared/components';
import { colors, radius, spacing } from '@shared/theme';

type ReadingCalendarProps = {
  daysWithEntries: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  maxDaysBack: number;
};

const WEEKDAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

const getMonthDays = (year: number, month: number): (number | null)[] => {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  return cells;
};

const formatDate = (year: number, month: number, day: number): string =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const ReadingCalendar = ({
  daysWithEntries,
  selectedDate,
  onSelectDate,
  maxDaysBack,
}: ReadingCalendarProps) => {
  const { t } = useTranslation();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const days = getMonthDays(viewYear, viewMonth);
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxDaysBack);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else { setViewMonth(viewMonth - 1); }
  };

  const goForward = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else { setViewMonth(viewMonth + 1); }
  };

  return (
    <View>
      <Title style={styles.sectionTitle}>{t('profile.history')}</Title>

      <View style={styles.header}>
        <Pressable onPress={goBack}><Body style={styles.arrow}>{'<'}</Body></Pressable>
        <Body style={styles.monthName}>{monthName}</Body>
        <Pressable onPress={goForward}><Body style={styles.arrow}>{'>'}</Body></Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <Body key={i} style={styles.weekday}>{d}</Body>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day, i) => {
          if (day === null) return <View key={`e-${i}`} style={styles.cell} />;

          const dateStr = formatDate(viewYear, viewMonth, day);
          const hasEntry = daysWithEntries.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isFuture = dateStr > todayStr;
          const isOutOfRange = dateStr < cutoffStr;
          const disabled = isFuture || isOutOfRange;

          return (
            <Pressable
              key={dateStr}
              onPress={() => !disabled && onSelectDate(dateStr)}
              style={[styles.cell, isSelected && styles.cellSelected]}
            >
              <Body style={[styles.dayText, disabled && styles.dayDisabled]}>{day}</Body>
              {hasEntry && <View style={styles.dot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  arrow: { color: colors.gold, fontSize: 18, paddingHorizontal: spacing.md },
  monthName: { fontSize: 14, fontFamily: 'Inter-Medium', color: colors.pearlWhite, textTransform: 'capitalize' },
  weekRow: { flexDirection: 'row', marginBottom: spacing.xs },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, color: colors.whiteDim, fontFamily: 'Inter-Medium' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  cellSelected: { backgroundColor: colors.goldMuted },
  dayText: { fontSize: 13, color: colors.pearlWhite },
  dayDisabled: { opacity: 0.25 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.gold, marginTop: 2 },
});
```

- [ ] **Step 2: Create ReadingDayDetail**

`src/features/profile/components/ReadingDayDetail.tsx`:

```tsx
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Body, Card } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import type { ReadingEntry } from '../types';

type ReadingDayDetailProps = {
  date: string;
  entries: ReadingEntry[];
};

const TYPE_ICONS: Record<string, string> = {
  horoscope: '\u2609',
  tarot: '\u2721',
  wheel: '\u2728',
  scratch: '\u2B50',
};

export const ReadingDayDetail = ({ date, entries }: ReadingDayDetailProps) => {
  const { t } = useTranslation();

  if (entries.length === 0) {
    return (
      <Body style={styles.empty}>{t('history.noEntries')}</Body>
    );
  }

  return (
    <View style={styles.container}>
      {entries.map((entry, i) => (
        <Card key={i} variant="subtle" style={styles.entry}>
          <View style={styles.row}>
            <Body style={styles.icon}>{TYPE_ICONS[entry.type] ?? ''}</Body>
            <View style={styles.content}>
              <Body style={styles.type}>{t(`history.${entry.type}`)}</Body>
              <Body style={styles.summary} numberOfLines={2}>{entry.summary}</Body>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.sm, marginTop: spacing.md },
  empty: { opacity: 0.4, textAlign: 'center', marginTop: spacing.lg },
  entry: { padding: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  icon: { fontSize: 20 },
  content: { flex: 1, gap: 2 },
  type: { fontSize: 12, fontFamily: 'Inter-SemiBold', color: colors.gold },
  summary: { fontSize: 12, opacity: 0.7 },
});
```

- [ ] **Step 3: Create NotificationSettings component**

`src/features/profile/components/NotificationSettings.tsx`:

```tsx
import { StyleSheet, View, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Body, Title } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import type { NotificationSettings as NotificationSettingsType } from '../types';

type NotificationSettingsProps = {
  settings: NotificationSettingsType;
  onUpdate: (partial: Partial<NotificationSettingsType>) => void;
};

export const NotificationSettings = ({ settings, onUpdate }: NotificationSettingsProps) => {
  const { t } = useTranslation();

  const formatTime = (hour: number, minute: number): string =>
    `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return (
    <View>
      <Title style={styles.sectionTitle}>{t('profile.notifications')}</Title>

      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Body style={styles.label}>{t('profile.morning')}</Body>
          <Body style={styles.time}>{formatTime(settings.morningHour, settings.morningMinute)}</Body>
        </View>
        <Switch
          value={settings.morningEnabled}
          onValueChange={(v) => onUpdate({ morningEnabled: v })}
          trackColor={{ true: colors.gold, false: colors.whiteBorder }}
          thumbColor={colors.pearlWhite}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Body style={styles.label}>{t('profile.evening')}</Body>
          <Body style={styles.time}>{formatTime(settings.eveningHour, settings.eveningMinute)}</Body>
        </View>
        <Switch
          value={settings.eveningEnabled}
          onValueChange={(v) => onUpdate({ eveningEnabled: v })}
          trackColor={{ true: colors.gold, false: colors.whiteBorder }}
          thumbColor={colors.pearlWhite}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, marginBottom: spacing.md },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.whiteBorder,
  },
  labelRow: { gap: 2 },
  label: { fontSize: 14 },
  time: { fontSize: 11, color: colors.whiteDim },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/features/profile/components/ReadingCalendar.tsx src/features/profile/components/ReadingDayDetail.tsx src/features/profile/components/NotificationSettings.tsx
git commit -m "feat: add ReadingCalendar, ReadingDayDetail, and NotificationSettings components"
```

---

## Task 8: Profile Screen Rewrite

**Files:**
- Create: `src/features/profile/components/index.ts`
- Modify: `app/profile.tsx`

- [ ] **Step 1: Create barrel export**

`src/features/profile/components/index.ts`:

```typescript
export { StreakCounter } from './StreakCounter';
export { BadgeGrid } from './BadgeGrid';
export { ReadingCalendar } from './ReadingCalendar';
export { ReadingDayDetail } from './ReadingDayDetail';
export { NotificationSettings } from './NotificationSettings';
```

- [ ] **Step 2: Rewrite profile screen**

Read `app/profile.tsx`, then REPLACE entirely with:

```tsx
import { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer, Title, Body, Button } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { storageService } from '@services/storage';
import { getZodiacSignById } from '@shared/utils/zodiac';
import { useReadingHistory, useNotifications } from '@features/profile/hooks';
import {
  StreakCounter,
  BadgeGrid,
  ReadingCalendar,
  ReadingDayDetail,
  NotificationSettings,
} from '@features/profile/components';
import type { BadgeInfo } from '@features/profile/types';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = storageService.getUserProfile();
  const streak = storageService.getUserStreak();
  const collectedCards = storageService.getCollectedCards();
  const sign = profile ? getZodiacSignById(profile.zodiacSign) : null;

  const { getEntriesForDate, getDaysWithEntries } = useReadingHistory();
  const { settings, updateSettings } = useNotifications();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth() + 1);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());

  const daysWithEntries = getDaysWithEntries(viewMonth, viewYear);
  const selectedEntries = selectedDate ? getEntriesForDate(selectedDate) : [];

  const badges: BadgeInfo[] = [
    { id: '7_days', nameKey: 'badges.7_days', icon: '\uD83D\uDD25', current: Math.min(streak.currentStreak, 7), total: 7, earned: streak.badges.includes('7_days') },
    { id: '30_days', nameKey: 'badges.30_days', icon: '\u2B50', current: Math.min(streak.currentStreak, 30), total: 30, earned: streak.badges.includes('30_days') },
    { id: '100_days', nameKey: 'badges.100_days', icon: '\uD83D\uDC8E', current: Math.min(streak.currentStreak, 100), total: 100, earned: streak.badges.includes('100_days') },
    { id: 'all_arcana', nameKey: 'badges.all_arcana', icon: '\u2721', current: collectedCards.length, total: 22, earned: streak.badges.includes('all_arcana') },
  ];

  return (
    <ScreenContainer>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()}>
          <Body style={styles.backButton}>{t('common.back')}</Body>
        </Pressable>
        <Title>{t('profile.title')}</Title>

        {sign && (
          <View style={styles.signSection}>
            <Body style={styles.signSymbol}>{sign.symbol}</Body>
            <Body style={styles.signName}>{t(sign.nameKey)}</Body>
            {profile?.ascendant && (
              <Body style={styles.ascendant}>Asc: {t(getZodiacSignById(profile.ascendant).nameKey)}</Body>
            )}
          </View>
        )}

        <StreakCounter currentStreak={streak.currentStreak} longestStreak={streak.longestStreak} />

        <BadgeGrid badges={badges} />

        <ReadingCalendar
          daysWithEntries={daysWithEntries}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          maxDaysBack={7}
        />

        {selectedDate && (
          <ReadingDayDetail date={selectedDate} entries={selectedEntries} />
        )}

        <NotificationSettings settings={settings} onUpdate={updateSettings} />

        <Button title={t('profile.premium')} variant="ghost" onPress={() => {}} style={styles.premiumButton} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing['5xl'] },
  backButton: { color: colors.gold, fontSize: 14 },
  signSection: { alignItems: 'center', gap: spacing.xs },
  signSymbol: { fontSize: 48 },
  signName: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 24, color: colors.pearlWhite },
  ascendant: { opacity: 0.6, fontSize: 14 },
  premiumButton: { marginTop: spacing.lg },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/features/profile/components/index.ts app/profile.tsx
git commit -m "feat: rewrite Profile screen with streak, badges, calendar, and notifications"
```

---

## Task 9: Root Layout Update & ReadingHistory Integration

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `src/features/horoscope/hooks/useHoroscope.ts`
- Modify: `src/features/tarot/hooks/useTarot.ts`
- Modify: `src/features/discover/hooks/useWheel.ts`
- Modify: `src/features/discover/hooks/useScratch.ts`

- [ ] **Step 1: Add useStreak to root layout**

In `app/_layout.tsx`, add import and call:

Add import:
```typescript
import { useStreak } from '@features/profile/hooks';
```

Inside `RootLayout` function, after the `onboardingDone` state, add:
```typescript
useStreak();
```

- [ ] **Step 2: Add ReadingHistory save to useHoroscope**

In `src/features/horoscope/hooks/useHoroscope.ts`, after the line `setHoroscope(data)` (inside the `snap.exists()` block), add:
```typescript
storageService.addReadingEntry('horoscope', data.general.slice(0, 80));
```

- [ ] **Step 3: Add ReadingHistory save to useTarot**

In `src/features/tarot/hooks/useTarot.ts`, inside `drawCards` after the `fetchInterpretation` call at the end, add:
```typescript
storageService.addReadingEntry('tarot', drawn[0].card.id);
```

- [ ] **Step 4: Add ReadingHistory save to useWheel**

In `src/features/discover/hooks/useWheel.ts`, inside `selectResult` after `setResult(selected)`, add:
```typescript
storageService.addReadingEntry('wheel', selected.fullText.slice(0, 80));
```

- [ ] **Step 5: Add ReadingHistory save to useScratch**

In `src/features/discover/hooks/useScratch.ts`, inside `reveal` before the daily usage update, add:
```typescript
const content = contents[selectedIndex ?? 0] ?? '';
storageService.addReadingEntry('scratch', content.slice(0, 80));
```

- [ ] **Step 6: Commit**

```bash
git add app/_layout.tsx src/features/horoscope/hooks/useHoroscope.ts src/features/tarot/hooks/useTarot.ts src/features/discover/hooks/useWheel.ts src/features/discover/hooks/useScratch.ts
git commit -m "feat: integrate streak at root layout and add ReadingHistory to all features"
```

---

## Post-Plan Verification

```bash
# Run all tests
npx jest

# Type check
npx tsc --noEmit
```

All must pass. The Profile screen shows streak counter, badge grid, reading calendar with dot indicators, notification toggle settings, and premium banner. Streak updates on every app open. All features save to reading history.
