# Astrale — Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the Astrale mobile app foundations — project scaffolding, design system, navigation, onboarding flow, storage, i18n, and Firebase config.

**Architecture:** Expo (React Native) with file-based routing (Expo Router). Feature-based folder structure under `src/features/`. MMKV for local persistence, Firebase Firestore for remote content (read-only from client). i18n ready from day zero.

**Tech Stack:** Expo SDK 53, TypeScript, Expo Router v4, react-native-mmkv, react-i18next, Firebase JS SDK, expo-font, expo-localization, expo-notifications, react-native-reanimated, react-native-gesture-handler

---

## File Map

### New Files (Phase 1)

| Path | Responsibility |
|------|---------------|
| `package.json` | Dependencies and scripts |
| `app.json` | Expo configuration |
| `tsconfig.json` | TypeScript config |
| `babel.config.js` | Babel config for Expo |
| `.gitignore` | Git ignore rules |
| `.env.example` | Environment variables template |
| `app/_layout.tsx` | Root layout (fonts, splash, nav guard) |
| `app/(onboarding)/_layout.tsx` | Onboarding stack layout |
| `app/(onboarding)/sign.tsx` | Screen: zodiac sign selection |
| `app/(onboarding)/ascendant.tsx` | Screen: ascendant selection |
| `app/(onboarding)/interests.tsx` | Screen: interests selection |
| `app/(onboarding)/notifications.tsx` | Screen: push notification permission |
| `app/(tabs)/_layout.tsx` | Tab layout with custom tab bar |
| `app/(tabs)/index.tsx` | Screen: Home (placeholder) |
| `app/(tabs)/tarot.tsx` | Screen: Tarot (placeholder) |
| `app/(tabs)/discover.tsx` | Screen: Discover (placeholder) |
| `app/profile.tsx` | Screen: Profile (placeholder) |
| `src/shared/theme/colors.ts` | Color palette constants |
| `src/shared/theme/spacing.ts` | Spacing scale |
| `src/shared/theme/typography.ts` | Font family + size tokens |
| `src/shared/theme/index.ts` | Theme barrel export |
| `src/shared/components/ScreenContainer.tsx` | Gradient background wrapper |
| `src/shared/components/Typography.tsx` | Title, Body, Label components |
| `src/shared/components/Button.tsx` | Primary + secondary buttons |
| `src/shared/components/Card.tsx` | Themed card container |
| `src/shared/components/ProgressBar.tsx` | Segmented progress bar |
| `src/shared/components/index.ts` | Components barrel export |
| `src/shared/utils/zodiac.ts` | Zodiac sign data + calculation |
| `src/services/storage.ts` | MMKV instance + typed helpers |
| `src/services/firebase.ts` | Firebase app + Firestore init |
| `src/services/index.ts` | Services barrel export |
| `src/i18n/index.ts` | i18next config |
| `src/i18n/locales/it.json` | Italian translations |
| `src/features/onboarding/types.ts` | Onboarding-related types |
| `src/features/onboarding/components/ZodiacGrid.tsx` | 12-sign selection grid |
| `src/features/onboarding/components/InterestCard.tsx` | Interest selection card |
| `src/features/onboarding/components/index.ts` | Barrel export |
| `src/features/onboarding/hooks/useOnboarding.ts` | Onboarding state management |
| `__tests__/zodiac.test.ts` | Zodiac calculation tests |
| `__tests__/storage.test.ts` | Storage service tests |
| `assets/fonts/PlayfairDisplay-Bold.ttf` | Title font (download manually) |
| `assets/fonts/Inter-Regular.ttf` | Body font regular (download manually) |
| `assets/fonts/Inter-Medium.ttf` | Body font medium (download manually) |
| `assets/fonts/Inter-SemiBold.ttf` | Body font semibold (download manually) |

---

## Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`, `.gitignore`, `.env.example`
- Create: folder structure under `src/`, `app/`, `assets/`

- [ ] **Step 1: Create Expo project**

```bash
cd /tmp
npx create-expo-app@latest astrale-init --template blank-typescript --yes
```

- [ ] **Step 2: Copy generated files to project directory**

```bash
cp /tmp/astrale-init/package.json /Users/jacopocariato/Documents/codes/astrale/
cp /tmp/astrale-init/tsconfig.json /Users/jacopocariato/Documents/codes/astrale/
cp /tmp/astrale-init/babel.config.js /Users/jacopocariato/Documents/codes/astrale/
cp /tmp/astrale-init/app.json /Users/jacopocariato/Documents/codes/astrale/
cp /tmp/astrale-init/.gitignore /Users/jacopocariato/Documents/codes/astrale/
rm -rf /tmp/astrale-init
```

- [ ] **Step 3: Update app.json**

```json
{
  "expo": {
    "name": "Astrale",
    "slug": "astrale",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "astrale",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "splash": {
      "backgroundColor": "#0d0d0d"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.astrale.app"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#0d0d0d"
      },
      "package": "com.astrale.app"
    },
    "plugins": [
      "expo-router",
      "expo-localization",
      "expo-font"
    ]
  }
}
```

- [ ] **Step 4: Install core dependencies**

```bash
cd /Users/jacopocariato/Documents/codes/astrale
npx expo install expo-router expo-font expo-splash-screen expo-localization expo-notifications expo-constants expo-linking expo-status-bar react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens react-native-mmkv expo-dev-client
```

- [ ] **Step 5: Install additional dependencies**

```bash
npm install firebase react-i18next i18next zustand
```

- [ ] **Step 6: Create .env.example**

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

- [ ] **Step 7: Update .gitignore — append project-specific entries**

Add to the bottom of `.gitignore`:

```
# Environment
.env
.env.local

# Superpowers
.superpowers/
```

- [ ] **Step 8: Create folder structure**

```bash
mkdir -p src/shared/theme
mkdir -p src/shared/components
mkdir -p src/shared/utils
mkdir -p src/services
mkdir -p src/i18n/locales
mkdir -p src/features/onboarding/components
mkdir -p src/features/onboarding/hooks
mkdir -p src/features/horoscope/components
mkdir -p src/features/horoscope/hooks
mkdir -p src/features/tarot/components
mkdir -p src/features/tarot/hooks
mkdir -p src/features/tarot/data
mkdir -p src/features/discover/components
mkdir -p src/features/discover/hooks
mkdir -p src/features/profile/components
mkdir -p src/features/profile/hooks
mkdir -p src/features/premium/components
mkdir -p src/features/premium/hooks
mkdir -p app/\(onboarding\)
mkdir -p app/\(tabs\)
mkdir -p assets/fonts
mkdir -p __tests__
```

- [ ] **Step 9: Update tsconfig.json — add path aliases**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/shared/*"],
      "@features/*": ["src/features/*"],
      "@services/*": ["src/services/*"],
      "@i18n/*": ["src/i18n/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 10: Update babel.config.js — add module resolver**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@shared': './src/shared',
            '@features': './src/features',
            '@services': './src/services',
            '@i18n': './src/i18n',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
```

- [ ] **Step 11: Install babel-plugin-module-resolver**

```bash
npm install --save-dev babel-plugin-module-resolver
```

- [ ] **Step 12: Download fonts**

Download from Google Fonts and place in `assets/fonts/`:
- `PlayfairDisplay-Bold.ttf` — from [Playfair Display](https://fonts.google.com/specimen/Playfair+Display)
- `Inter-Regular.ttf` — from [Inter](https://fonts.google.com/specimen/Inter)
- `Inter-Medium.ttf`
- `Inter-SemiBold.ttf`

- [ ] **Step 13: Verify project builds**

```bash
npx expo start --clear
```

Expected: Metro bundler starts without errors.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: scaffold Expo project with dependencies and folder structure"
```

---

## Task 2: Theme & Design Tokens

**Files:**
- Create: `src/shared/theme/colors.ts`
- Create: `src/shared/theme/spacing.ts`
- Create: `src/shared/theme/typography.ts`
- Create: `src/shared/theme/index.ts`

- [ ] **Step 1: Create color constants**

`src/shared/theme/colors.ts`:

```typescript
export const colors = {
  black: '#0d0d0d',
  deepPurple: '#1a1028',
  gold: '#d4af37',
  pearlWhite: '#f5f0e8',

  goldMuted: 'rgba(212, 175, 55, 0.15)',
  goldBorder: 'rgba(212, 175, 55, 0.3)',
  whiteOverlay: 'rgba(245, 240, 232, 0.08)',
  whiteBorder: 'rgba(245, 240, 232, 0.1)',
  whiteSubtle: 'rgba(245, 240, 232, 0.6)',
  whiteDim: 'rgba(245, 240, 232, 0.5)',

  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;
```

- [ ] **Step 2: Create spacing scale**

`src/shared/theme/spacing.ts`:

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  '2xl': 20,
} as const;
```

- [ ] **Step 3: Create typography tokens**

`src/shared/theme/typography.ts`:

```typescript
export const fontFamilies = {
  title: 'PlayfairDisplay-Bold',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
} as const;

export const fontSizes = {
  xs: 10,
  sm: 11,
  md: 12,
  body: 14,
  lg: 15,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
} as const;
```

- [ ] **Step 4: Create barrel export**

`src/shared/theme/index.ts`:

```typescript
export { colors } from './colors';
export type { ColorName } from './colors';
export { spacing, radius } from './spacing';
export { fontFamilies, fontSizes, lineHeights } from './typography';
```

- [ ] **Step 5: Commit**

```bash
git add src/shared/theme/
git commit -m "feat: add design system tokens (colors, spacing, typography)"
```

---

## Task 3: Shared UI Components

**Files:**
- Create: `src/shared/components/ScreenContainer.tsx`
- Create: `src/shared/components/Typography.tsx`
- Create: `src/shared/components/Button.tsx`
- Create: `src/shared/components/Card.tsx`
- Create: `src/shared/components/ProgressBar.tsx`
- Create: `src/shared/components/index.ts`

- [ ] **Step 1: Create ScreenContainer**

`src/shared/components/ScreenContainer.tsx`:

```tsx
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@shared/theme';

type ScreenContainerProps = {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export const ScreenContainer = ({
  children,
  edges = ['top', 'bottom'],
}: ScreenContainerProps) => {
  return (
    <LinearGradient
      colors={[colors.black, colors.deepPurple]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
});
```

- [ ] **Step 2: Install expo-linear-gradient**

```bash
npx expo install expo-linear-gradient
```

- [ ] **Step 3: Create Typography components**

`src/shared/components/Typography.tsx`:

```tsx
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, fontFamilies, fontSizes, lineHeights } from '@shared/theme';

type TypographyProps = TextProps & {
  color?: string;
};

export const Title = ({ style, color, ...props }: TypographyProps) => (
  <Text
    style={[styles.title, color ? { color } : undefined, style]}
    {...props}
  />
);

export const Subtitle = ({ style, color, ...props }: TypographyProps) => (
  <Text
    style={[styles.subtitle, color ? { color } : undefined, style]}
    {...props}
  />
);

export const Body = ({ style, color, ...props }: TypographyProps) => (
  <Text
    style={[styles.body, color ? { color } : undefined, style]}
    {...props}
  />
);

export const Label = ({ style, color, ...props }: TypographyProps) => (
  <Text
    style={[styles.label, color ? { color } : undefined, style]}
    {...props}
  />
);

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamilies.title,
    fontSize: fontSizes.xl,
    color: colors.gold,
    lineHeight: fontSizes.xl * lineHeights.tight,
  },
  subtitle: {
    fontFamily: fontFamilies.title,
    fontSize: fontSizes['2xl'],
    color: colors.pearlWhite,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.body,
    color: colors.pearlWhite,
    lineHeight: fontSizes.body * lineHeights.relaxed,
  },
  label: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    color: colors.whiteSubtle,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: 1,
  },
});
```

- [ ] **Step 4: Create Button component**

`src/shared/components/Button.tsx`:

```tsx
import { StyleSheet, Pressable, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@shared/theme';
import { Body } from './Typography';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
};

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: ButtonProps) => {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Body
        color={isPrimary ? colors.black : colors.pearlWhite}
        style={styles.text}
      >
        {title}
      </Body>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.gold,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});
```

- [ ] **Step 5: Create Card component**

`src/shared/components/Card.tsx`:

```tsx
import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@shared/theme';

type CardProps = {
  children: ReactNode;
  variant?: 'gold' | 'subtle';
  style?: ViewStyle;
};

export const Card = ({
  children,
  variant = 'subtle',
  style,
}: CardProps) => {
  const isGold = variant === 'gold';

  return (
    <View
      style={[
        styles.base,
        isGold ? styles.gold : styles.subtle,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  gold: {
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  subtle: {
    backgroundColor: colors.whiteOverlay,
    borderWidth: 1,
    borderColor: colors.whiteBorder,
  },
});
```

- [ ] **Step 6: Create ProgressBar component**

`src/shared/components/ProgressBar.tsx`:

```tsx
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@shared/theme';

type ProgressBarProps = {
  steps: number;
  currentStep: number;
};

export const ProgressBar = ({ steps, currentStep }: ProgressBarProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: steps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i < currentStep ? styles.active : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: radius.sm,
  },
  active: {
    backgroundColor: colors.gold,
  },
  inactive: {
    backgroundColor: colors.whiteBorder,
  },
});
```

- [ ] **Step 7: Create barrel export**

`src/shared/components/index.ts`:

```typescript
export { ScreenContainer } from './ScreenContainer';
export { Title, Subtitle, Body, Label } from './Typography';
export { Button } from './Button';
export { Card } from './Card';
export { ProgressBar } from './ProgressBar';
```

- [ ] **Step 8: Commit**

```bash
git add src/shared/components/
git commit -m "feat: add shared UI components (ScreenContainer, Typography, Button, Card, ProgressBar)"
```

---

## Task 4: Zodiac Data & Utilities

**Files:**
- Create: `src/shared/utils/zodiac.ts`
- Test: `__tests__/zodiac.test.ts`

- [ ] **Step 1: Write zodiac calculation tests**

`__tests__/zodiac.test.ts`:

```typescript
import { getZodiacSign, zodiacSigns } from '../src/shared/utils/zodiac';

describe('getZodiacSign', () => {
  it('returns aries for March 25', () => {
    expect(getZodiacSign(3, 25)).toBe('aries');
  });

  it('returns taurus for May 15', () => {
    expect(getZodiacSign(5, 15)).toBe('taurus');
  });

  it('returns capricorn for January 5', () => {
    expect(getZodiacSign(1, 5)).toBe('capricorn');
  });

  it('returns sagittarius for December 15', () => {
    expect(getZodiacSign(12, 15)).toBe('sagittarius');
  });

  it('returns capricorn for December 25', () => {
    expect(getZodiacSign(12, 25)).toBe('capricorn');
  });

  it('returns pisces for February 28', () => {
    expect(getZodiacSign(2, 28)).toBe('pisces');
  });

  it('handles boundary: March 21 is aries', () => {
    expect(getZodiacSign(3, 21)).toBe('aries');
  });

  it('handles boundary: March 20 is pisces', () => {
    expect(getZodiacSign(3, 20)).toBe('pisces');
  });

  it('returns the sign from a date string', () => {
    expect(getZodiacSign(5, 15)).toBe('taurus');
  });
});

describe('zodiacSigns', () => {
  it('contains 12 signs', () => {
    expect(zodiacSigns).toHaveLength(12);
  });

  it('each sign has required fields', () => {
    for (const sign of zodiacSigns) {
      expect(sign).toHaveProperty('id');
      expect(sign).toHaveProperty('nameKey');
      expect(sign).toHaveProperty('symbol');
      expect(sign).toHaveProperty('startMonth');
      expect(sign).toHaveProperty('startDay');
      expect(sign).toHaveProperty('endMonth');
      expect(sign).toHaveProperty('endDay');
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/zodiac.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement zodiac utilities**

`src/shared/utils/zodiac.ts`:

```typescript
export type ZodiacSignId =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type ZodiacSign = {
  id: ZodiacSignId;
  nameKey: string;
  symbol: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
};

export const zodiacSigns: ZodiacSign[] = [
  { id: 'aries', nameKey: 'zodiac.aries', symbol: '\u2648', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { id: 'taurus', nameKey: 'zodiac.taurus', symbol: '\u2649', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { id: 'gemini', nameKey: 'zodiac.gemini', symbol: '\u264A', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { id: 'cancer', nameKey: 'zodiac.cancer', symbol: '\u264B', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { id: 'leo', nameKey: 'zodiac.leo', symbol: '\u264C', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { id: 'virgo', nameKey: 'zodiac.virgo', symbol: '\u264D', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { id: 'libra', nameKey: 'zodiac.libra', symbol: '\u264E', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { id: 'scorpio', nameKey: 'zodiac.scorpio', symbol: '\u264F', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { id: 'sagittarius', nameKey: 'zodiac.sagittarius', symbol: '\u2650', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { id: 'capricorn', nameKey: 'zodiac.capricorn', symbol: '\u2651', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { id: 'aquarius', nameKey: 'zodiac.aquarius', symbol: '\u2652', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { id: 'pisces', nameKey: 'zodiac.pisces', symbol: '\u2653', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
];

export const getZodiacSign = (month: number, day: number): ZodiacSignId => {
  const sign = zodiacSigns.find((s) => {
    if (s.startMonth === s.endMonth) {
      return month === s.startMonth && day >= s.startDay && day <= s.endDay;
    }
    if (s.startMonth > s.endMonth) {
      // Wraps around year (Capricorn: Dec 22 - Jan 19)
      return (
        (month === s.startMonth && day >= s.startDay) ||
        (month === s.endMonth && day <= s.endDay)
      );
    }
    return (
      (month === s.startMonth && day >= s.startDay) ||
      (month === s.endMonth && day <= s.endDay)
    );
  });

  return sign?.id ?? 'aries';
};

export const getZodiacSignById = (id: ZodiacSignId): ZodiacSign => {
  return zodiacSigns.find((s) => s.id === id)!;
};

export const getZodiacSignFromDate = (dateString: string): ZodiacSignId => {
  const date = new Date(dateString);
  return getZodiacSign(date.getMonth() + 1, date.getDate());
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/zodiac.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/utils/zodiac.ts __tests__/zodiac.test.ts
git commit -m "feat: add zodiac sign data and calculation utility with tests"
```

---

## Task 5: MMKV Storage Service

**Files:**
- Create: `src/services/storage.ts`
- Create: `src/features/onboarding/types.ts`
- Test: `__tests__/storage.test.ts`

- [ ] **Step 1: Create onboarding types**

`src/features/onboarding/types.ts`:

```typescript
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
```

- [ ] **Step 2: Create storage service**

`src/services/storage.ts`:

```typescript
import { createMMKV } from 'react-native-mmkv';

import type { UserProfile, UserStreak, DailyUsage } from '@features/onboarding/types';

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
      currentStreak: 0,
      longestStreak: 0,
      lastOpenDate: '',
      badges: [],
    };
  },

  setUserStreak: (streak: UserStreak): void => setObject(KEYS.USER_STREAK, streak),

  getDailyUsage: (date: string): DailyUsage => {
    const usage = getObject<DailyUsage>(KEYS.DAILY_USAGE);
    if (usage?.date === date) return usage;
    return {
      date,
      freeHoroscopeRead: false,
      tarotCardDrawn: false,
      wheelSpun: false,
      scratchUsed: false,
      rewardedAdsWatched: 0,
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

  clearAll: (): void => {
    storage.clearAll();
  },
} as const;
```

- [ ] **Step 3: Create services barrel export**

`src/services/index.ts`:

```typescript
export { storage, storageService } from './storage';
```

- [ ] **Step 4: Write storage tests**

`__tests__/storage.test.ts`:

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

beforeEach(() => {
  storageService.clearAll();
});

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
```

- [ ] **Step 5: Run tests**

```bash
npx jest __tests__/storage.test.ts
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/services/ src/features/onboarding/types.ts __tests__/storage.test.ts
git commit -m "feat: add MMKV storage service with typed helpers and tests"
```

---

## Task 6: i18n Setup & Italian Translations

**Files:**
- Create: `src/i18n/index.ts`
- Create: `src/i18n/locales/it.json`

- [ ] **Step 1: Create Italian translations (onboarding + shared)**

`src/i18n/locales/it.json`:

```json
{
  "common": {
    "continue": "Continua",
    "skip": "Forse dopo",
    "back": "Indietro"
  },
  "zodiac": {
    "aries": "Ariete",
    "taurus": "Toro",
    "gemini": "Gemelli",
    "cancer": "Cancro",
    "leo": "Leone",
    "virgo": "Vergine",
    "libra": "Bilancia",
    "scorpio": "Scorpione",
    "sagittarius": "Sagittario",
    "capricorn": "Capricorno",
    "aquarius": "Acquario",
    "pisces": "Pesci"
  },
  "onboarding": {
    "sign": {
      "title": "Qual e' il tuo segno?",
      "subtitle": "Inserisci la tua data di nascita",
      "changeSign": "Non e' il tuo segno? Cambialo"
    },
    "ascendant": {
      "title": "Il tuo ascendente",
      "subtitle": "Opzionale — personalizza la tua esperienza",
      "skip": "Non conosco il mio ascendente",
      "description": "L'ascendente rappresenta la tua immagine esteriore e il modo in cui ti presenti al mondo."
    },
    "interests": {
      "title": "Cosa ti interessa?",
      "subtitle": "Seleziona almeno uno",
      "love": "Amore",
      "loveDesc": "Relazioni e affinita'",
      "work": "Lavoro",
      "workDesc": "Carriera e opportunita'",
      "health": "Salute",
      "healthDesc": "Benessere e energia",
      "luck": "Fortuna",
      "luckDesc": "Numeri e sorprese"
    },
    "notifications": {
      "title": "Non perderti\nl'oroscopo di domani",
      "subtitle": "Ti avviseremo ogni mattina quando il tuo oroscopo e' pronto",
      "enable": "Attiva notifiche",
      "skip": "Forse dopo"
    }
  },
  "tabs": {
    "home": "Home",
    "tarot": "Tarocchi",
    "discover": "Scopri"
  },
  "home": {
    "greeting": "Buongiorno, {{sign}}"
  },
  "profile": {
    "title": "Profilo"
  }
}
```

- [ ] **Step 2: Create i18n configuration**

`src/i18n/index.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import it from './locales/it.json';

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'it';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: it },
    },
    lng: deviceLanguage === 'it' ? 'it' : 'it',
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/
git commit -m "feat: add i18n setup with Italian translations"
```

---

## Task 7: Firebase Configuration

**Files:**
- Create: `src/services/firebase.ts`
- Modify: `src/services/index.ts`

- [ ] **Step 1: Create Firebase config**

`src/services/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
```

- [ ] **Step 2: Update services barrel**

`src/services/index.ts`:

```typescript
export { storage, storageService } from './storage';
export { db } from './firebase';
```

- [ ] **Step 3: Commit**

```bash
git add src/services/
git commit -m "feat: add Firebase configuration with Firestore"
```

---

## Task 8: Root Layout & Navigation Guard

**Files:**
- Create: `app/_layout.tsx`

- [ ] **Step 1: Create root layout**

`app/_layout.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { storageService } from '@services/storage';
import '@i18n/index';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const [fontsLoaded] = useFonts({
    'PlayfairDisplay-Bold': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      const completed = storageService.isOnboardingCompleted();
      setOnboardingDone(completed);
      setIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === '(onboarding)';

    if (!onboardingDone && !inOnboarding) {
      router.replace('/(onboarding)/sign');
    } else if (onboardingDone && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isReady, onboardingDone, segments]);

  if (!isReady) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="profile"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
```

- [ ] **Step 2: Verify the app boots**

```bash
npx expo start --clear
```

Expected: app loads (may show blank screen since tab/onboarding screens don't exist yet — that's OK, no crash).

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: add root layout with font loading, splash screen, and navigation guard"
```

---

## Task 9: Onboarding — Sign & Ascendant Screens

**Files:**
- Create: `app/(onboarding)/_layout.tsx`
- Create: `app/(onboarding)/sign.tsx`
- Create: `app/(onboarding)/ascendant.tsx`
- Create: `src/features/onboarding/hooks/useOnboarding.ts`
- Create: `src/features/onboarding/components/ZodiacGrid.tsx`
- Create: `src/features/onboarding/components/index.ts`

- [ ] **Step 1: Create onboarding hook**

`src/features/onboarding/hooks/useOnboarding.ts`:

```typescript
import { useState } from 'react';

import type { ZodiacSignId } from '@shared/utils/zodiac';
import type { InterestId, UserProfile } from '../types';
import { storageService } from '@services/storage';

export const useOnboarding = () => {
  const [birthDate, setBirthDate] = useState<Date>(new Date(2000, 0, 1));
  const [zodiacSign, setZodiacSign] = useState<ZodiacSignId | null>(null);
  const [ascendant, setAscendant] = useState<ZodiacSignId | null>(null);
  const [interests, setInterests] = useState<InterestId[]>([]);

  const toggleInterest = (id: InterestId) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const completeOnboarding = () => {
    if (!zodiacSign) return;

    const profile: UserProfile = {
      zodiacSign,
      birthDate: birthDate.toISOString().split('T')[0],
      ascendant,
      interests,
      onboardingCompleted: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    storageService.setUserProfile(profile);
  };

  return {
    birthDate,
    setBirthDate,
    zodiacSign,
    setZodiacSign,
    ascendant,
    setAscendant,
    interests,
    toggleInterest,
    completeOnboarding,
  };
};
```

- [ ] **Step 2: Create ZodiacGrid component**

`src/features/onboarding/components/ZodiacGrid.tsx`:

```tsx
import { StyleSheet, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing } from '@shared/theme';
import { Body } from '@shared/components';
import { zodiacSigns, type ZodiacSignId } from '@shared/utils/zodiac';

type ZodiacGridProps = {
  selected: ZodiacSignId | null;
  onSelect: (id: ZodiacSignId) => void;
};

export const ZodiacGrid = ({ selected, onSelect }: ZodiacGridProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.grid}>
      {zodiacSigns.map((sign) => {
        const isSelected = selected === sign.id;
        return (
          <Pressable
            key={sign.id}
            onPress={() => onSelect(sign.id)}
            style={[
              styles.cell,
              isSelected ? styles.cellSelected : styles.cellDefault,
            ]}
          >
            <Body style={styles.symbol}>{sign.symbol}</Body>
            <Body style={styles.name}>{t(sign.nameKey)}</Body>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cell: {
    width: '30%',
    flexGrow: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  cellDefault: {
    backgroundColor: colors.whiteOverlay,
    borderWidth: 1,
    borderColor: colors.whiteBorder,
  },
  cellSelected: {
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  symbol: {
    fontSize: 20,
  },
  name: {
    fontSize: 9,
  },
});
```

- [ ] **Step 3: Create barrel export**

`src/features/onboarding/components/index.ts`:

```typescript
export { ZodiacGrid } from './ZodiacGrid';
```

- [ ] **Step 4: Create onboarding stack layout**

`app/(onboarding)/_layout.tsx`:

```tsx
import { createContext, useContext } from 'react';
import { Stack } from 'expo-router';

import { useOnboarding } from '@features/onboarding/hooks/useOnboarding';

type OnboardingContextType = ReturnType<typeof useOnboarding>;

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboardingContext = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboardingContext must be used within OnboardingLayout');
  return ctx;
};

export default function OnboardingLayout() {
  const onboarding = useOnboarding();

  return (
    <OnboardingContext.Provider value={onboarding}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </OnboardingContext.Provider>
  );
}
```

- [ ] **Step 5: Create Sign screen**

`app/(onboarding)/sign.tsx`:

```tsx
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

import { ScreenContainer, Title, Body, Button, ProgressBar } from '@shared/components';
import { spacing } from '@shared/theme';
import { getZodiacSign, getZodiacSignById } from '@shared/utils/zodiac';
import { useOnboardingContext } from './_layout';

export default function SignScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { birthDate, setBirthDate, zodiacSign, setZodiacSign } = useOnboardingContext();
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (_: unknown, date?: Date) => {
    if (date) {
      setBirthDate(date);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      setZodiacSign(getZodiacSign(month, day));
    }
    setShowPicker(false);
  };

  const sign = zodiacSign ? getZodiacSignById(zodiacSign) : null;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ProgressBar steps={4} currentStep={1} />

        <View style={styles.header}>
          <Title>{t('onboarding.sign.title')}</Title>
          <Body style={styles.subtitle}>{t('onboarding.sign.subtitle')}</Body>
        </View>

        <View style={styles.pickerButton}>
          <Button
            title={birthDate.toLocaleDateString('it-IT')}
            variant="ghost"
            onPress={() => setShowPicker(true)}
          />
        </View>

        {showPicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
            onChange={handleDateChange}
            themeVariant="dark"
          />
        )}

        {sign && (
          <View style={styles.result}>
            <Body style={styles.signSymbol}>{sign.symbol}</Body>
            <Body style={styles.signName}>{t(sign.nameKey)}</Body>
          </View>
        )}

        <View style={styles.footer}>
          <Button
            title={t('common.continue')}
            onPress={() => router.push('/(onboarding)/ascendant')}
            disabled={!zodiacSign}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    marginTop: spacing['3xl'],
    gap: spacing.sm,
  },
  subtitle: {
    opacity: 0.6,
    fontSize: 11,
  },
  pickerButton: {
    marginTop: spacing.xl,
  },
  result: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  signSymbol: {
    fontSize: 48,
  },
  signName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 20,
  },
  footer: {
    marginTop: 'auto',
  },
});
```

- [ ] **Step 6: Install DateTimePicker**

```bash
npx expo install @react-native-community/datetimepicker
```

- [ ] **Step 7: Create Ascendant screen**

`app/(onboarding)/ascendant.tsx`:

```tsx
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer, Title, Body, Button, ProgressBar } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { ZodiacGrid } from '@features/onboarding/components';
import { useOnboardingContext } from './_layout';

export default function AscendantScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { ascendant, setAscendant } = useOnboardingContext();

  const handleSkip = () => {
    setAscendant(null);
    router.push('/(onboarding)/interests');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ProgressBar steps={4} currentStep={2} />

        <View style={styles.header}>
          <Title>{t('onboarding.ascendant.title')}</Title>
          <Body style={styles.subtitle}>{t('onboarding.ascendant.subtitle')}</Body>
        </View>

        <Body style={styles.description}>
          {t('onboarding.ascendant.description')}
        </Body>

        <ZodiacGrid selected={ascendant} onSelect={setAscendant} />

        <Body
          onPress={handleSkip}
          style={styles.skipLink}
        >
          {t('onboarding.ascendant.skip')}
        </Body>

        <View style={styles.footer}>
          <Button
            title={t('common.continue')}
            onPress={() => router.push('/(onboarding)/interests')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    marginTop: spacing['3xl'],
    gap: spacing.sm,
  },
  subtitle: {
    opacity: 0.6,
    fontSize: 11,
  },
  description: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    opacity: 0.7,
    fontSize: 12,
  },
  skipLink: {
    textAlign: 'center',
    color: colors.gold,
    fontSize: 11,
    marginTop: spacing.md,
    opacity: 0.7,
  },
  footer: {
    marginTop: 'auto',
  },
});
```

- [ ] **Step 8: Commit**

```bash
git add app/\(onboarding\)/ src/features/onboarding/
git commit -m "feat: add onboarding layout, sign selection and ascendant screens"
```

---

## Task 10: Onboarding — Interests & Notifications Screens

**Files:**
- Create: `app/(onboarding)/interests.tsx`
- Create: `app/(onboarding)/notifications.tsx`
- Create: `src/features/onboarding/components/InterestCard.tsx`
- Modify: `src/features/onboarding/components/index.ts`

- [ ] **Step 1: Create InterestCard component**

`src/features/onboarding/components/InterestCard.tsx`:

```tsx
import { StyleSheet, Pressable, View } from 'react-native';

import { colors, radius, spacing } from '@shared/theme';
import { Body } from '@shared/components';

type InterestCardProps = {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
};

export const InterestCard = ({
  icon,
  title,
  description,
  selected,
  onPress,
}: InterestCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        selected ? styles.cardSelected : styles.cardDefault,
      ]}
    >
      <Body style={styles.icon}>{icon}</Body>
      <View style={styles.text}>
        <Body style={styles.title}>{title}</Body>
        <Body style={styles.description}>{description}</Body>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardDefault: {
    backgroundColor: colors.whiteOverlay,
    borderWidth: 1,
    borderColor: colors.whiteBorder,
  },
  cardSelected: {
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  icon: {
    fontSize: 24,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  description: {
    fontSize: 10,
    opacity: 0.5,
  },
});
```

- [ ] **Step 2: Update barrel export**

`src/features/onboarding/components/index.ts`:

```typescript
export { ZodiacGrid } from './ZodiacGrid';
export { InterestCard } from './InterestCard';
```

- [ ] **Step 3: Create Interests screen**

`app/(onboarding)/interests.tsx`:

```tsx
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer, Title, Body, Button, ProgressBar } from '@shared/components';
import { spacing } from '@shared/theme';
import { InterestCard } from '@features/onboarding/components';
import type { InterestId } from '@features/onboarding/types';
import { useOnboardingContext } from './_layout';

const INTERESTS: { id: InterestId; icon: string; titleKey: string; descKey: string }[] = [
  { id: 'love', icon: '\u2764', titleKey: 'onboarding.interests.love', descKey: 'onboarding.interests.loveDesc' },
  { id: 'work', icon: '\u2605', titleKey: 'onboarding.interests.work', descKey: 'onboarding.interests.workDesc' },
  { id: 'health', icon: '\u2665', titleKey: 'onboarding.interests.health', descKey: 'onboarding.interests.healthDesc' },
  { id: 'luck', icon: '\u2618', titleKey: 'onboarding.interests.luck', descKey: 'onboarding.interests.luckDesc' },
];

export default function InterestsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { interests, toggleInterest } = useOnboardingContext();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ProgressBar steps={4} currentStep={3} />

        <View style={styles.header}>
          <Title>{t('onboarding.interests.title')}</Title>
          <Body style={styles.subtitle}>{t('onboarding.interests.subtitle')}</Body>
        </View>

        <View style={styles.cards}>
          {INTERESTS.map((item) => (
            <InterestCard
              key={item.id}
              icon={item.icon}
              title={t(item.titleKey)}
              description={t(item.descKey)}
              selected={interests.includes(item.id)}
              onPress={() => toggleInterest(item.id)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title={t('common.continue')}
            onPress={() => router.push('/(onboarding)/notifications')}
            disabled={interests.length === 0}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    marginTop: spacing['3xl'],
    gap: spacing.sm,
  },
  subtitle: {
    opacity: 0.6,
    fontSize: 11,
  },
  cards: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  footer: {
    marginTop: 'auto',
  },
});
```

- [ ] **Step 4: Create Notifications screen**

`app/(onboarding)/notifications.tsx`:

```tsx
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';

import { ScreenContainer, Title, Body, Button, ProgressBar } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { useOnboardingContext } from './_layout';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { completeOnboarding } = useOnboardingContext();

  const handleEnable = async () => {
    await Notifications.requestPermissionsAsync();
    finishOnboarding();
  };

  const finishOnboarding = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ProgressBar steps={4} currentStep={4} />

        <View style={styles.content}>
          <Body style={styles.bellIcon}>{'\uD83D\uDD14'}</Body>
          <Title style={styles.title}>
            {t('onboarding.notifications.title')}
          </Title>
          <Body style={styles.subtitle}>
            {t('onboarding.notifications.subtitle')}
          </Body>
        </View>

        <View style={styles.footer}>
          <Button
            title={t('onboarding.notifications.enable')}
            onPress={handleEnable}
          />
          <Body
            onPress={finishOnboarding}
            style={styles.skipLink}
          >
            {t('onboarding.notifications.skip')}
          </Body>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  bellIcon: {
    fontSize: 56,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 220,
  },
  footer: {
    gap: spacing.md,
    alignItems: 'center',
  },
  skipLink: {
    color: colors.pearlWhite,
    fontSize: 12,
    opacity: 0.5,
  },
});
```

- [ ] **Step 5: Commit**

```bash
git add app/\(onboarding\)/ src/features/onboarding/components/
git commit -m "feat: add onboarding interests and notifications screens"
```

---

## Task 11: Tab Layout, Custom Tab Bar & Placeholder Screens

**Files:**
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/index.tsx`
- Create: `app/(tabs)/tarot.tsx`
- Create: `app/(tabs)/discover.tsx`
- Create: `app/profile.tsx`

- [ ] **Step 1: Create tab layout with custom tab bar**

`app/(tabs)/_layout.tsx`:

```tsx
import { StyleSheet, View, Pressable } from 'react-native';
import { Tabs, type TabsProps } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@shared/theme';
import { Body } from '@shared/components';

type TabBarProps = Parameters<NonNullable<TabsProps['tabBar']>>[0];

const TAB_ICONS: Record<string, string> = {
  index: '\u2609',
  tarot: '\u2721',
  discover: '\u2728',
};

const CustomTabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || spacing.md }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = (options.title ?? route.name) as string;

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              if (!isFocused) {
                navigation.navigate(route.name);
              }
            }}
            style={styles.tab}
          >
            <Body
              style={[
                styles.tabIcon,
                { color: isFocused ? colors.gold : colors.whiteDim },
              ]}
            >
              {TAB_ICONS[route.name] ?? '\u25CF'}
            </Body>
            <Body
              style={[
                styles.tabLabel,
                { color: isFocused ? colors.gold : colors.whiteDim },
              ]}
            >
              {label}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
};

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="tarot" options={{ title: t('tabs.tarot') }} />
      <Tabs.Screen name="discover" options={{ title: t('tabs.discover') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.black,
    borderTopWidth: 1,
    borderTopColor: colors.whiteBorder,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
});
```

- [ ] **Step 2: Create Home placeholder**

`app/(tabs)/index.tsx`:

```tsx
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer, Title, Body } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { storageService } from '@services/storage';
import { getZodiacSignById } from '@shared/utils/zodiac';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = storageService.getUserProfile();
  const sign = profile ? getZodiacSignById(profile.zodiacSign) : null;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Title>
              {t('home.greeting', { sign: sign ? t(sign.nameKey) : '' })}
            </Title>
            <Body style={styles.date}>
              {new Date().toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Body>
          </View>
          <Pressable onPress={() => router.push('/profile')}>
            <View style={styles.avatar}>
              <Body style={styles.avatarText}>
                {sign?.symbol ?? '\u2609'}
              </Body>
            </View>
          </Pressable>
        </View>

        <View style={styles.placeholder}>
          <Body style={styles.placeholderText}>
            Oroscopo giornaliero — Fase 2
          </Body>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  date: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: spacing.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    opacity: 0.3,
    fontSize: 14,
  },
});
```

- [ ] **Step 3: Create Tarot placeholder**

`app/(tabs)/tarot.tsx`:

```tsx
import { StyleSheet, View } from 'react-native';

import { ScreenContainer, Title, Body } from '@shared/components';
import { spacing } from '@shared/theme';

export default function TarotScreen() {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Title>Tarocchi</Title>
        <View style={styles.placeholder}>
          <Body style={styles.placeholderText}>
            Pesca la carta — Fase 2
          </Body>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    opacity: 0.3,
    fontSize: 14,
  },
});
```

- [ ] **Step 4: Create Discover placeholder**

`app/(tabs)/discover.tsx`:

```tsx
import { StyleSheet, View } from 'react-native';

import { ScreenContainer, Title, Body } from '@shared/components';
import { spacing } from '@shared/theme';

export default function DiscoverScreen() {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Title>Scopri</Title>
        <View style={styles.placeholder}>
          <Body style={styles.placeholderText}>
            Ruota + Gratta — Fase 2
          </Body>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing['3xl'],
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    opacity: 0.3,
    fontSize: 14,
  },
});
```

- [ ] **Step 5: Create Profile placeholder**

`app/profile.tsx`:

```tsx
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer, Title, Body } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { storageService } from '@services/storage';
import { getZodiacSignById } from '@shared/utils/zodiac';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = storageService.getUserProfile();
  const sign = profile ? getZodiacSignById(profile.zodiacSign) : null;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Body style={styles.backButton}>{t('common.back')}</Body>
          </Pressable>
          <Title>{t('profile.title')}</Title>
        </View>

        {sign && (
          <View style={styles.signSection}>
            <Body style={styles.signSymbol}>{sign.symbol}</Body>
            <Body style={styles.signName}>{t(sign.nameKey)}</Body>
            {profile?.ascendant && (
              <Body style={styles.ascendantText}>
                Asc: {t(getZodiacSignById(profile.ascendant).nameKey)}
              </Body>
            )}
          </View>
        )}

        <View style={styles.placeholder}>
          <Body style={styles.placeholderText}>
            Streak, Badge, Storico — Fase 3
          </Body>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    gap: spacing.lg,
  },
  backButton: {
    color: colors.gold,
    fontSize: 14,
  },
  signSection: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
    gap: spacing.sm,
  },
  signSymbol: {
    fontSize: 48,
  },
  signName: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 24,
  },
  ascendantText: {
    opacity: 0.6,
    fontSize: 14,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    opacity: 0.3,
    fontSize: 14,
  },
});
```

- [ ] **Step 6: Run the app end-to-end**

```bash
npx expo start --clear
```

Verify:
1. App opens → redirects to onboarding (sign screen)
2. Select date → sign appears
3. Continue → ascendant grid
4. Continue → interests (select at least one)
5. Continue → notifications
6. Skip or enable → redirects to tabs
7. 3 tabs visible at bottom (Home, Tarocchi, Scopri)
8. Home shows greeting with sign name
9. Avatar tap → profile screen opens
10. Back from profile → home

- [ ] **Step 7: Commit**

```bash
git add app/\(tabs\)/ app/profile.tsx
git commit -m "feat: add tab layout with custom tab bar and placeholder screens"
```

---

## Post-Plan Verification

After all 11 tasks are complete, run these checks:

```bash
# Type check
npx tsc --noEmit

# Run all tests
npx jest

# Start the app
npx expo start --clear
```

All three must pass. The app should boot, show onboarding on first launch, and navigate to tabs after completion. On subsequent launches, it should skip onboarding and go directly to tabs.
