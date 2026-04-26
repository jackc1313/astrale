# Astrale Fase 2B — Interactive Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the three interactive features: Tarot with fan layout + 3D flip animation, Fortune Wheel with Skia rendering + gesture spin, and Scratch Cards with Skia scratch effect.

**Architecture:** Each feature lives in its own feature folder (`tarot/`, `discover/`). Tarot uses Reanimated for the fan carousel and 3D flip. Fortune Wheel and Scratch Cards use @shopify/react-native-skia for canvas rendering. All features share the `useRewardedAd` hook for ad gates and MMKV for daily usage tracking. Firestore provides content (tarot interpretations, daily wheel/scratch content).

**Tech Stack:** React Native Reanimated, React Native Gesture Handler, @shopify/react-native-skia, expo-haptics, Firebase Firestore

---

## File Map

### Tarot Feature

| Path | Responsibility |
|------|---------------|
| `src/features/tarot/types.ts` | TarotCard, TarotMode, DrawResult types |
| `src/features/tarot/data/majorArcana.ts` | 22 Major Arcana cards data |
| `src/features/tarot/components/TarotCard.tsx` | Single card (front design + back) |
| `src/features/tarot/components/CardFlip.tsx` | 3D flip animation wrapper |
| `src/features/tarot/components/TarotFan.tsx` | Interactive fan carousel with gesture |
| `src/features/tarot/components/ModeSelector.tsx` | Segmented control for 3 modes |
| `src/features/tarot/components/TarotResult.tsx` | Result display with interpretation |
| `src/features/tarot/components/index.ts` | Barrel export |
| `src/features/tarot/hooks/useTarot.ts` | State management, draw, Firestore fetch |
| `src/features/tarot/hooks/index.ts` | Barrel export |
| `app/(tabs)/tarot.tsx` | Tarot screen (rewrite) |

### Discover Feature

| Path | Responsibility |
|------|---------------|
| `src/features/discover/types.ts` | WheelState, ScratchState types |
| `src/features/discover/components/DiscoverTabs.tsx` | Segmented control Wheel/Scratch |
| `src/features/discover/components/FortuneWheel.tsx` | Skia wheel canvas |
| `src/features/discover/components/WheelIndicator.tsx` | Fixed arrow indicator |
| `src/features/discover/components/WheelResult.tsx` | Result card |
| `src/features/discover/components/ScratchCard.tsx` | Skia scratch overlay |
| `src/features/discover/components/ScratchSelector.tsx` | 3-card selection |
| `src/features/discover/components/index.ts` | Barrel export |
| `src/features/discover/hooks/useWheel.ts` | Wheel state + Firestore fetch |
| `src/features/discover/hooks/useScratch.ts` | Scratch state + Firestore fetch |
| `src/features/discover/hooks/index.ts` | Barrel export |
| `app/(tabs)/discover.tsx` | Discover screen (rewrite) |

---

## Task 1: Tarot Types & Major Arcana Data

**Files:**
- Create: `src/features/tarot/types.ts`
- Create: `src/features/tarot/data/majorArcana.ts`

- [ ] **Step 1: Create tarot types**

`src/features/tarot/types.ts`:

```typescript
export type TarotCard = {
  id: string;
  number: number;
  nameKey: string;
  uprightKey: string;
  reversedKey: string;
  symbol: string;
};

export type TarotMode = "daily" | "three_card" | "love";

export type CardOrientation = "upright" | "reversed";

export type DrawnCard = {
  card: TarotCard;
  orientation: CardOrientation;
};

export type TarotInterpretation = {
  love: string;
  work: string;
  general: string;
};

export type ThreeCardLabels = {
  daily: never;
  three_card: ["tarot.past", "tarot.present", "tarot.future"];
  love: ["tarot.you", "tarot.partner", "tarot.relationship"];
};
```

- [ ] **Step 2: Create Major Arcana data**

`src/features/tarot/data/majorArcana.ts`:

```typescript
import type { TarotCard } from "../types";

export const majorArcana: TarotCard[] = [
  { id: "the_fool", number: 0, nameKey: "tarot.cards.the_fool", uprightKey: "tarot.meanings.the_fool_upright", reversedKey: "tarot.meanings.the_fool_reversed", symbol: "\u2606" },
  { id: "the_magician", number: 1, nameKey: "tarot.cards.the_magician", uprightKey: "tarot.meanings.the_magician_upright", reversedKey: "tarot.meanings.the_magician_reversed", symbol: "\u2605" },
  { id: "the_high_priestess", number: 2, nameKey: "tarot.cards.the_high_priestess", uprightKey: "tarot.meanings.the_high_priestess_upright", reversedKey: "tarot.meanings.the_high_priestess_reversed", symbol: "\u263D" },
  { id: "the_empress", number: 3, nameKey: "tarot.cards.the_empress", uprightKey: "tarot.meanings.the_empress_upright", reversedKey: "tarot.meanings.the_empress_reversed", symbol: "\u2640" },
  { id: "the_emperor", number: 4, nameKey: "tarot.cards.the_emperor", uprightKey: "tarot.meanings.the_emperor_upright", reversedKey: "tarot.meanings.the_emperor_reversed", symbol: "\u2642" },
  { id: "the_hierophant", number: 5, nameKey: "tarot.cards.the_hierophant", uprightKey: "tarot.meanings.the_hierophant_upright", reversedKey: "tarot.meanings.the_hierophant_reversed", symbol: "\u2648" },
  { id: "the_lovers", number: 6, nameKey: "tarot.cards.the_lovers", uprightKey: "tarot.meanings.the_lovers_upright", reversedKey: "tarot.meanings.the_lovers_reversed", symbol: "\u2665" },
  { id: "the_chariot", number: 7, nameKey: "tarot.cards.the_chariot", uprightKey: "tarot.meanings.the_chariot_upright", reversedKey: "tarot.meanings.the_chariot_reversed", symbol: "\u2604" },
  { id: "strength", number: 8, nameKey: "tarot.cards.strength", uprightKey: "tarot.meanings.strength_upright", reversedKey: "tarot.meanings.strength_reversed", symbol: "\u2654" },
  { id: "the_hermit", number: 9, nameKey: "tarot.cards.the_hermit", uprightKey: "tarot.meanings.the_hermit_upright", reversedKey: "tarot.meanings.the_hermit_reversed", symbol: "\u2618" },
  { id: "wheel_of_fortune", number: 10, nameKey: "tarot.cards.wheel_of_fortune", uprightKey: "tarot.meanings.wheel_of_fortune_upright", reversedKey: "tarot.meanings.wheel_of_fortune_reversed", symbol: "\u2609" },
  { id: "justice", number: 11, nameKey: "tarot.cards.justice", uprightKey: "tarot.meanings.justice_upright", reversedKey: "tarot.meanings.justice_reversed", symbol: "\u2696" },
  { id: "the_hanged_man", number: 12, nameKey: "tarot.cards.the_hanged_man", uprightKey: "tarot.meanings.the_hanged_man_upright", reversedKey: "tarot.meanings.the_hanged_man_reversed", symbol: "\u2629" },
  { id: "death", number: 13, nameKey: "tarot.cards.death", uprightKey: "tarot.meanings.death_upright", reversedKey: "tarot.meanings.death_reversed", symbol: "\u2620" },
  { id: "temperance", number: 14, nameKey: "tarot.cards.temperance", uprightKey: "tarot.meanings.temperance_upright", reversedKey: "tarot.meanings.temperance_reversed", symbol: "\u2652" },
  { id: "the_devil", number: 15, nameKey: "tarot.cards.the_devil", uprightKey: "tarot.meanings.the_devil_upright", reversedKey: "tarot.meanings.the_devil_reversed", symbol: "\u2625" },
  { id: "the_tower", number: 16, nameKey: "tarot.cards.the_tower", uprightKey: "tarot.meanings.the_tower_upright", reversedKey: "tarot.meanings.the_tower_reversed", symbol: "\u26A1" },
  { id: "the_star", number: 17, nameKey: "tarot.cards.the_star", uprightKey: "tarot.meanings.the_star_upright", reversedKey: "tarot.meanings.the_star_reversed", symbol: "\u2B50" },
  { id: "the_moon", number: 18, nameKey: "tarot.cards.the_moon", uprightKey: "tarot.meanings.the_moon_upright", reversedKey: "tarot.meanings.the_moon_reversed", symbol: "\u263E" },
  { id: "the_sun", number: 19, nameKey: "tarot.cards.the_sun", uprightKey: "tarot.meanings.the_sun_upright", reversedKey: "tarot.meanings.the_sun_reversed", symbol: "\u2600" },
  { id: "judgement", number: 20, nameKey: "tarot.cards.judgement", uprightKey: "tarot.meanings.judgement_upright", reversedKey: "tarot.meanings.judgement_reversed", symbol: "\u2721" },
  { id: "the_world", number: 21, nameKey: "tarot.cards.the_world", uprightKey: "tarot.meanings.the_world_upright", reversedKey: "tarot.meanings.the_world_reversed", symbol: "\u2295" },
];

const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

export const getRomanNumeral = (n: number): string => ROMAN[n] ?? String(n);
```

- [ ] **Step 3: Commit**

```bash
git add src/features/tarot/types.ts src/features/tarot/data/majorArcana.ts
git commit -m "feat: add tarot types and 22 Major Arcana data"
```

---

## Task 2: TarotCard & CardFlip Components

**Files:**
- Create: `src/features/tarot/components/TarotCard.tsx`
- Create: `src/features/tarot/components/CardFlip.tsx`

- [ ] **Step 1: Create TarotCard component**

`src/features/tarot/components/TarotCard.tsx`:

A single tarot card with front (placeholder gradient + symbol + roman numeral) and back (mystic pattern) designs.

```tsx
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Body } from "@shared/components";
import { colors, radius } from "@shared/theme";
import type { TarotCard as TarotCardType } from "../types";
import { getRomanNumeral } from "../data/majorArcana";

type TarotCardProps = {
  card: TarotCardType;
  side: "front" | "back";
  width?: number;
  height?: number;
};

export const TarotCard = ({
  card,
  side,
  width = 140,
  height = 220,
}: TarotCardProps) => {
  if (side === "back") {
    return (
      <LinearGradient
        colors={[colors.deepPurple, "#2a1838"]}
        style={[styles.card, { width, height }]}
      >
        <View style={styles.backPattern}>
          <Body style={styles.backSymbol}>{"\u2728"}</Body>
          <Body style={styles.backLabel}>ASTRALE</Body>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#2a1838", colors.deepPurple, "#0d0d0d"]}
      style={[styles.card, { width, height }]}
    >
      <Body style={styles.roman}>{getRomanNumeral(card.number)}</Body>
      <Body style={styles.symbol}>{card.symbol}</Body>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  roman: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 14,
    color: colors.gold,
    position: "absolute",
    top: 12,
  },
  symbol: {
    fontSize: 40,
    color: colors.gold,
  },
  backPattern: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  backSymbol: {
    fontSize: 32,
    color: colors.gold,
    opacity: 0.6,
  },
  backLabel: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 10,
    color: colors.gold,
    opacity: 0.4,
    letterSpacing: 4,
  },
});
```

- [ ] **Step 2: Create CardFlip animation component**

`src/features/tarot/components/CardFlip.tsx`:

```tsx
import { type ReactNode } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Easing,
  runOnJS,
} from "react-native-reanimated";

type CardFlipProps = {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;
  duration?: number;
  onFlipComplete?: () => void;
};

export const CardFlip = ({
  front,
  back,
  flipped,
  duration = 800,
  onFlipComplete,
}: CardFlipProps) => {
  const rotation = useSharedValue(0);

  const flip = () => {
    rotation.value = withTiming(flipped ? 180 : 0, {
      duration,
      easing: Easing.inOut(Easing.ease),
    }, (finished) => {
      if (finished && onFlipComplete) {
        runOnJS(onFlipComplete)();
      }
    });
  };

  if (flipped && rotation.value === 0) {
    flip();
  } else if (!flipped && rotation.value === 180) {
    flip();
  }

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` },
    ],
    backfaceVisibility: "hidden" as const,
    opacity: rotation.value <= 90 ? 1 : 0,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` },
    ],
    backfaceVisibility: "hidden" as const,
    position: "absolute" as const,
    opacity: rotation.value > 90 ? 1 : 0,
  }));

  return (
    <>
      <Animated.View style={frontStyle}>{back}</Animated.View>
      <Animated.View style={backStyle}>{front}</Animated.View>
    </>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/features/tarot/components/TarotCard.tsx src/features/tarot/components/CardFlip.tsx
git commit -m "feat: add TarotCard and CardFlip animation components"
```

---

## Task 3: useTarot Hook

**Files:**
- Create: `src/features/tarot/hooks/useTarot.ts`
- Create: `src/features/tarot/hooks/index.ts`

- [ ] **Step 1: Create useTarot hook**

`src/features/tarot/hooks/useTarot.ts`:

```typescript
import { useCallback, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@services/firebase";
import { storage, storageService } from "@services/storage";
import type {
  TarotCard,
  TarotMode,
  DrawnCard,
  CardOrientation,
  TarotInterpretation,
} from "../types";
import { majorArcana } from "../data/majorArcana";

const TODAY_DRAW_KEY = "tarot.todayDraw";
const today = (): string => new Date().toISOString().split("T")[0];

type SavedDraw = {
  date: string;
  cardId: string;
  orientation: CardOrientation;
};

export const useTarot = () => {
  const [mode, setMode] = useState<TarotMode>("daily");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState<TarotInterpretation | null>(null);
  const [isDrawn, setIsDrawn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alreadyDrawnToday, setAlreadyDrawnToday] = useState(false);

  useEffect(() => {
    const saved = storage.getString(TODAY_DRAW_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as SavedDraw;
      if (parsed.date === today()) {
        const card = majorArcana.find((c) => c.id === parsed.cardId);
        if (card) {
          setDrawnCards([{ card, orientation: parsed.orientation }]);
          setAlreadyDrawnToday(true);
          fetchInterpretation(card.id);
        }
      }
    }
  }, []);

  const fetchInterpretation = async (cardId: string) => {
    const profile = storageService.getUserProfile();
    if (!profile) return;

    try {
      const docRef = doc(db, "tarot_interpretations", cardId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const contextual = data.contextual?.[profile.zodiacSign];
        if (contextual) {
          setInterpretation(contextual as TarotInterpretation);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tarot interpretation:", err);
    }
  };

  const getCardCount = (): number => {
    return mode === "daily" ? 1 : 3;
  };

  const drawCards = useCallback(() => {
    if (mode === "daily" && alreadyDrawnToday) return;

    setIsLoading(true);
    const count = mode === "daily" ? 1 : 3;
    const shuffled = [...majorArcana].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const drawn: DrawnCard[] = selected.map((card) => ({
      card,
      orientation: (Math.random() > 0.5 ? "upright" : "reversed") as CardOrientation,
    }));

    setDrawnCards(drawn);
    setIsDrawn(true);
    setIsLoading(false);

    if (mode === "daily") {
      const first = drawn[0];
      const savedDraw: SavedDraw = {
        date: today(),
        cardId: first.card.id,
        orientation: first.orientation,
      };
      storage.set(TODAY_DRAW_KEY, JSON.stringify(savedDraw));

      storageService.addCollectedCard(first.card.id);

      const todayStr = today();
      const usage = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({ ...usage, tarotCardDrawn: true });

      setAlreadyDrawnToday(true);
    }

    drawn.forEach((d) => {
      storageService.addCollectedCard(d.card.id);
    });

    fetchInterpretation(drawn[0].card.id);
  }, [mode, alreadyDrawnToday]);

  const reset = () => {
    setDrawnCards([]);
    setInterpretation(null);
    setIsDrawn(false);
  };

  return {
    mode,
    setMode,
    drawnCards,
    interpretation,
    isDrawn,
    isLoading,
    alreadyDrawnToday,
    drawCards,
    reset,
    getCardCount,
  };
};
```

- [ ] **Step 2: Create barrel export**

`src/features/tarot/hooks/index.ts`:

```typescript
export { useTarot } from "./useTarot";
```

- [ ] **Step 3: Commit**

```bash
git add src/features/tarot/hooks/
git commit -m "feat: add useTarot hook with draw logic and Firestore fetch"
```

---

## Task 4: ModeSelector & TarotResult Components

**Files:**
- Create: `src/features/tarot/components/ModeSelector.tsx`
- Create: `src/features/tarot/components/TarotResult.tsx`

- [ ] **Step 1: Create ModeSelector**

`src/features/tarot/components/ModeSelector.tsx`:

```tsx
import { StyleSheet, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import { Body } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";
import type { TarotMode } from "../types";

type ModeSelectorProps = {
  selected: TarotMode;
  onSelect: (mode: TarotMode) => void;
  lockedModes: TarotMode[];
  onUnlockMode: (mode: TarotMode) => void;
};

const MODES: { id: TarotMode; labelKey: string }[] = [
  { id: "daily", labelKey: "tarot.cardOfDay" },
  { id: "three_card", labelKey: "tarot.pastPresentFuture" },
  { id: "love", labelKey: "tarot.loveReading" },
];

export const ModeSelector = ({
  selected,
  onSelect,
  lockedModes,
  onUnlockMode,
}: ModeSelectorProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {MODES.map((m) => {
        const isActive = selected === m.id;
        const isLocked = lockedModes.includes(m.id);

        return (
          <Pressable
            key={m.id}
            onPress={() => {
              if (isLocked) {
                onUnlockMode(m.id);
              } else {
                onSelect(m.id);
              }
            }}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Body
              style={[
                styles.label,
                isActive && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {isLocked ? "\uD83D\uDD12 " : ""}
              {t(m.labelKey)}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.whiteOverlay,
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  label: {
    fontSize: 11,
    color: colors.whiteDim,
    fontFamily: "Inter-Medium",
  },
  labelActive: {
    color: colors.gold,
  },
});
```

- [ ] **Step 2: Create TarotResult**

`src/features/tarot/components/TarotResult.tsx`:

```tsx
import { StyleSheet, View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Body, Title, Card } from "@shared/components";
import { colors, spacing } from "@shared/theme";
import type { DrawnCard, TarotInterpretation, TarotMode } from "../types";
import { TarotCard } from "./TarotCard";

type TarotResultProps = {
  drawnCards: DrawnCard[];
  interpretation: TarotInterpretation | null;
  mode: TarotMode;
};

const THREE_CARD_LABELS: Record<string, string[]> = {
  three_card: ["tarot.past", "tarot.present", "tarot.future"],
  love: ["tarot.you", "tarot.partner", "tarot.relationship"],
};

export const TarotResult = ({
  drawnCards,
  interpretation,
  mode,
}: TarotResultProps) => {
  const { t } = useTranslation();
  const labels = THREE_CARD_LABELS[mode];

  return (
    <Animated.View entering={FadeInDown.duration(600).delay(300)}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.cardsRow}>
          {drawnCards.map((drawn, i) => (
            <View key={drawn.card.id} style={styles.cardWrapper}>
              {labels && (
                <Body style={styles.cardLabel}>{t(labels[i])}</Body>
              )}
              <TarotCard
                card={drawn.card}
                side="front"
                width={mode === "daily" ? 160 : 100}
                height={mode === "daily" ? 250 : 156}
              />
              <Body style={styles.cardName}>{t(drawn.card.nameKey)}</Body>
              <Body style={styles.orientation}>
                {t(drawn.orientation === "upright" ? "tarot.upright" : "tarot.reversed")}
              </Body>
            </View>
          ))}
        </View>

        {drawnCards.length > 0 && (
          <Card variant="subtle" style={styles.meaningCard}>
            <Body style={styles.meaningText}>
              {t(
                drawnCards[0].orientation === "upright"
                  ? drawnCards[0].card.uprightKey
                  : drawnCards[0].card.reversedKey
              )}
            </Body>
          </Card>
        )}

        {interpretation && (
          <Card variant="gold" style={styles.interpretationCard}>
            <Title style={styles.interpretationTitle}>
              {t("horoscope.general")}
            </Title>
            <Body style={styles.interpretationText}>
              {interpretation.general}
            </Body>
          </Card>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cardWrapper: {
    alignItems: "center",
    gap: spacing.xs,
  },
  cardLabel: {
    fontSize: 11,
    color: colors.gold,
    fontFamily: "Inter-SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  cardName: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 13,
    color: colors.pearlWhite,
    marginTop: spacing.xs,
  },
  orientation: {
    fontSize: 10,
    color: colors.gold,
    opacity: 0.7,
  },
  meaningCard: {
    marginTop: spacing.sm,
  },
  meaningText: {
    lineHeight: 22,
    fontSize: 14,
  },
  interpretationCard: {
    marginTop: spacing.sm,
  },
  interpretationTitle: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  interpretationText: {
    lineHeight: 22,
    fontSize: 14,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/features/tarot/components/ModeSelector.tsx src/features/tarot/components/TarotResult.tsx
git commit -m "feat: add ModeSelector and TarotResult components"
```

---

## Task 5: TarotFan — Interactive Fan Carousel

**Files:**
- Create: `src/features/tarot/components/TarotFan.tsx`

This is the most complex component — an interactive fan of 22 cards arranged in a semicircle, scrollable with gesture, tap to select.

- [ ] **Step 1: Create TarotFan component**

`src/features/tarot/components/TarotFan.tsx`:

```tsx
import { useCallback } from "react";
import { StyleSheet, View, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { colors } from "@shared/theme";
import type { TarotCard as TarotCardType } from "../types";
import { majorArcana } from "../data/majorArcana";
import { TarotCard } from "./TarotCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = 80;
const CARD_HEIGHT = 125;
const FAN_RADIUS = SCREEN_WIDTH * 0.9;
const ANGLE_SPREAD = 3;
const TOTAL_ANGLE = ANGLE_SPREAD * (majorArcana.length - 1);

type TarotFanProps = {
  onSelect: (card: TarotCardType) => void;
  disabled?: boolean;
};

export const TarotFan = ({ onSelect, disabled = false }: TarotFanProps) => {
  const scrollOffset = useSharedValue(0);
  const savedOffset = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedOffset.value = scrollOffset.value;
    })
    .onUpdate((e) => {
      scrollOffset.value = savedOffset.value + e.translationX * 0.15;
    })
    .onEnd((e) => {
      scrollOffset.value = withSpring(
        Math.max(
          Math.min(scrollOffset.value + e.velocityX * 0.05, TOTAL_ANGLE / 2),
          -TOTAL_ANGLE / 2
        ),
        { damping: 20, stiffness: 90 }
      );
    });

  const renderCard = useCallback(
    (card: TarotCardType, index: number) => {
      const centerIndex = (majorArcana.length - 1) / 2;
      const baseAngle = (index - centerIndex) * ANGLE_SPREAD;

      return (
        <AnimatedFanCard
          key={card.id}
          card={card}
          baseAngle={baseAngle}
          scrollOffset={scrollOffset}
          onSelect={() => !disabled && onSelect(card)}
        />
      );
    },
    [disabled, onSelect, scrollOffset]
  );

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <View style={styles.fanCenter}>
          {majorArcana.map((card, i) => renderCard(card, i))}
        </View>
      </View>
    </GestureDetector>
  );
};

type AnimatedFanCardProps = {
  card: TarotCardType;
  baseAngle: number;
  scrollOffset: Animated.SharedValue<number>;
  onSelect: () => void;
};

const AnimatedFanCard = ({
  card,
  baseAngle,
  scrollOffset,
  onSelect,
}: AnimatedFanCardProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const angle = baseAngle + scrollOffset.value;
    const radians = (angle * Math.PI) / 180;

    const translateX = Math.sin(radians) * FAN_RADIUS * 0.35;
    const translateY = -Math.cos(radians) * FAN_RADIUS * 0.1 + Math.abs(angle) * 0.8;

    const scale = interpolate(
      Math.abs(angle),
      [0, 15, 40],
      [1, 0.85, 0.65],
      Extrapolation.CLAMP
    );

    const zIndex = interpolate(
      Math.abs(angle),
      [0, 40],
      [100, 0],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      Math.abs(angle),
      [0, 30, 50],
      [1, 0.7, 0.3],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX },
        { translateY },
        { rotateZ: `${angle * 0.5}deg` },
        { scale },
      ],
      zIndex: Math.round(zIndex),
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.cardPosition, animatedStyle]}>
      <Pressable onPress={onSelect}>
        <TarotCard card={card} side="back" width={CARD_WIDTH} height={CARD_HEIGHT} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  fanCenter: {
    width: SCREEN_WIDTH,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  cardPosition: {
    position: "absolute",
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/features/tarot/components/TarotFan.tsx
git commit -m "feat: add TarotFan interactive carousel with gesture support"
```

---

## Task 6: Tarot Screen Rewrite

**Files:**
- Create: `src/features/tarot/components/index.ts`
- Modify: `app/(tabs)/tarot.tsx`

- [ ] **Step 1: Create barrel export**

`src/features/tarot/components/index.ts`:

```typescript
export { TarotCard } from "./TarotCard";
export { CardFlip } from "./CardFlip";
export { TarotFan } from "./TarotFan";
export { ModeSelector } from "./ModeSelector";
export { TarotResult } from "./TarotResult";
```

- [ ] **Step 2: Rewrite Tarot screen**

`app/(tabs)/tarot.tsx`:

```tsx
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { ScreenContainer, Body, Button } from "@shared/components";
import { spacing } from "@shared/theme";
import { useRewardedAd } from "@services/ads";
import { useTarot } from "@features/tarot/hooks";
import {
  TarotFan,
  ModeSelector,
  TarotResult,
} from "@features/tarot/components";
import type { TarotMode, TarotCard } from "@features/tarot/types";

export default function TarotScreen() {
  const { t } = useTranslation();
  const { showAd } = useRewardedAd();
  const {
    mode,
    setMode,
    drawnCards,
    interpretation,
    isDrawn,
    alreadyDrawnToday,
    drawCards,
    reset,
  } = useTarot();

  const [unlockedModes, setUnlockedModes] = useState<TarotMode[]>(["daily"]);

  const handleUnlockMode = async (m: TarotMode) => {
    const rewarded = await showAd();
    if (rewarded) {
      setUnlockedModes((prev) => [...prev, m]);
      setMode(m);
    }
  };

  const lockedModes = (["three_card", "love"] as TarotMode[]).filter(
    (m) => !unlockedModes.includes(m)
  );

  const handleSelectCard = (_card: TarotCard) => {
    drawCards();
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ModeSelector
          selected={mode}
          onSelect={(m) => {
            setMode(m);
            reset();
          }}
          lockedModes={lockedModes}
          onUnlockMode={handleUnlockMode}
        />

        {!isDrawn ? (
          <View style={styles.fanSection}>
            {mode === "daily" && alreadyDrawnToday ? (
              <Body style={styles.alreadyDrawn}>
                {t("tarot.alreadyDrawn")}
              </Body>
            ) : (
              <>
                <Body style={styles.instruction}>
                  {t("tarot.drawCard")}
                </Body>
                <TarotFan
                  onSelect={handleSelectCard}
                  disabled={mode === "daily" && alreadyDrawnToday}
                />
              </>
            )}
          </View>
        ) : (
          <TarotResult
            drawnCards={drawnCards}
            interpretation={interpretation}
            mode={mode}
          />
        )}

        {isDrawn && (
          <Button
            title={t("common.back")}
            variant="ghost"
            onPress={reset}
            style={styles.resetButton}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  fanSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  instruction: {
    fontSize: 14,
    opacity: 0.5,
    marginBottom: spacing.lg,
  },
  alreadyDrawn: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: "center",
  },
  resetButton: {
    marginBottom: spacing.lg,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/features/tarot/components/index.ts app/\(tabs\)/tarot.tsx
git commit -m "feat: rewrite Tarot screen with fan carousel and card draw flow"
```

---

## Task 7: Discover Types & Hooks (useWheel + useScratch)

**Files:**
- Create: `src/features/discover/types.ts`
- Create: `src/features/discover/hooks/useWheel.ts`
- Create: `src/features/discover/hooks/useScratch.ts`
- Create: `src/features/discover/hooks/index.ts`

- [ ] **Step 1: Create discover types**

`src/features/discover/types.ts`:

```typescript
export type DiscoverTab = "wheel" | "scratch";

export type WheelItem = {
  index: number;
  label: string;
  fullText: string;
};
```

- [ ] **Step 2: Create useWheel hook**

`src/features/discover/hooks/useWheel.ts`:

```typescript
import { useEffect, useState, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@services/firebase";
import { storage, storageService } from "@services/storage";
import type { WheelItem } from "../types";

const CACHE_KEY_PREFIX = "wheel.cache";
const today = (): string => new Date().toISOString().split("T")[0];

export const useWheel = () => {
  const [items, setItems] = useState<WheelItem[]>([]);
  const [result, setResult] = useState<WheelItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = today();
  const usage = storageService.getDailyUsage(todayStr);
  const [hasSpunToday, setHasSpunToday] = useState(usage.wheelSpun);

  useEffect(() => {
    const fetchContent = async () => {
      const cacheKey = `${CACHE_KEY_PREFIX}.${todayStr}`;
      const cached = storage.getString(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached) as string[];
        setItems(parsed.slice(0, 8).map((text, i) => ({
          index: i,
          label: text.split(" ").slice(0, 3).join(" "),
          fullText: text,
        })));
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "daily_content", todayStr);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const wheel = (data.wheel ?? []) as string[];
          storage.set(cacheKey, JSON.stringify(wheel));
          setItems(wheel.slice(0, 8).map((text, i) => ({
            index: i,
            label: text.split(" ").slice(0, 3).join(" "),
            fullText: text,
          })));
        }
      } catch (err) {
        console.error("Failed to fetch wheel content:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [todayStr]);

  const selectResult = useCallback((angle: number) => {
    if (items.length === 0) return;
    const segmentAngle = 360 / items.length;
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const index = Math.floor(normalizedAngle / segmentAngle);
    const selected = items[index % items.length];
    setResult(selected);
    setIsSpinning(false);

    if (!hasSpunToday) {
      setHasSpunToday(true);
      const usage = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({ ...usage, wheelSpun: true });
    }
  }, [items, hasSpunToday, todayStr]);

  const startSpin = () => {
    setResult(null);
    setIsSpinning(true);
  };

  return {
    items,
    result,
    isSpinning,
    isLoading,
    hasSpunToday,
    startSpin,
    selectResult,
  };
};
```

- [ ] **Step 3: Create useScratch hook**

`src/features/discover/hooks/useScratch.ts`:

```typescript
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@services/firebase";
import { storage, storageService } from "@services/storage";

const CACHE_KEY_PREFIX = "scratch.cache";
const today = (): string => new Date().toISOString().split("T")[0];

export const useScratch = () => {
  const [contents, setContents] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = today();
  const usage = storageService.getDailyUsage(todayStr);
  const [hasScratchedToday, setHasScratchedToday] = useState(usage.scratchUsed);

  useEffect(() => {
    const fetchContent = async () => {
      const cacheKey = `${CACHE_KEY_PREFIX}.${todayStr}`;
      const cached = storage.getString(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached) as string[];
        setContents(parsed.slice(0, 3));
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "daily_content", todayStr);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const scratch = (data.scratch ?? []) as string[];
          storage.set(cacheKey, JSON.stringify(scratch));
          setContents(scratch.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch scratch content:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [todayStr]);

  const selectCard = (index: number) => {
    setSelectedIndex(index);
  };

  const reveal = () => {
    setIsRevealed(true);

    if (!hasScratchedToday) {
      setHasScratchedToday(true);
      const usage = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({ ...usage, scratchUsed: true });
    }
  };

  const reset = () => {
    setSelectedIndex(null);
    setIsRevealed(false);
  };

  return {
    contents,
    selectedIndex,
    isRevealed,
    isLoading,
    hasScratchedToday,
    selectCard,
    reveal,
    reset,
  };
};
```

- [ ] **Step 4: Create barrel export**

`src/features/discover/hooks/index.ts`:

```typescript
export { useWheel } from "./useWheel";
export { useScratch } from "./useScratch";
```

- [ ] **Step 5: Commit**

```bash
git add src/features/discover/types.ts src/features/discover/hooks/
git commit -m "feat: add discover types and hooks (useWheel, useScratch)"
```

---

## Task 8: FortuneWheel + WheelIndicator + WheelResult

**Files:**
- Create: `src/features/discover/components/FortuneWheel.tsx`
- Create: `src/features/discover/components/WheelIndicator.tsx`
- Create: `src/features/discover/components/WheelResult.tsx`

- [ ] **Step 1: Create FortuneWheel with Skia**

`src/features/discover/components/FortuneWheel.tsx`:

```tsx
import { useCallback } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import { Canvas, Path, Skia, Group, vec, Text as SkiaText, useFont } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { colors } from "@shared/theme";
import type { WheelItem } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WHEEL_SIZE = SCREEN_WIDTH * 0.7;
const WHEEL_RADIUS = WHEEL_SIZE / 2;
const CENTER = WHEEL_RADIUS;

const SEGMENT_COLORS = [
  "#1a1028", "#2a1838", "#d4af37", "#1a1028",
  "#2a1838", "#3a2848", "#d4af37", "#1a1028",
];

type FortuneWheelProps = {
  items: WheelItem[];
  spinning: boolean;
  onSpinEnd: (angle: number) => void;
  onSpinStart: () => void;
  disabled?: boolean;
};

export const FortuneWheel = ({
  items,
  spinning,
  onSpinEnd,
  onSpinStart,
  disabled = false,
}: FortuneWheelProps) => {
  const rotation = useSharedValue(0);

  const handleSpinEnd = useCallback((finalAngle: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSpinEnd(finalAngle);
  }, [onSpinEnd]);

  const flingGesture = Gesture.Pan()
    .enabled(!disabled && !spinning)
    .onStart(() => {
      runOnJS(onSpinStart)();
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onEnd((e) => {
      const velocity = Math.abs(e.velocityY) > Math.abs(e.velocityX)
        ? e.velocityY
        : e.velocityX;

      rotation.value = withDecay(
        {
          velocity: velocity * 0.5,
          deceleration: 0.997,
        },
        (finished) => {
          if (finished) {
            const finalAngle = ((rotation.value % 360) + 360) % 360;
            runOnJS(handleSpinEnd)(finalAngle);
          }
        }
      );
    });

  const animatedWheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  const segmentAngle = items.length > 0 ? (2 * Math.PI) / items.length : 0;

  const buildSegmentPath = (index: number): string => {
    const startAngle = index * segmentAngle - Math.PI / 2;
    const endAngle = startAngle + segmentAngle;

    const x1 = CENTER + WHEEL_RADIUS * Math.cos(startAngle);
    const y1 = CENTER + WHEEL_RADIUS * Math.sin(startAngle);
    const x2 = CENTER + WHEEL_RADIUS * Math.cos(endAngle);
    const y2 = CENTER + WHEEL_RADIUS * Math.sin(endAngle);

    const largeArc = segmentAngle > Math.PI ? 1 : 0;

    return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <GestureDetector gesture={flingGesture}>
      <View style={styles.container}>
        <Animated.View style={[styles.wheel, animatedWheelStyle]}>
          <Canvas style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
            {items.map((item, i) => {
              const path = Skia.Path.MakeFromSVGString(buildSegmentPath(i));
              if (!path) return null;

              return (
                <Path
                  key={i}
                  path={path}
                  color={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                />
              );
            })}
            {items.map((item, i) => {
              const midAngle = i * segmentAngle + segmentAngle / 2 - Math.PI / 2;
              const textRadius = WHEEL_RADIUS * 0.6;
              const tx = CENTER + textRadius * Math.cos(midAngle);
              const ty = CENTER + textRadius * Math.sin(midAngle);

              return (
                <Group key={`t-${i}`} transform={[
                  { translateX: tx },
                  { translateY: ty },
                  { rotate: midAngle + Math.PI / 2 },
                ]}>
                  {/* Text is complex in Skia - use simple label approach */}
                </Group>
              );
            })}
          </Canvas>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_RADIUS,
    borderWidth: 2,
    borderColor: colors.goldBorder,
    overflow: "hidden",
  },
});
```

- [ ] **Step 2: Create WheelIndicator**

`src/features/discover/components/WheelIndicator.tsx`:

```tsx
import { StyleSheet, View } from "react-native";

import { colors } from "@shared/theme";

export const WheelIndicator = () => {
  return (
    <View style={styles.container}>
      <View style={styles.arrow} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -10,
    zIndex: 10,
    alignItems: "center",
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.gold,
  },
});
```

- [ ] **Step 3: Create WheelResult**

`src/features/discover/components/WheelResult.tsx`:

```tsx
import { StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Card, Body } from "@shared/components";
import { spacing } from "@shared/theme";
import type { WheelItem } from "../types";

type WheelResultProps = {
  result: WheelItem;
};

export const WheelResult = ({ result }: WheelResultProps) => {
  return (
    <Animated.View entering={FadeInUp.duration(500)}>
      <Card variant="gold" style={styles.card}>
        <Body style={styles.text}>{result.fullText}</Body>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xl,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontFamily: "PlayfairDisplay-Bold",
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/features/discover/components/FortuneWheel.tsx src/features/discover/components/WheelIndicator.tsx src/features/discover/components/WheelResult.tsx
git commit -m "feat: add FortuneWheel with Skia rendering and gesture spin"
```

---

## Task 9: ScratchCard & ScratchSelector

**Files:**
- Create: `src/features/discover/components/ScratchCard.tsx`
- Create: `src/features/discover/components/ScratchSelector.tsx`

- [ ] **Step 1: Create ScratchCard with Skia**

`src/features/discover/components/ScratchCard.tsx`:

```tsx
import { useRef, useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Canvas, Path, Skia, Rect, Group } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { Body } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";

const CARD_WIDTH = Dimensions.get("window").width - 80;
const CARD_HEIGHT = 200;
const STROKE_WIDTH = 40;
const REVEAL_THRESHOLD = 0.6;

type ScratchCardProps = {
  content: string;
  onReveal: () => void;
};

export const ScratchCard = ({ content, onReveal }: ScratchCardProps) => {
  const [revealed, setRevealed] = useState(false);
  const scratchPath = useRef(Skia.Path.Make());
  const touchCount = useRef(0);
  const totalCells = useRef(Math.ceil((CARD_WIDTH * CARD_HEIGHT) / (STROKE_WIDTH * STROKE_WIDTH)));
  const touchedCells = useRef(new Set<string>());
  const [, forceUpdate] = useState(0);

  const checkReveal = () => {
    const coverage = touchedCells.current.size / totalCells.current;
    if (coverage >= REVEAL_THRESHOLD && !revealed) {
      setRevealed(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onReveal();
    }
  };

  const trackCell = (x: number, y: number) => {
    const cellX = Math.floor(x / STROKE_WIDTH);
    const cellY = Math.floor(y / STROKE_WIDTH);
    touchedCells.current.add(`${cellX},${cellY}`);
  };

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      scratchPath.current.moveTo(e.x, e.y);
      trackCell(e.x, e.y);
      touchCount.current++;
      forceUpdate((n) => n + 1);
    })
    .onUpdate((e) => {
      scratchPath.current.lineTo(e.x, e.y);
      trackCell(e.x, e.y);
      touchCount.current++;
      if (touchCount.current % 5 === 0) {
        forceUpdate((n) => n + 1);
        checkReveal();
      }
    })
    .onEnd(() => {
      checkReveal();
    });

  if (revealed) {
    return (
      <View style={styles.revealedCard}>
        <Body style={styles.contentText}>{content}</Body>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.contentLayer}>
        <Body style={styles.contentText}>{content}</Body>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.canvasLayer}>
          <Canvas style={styles.canvas}>
            <Rect
              x={0}
              y={0}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              color="#2a1838"
            />
            <Rect
              x={0}
              y={0}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              color="#d4af3730"
            />
            <Group blendMode="clear">
              <Path
                path={scratchPath.current}
                style="stroke"
                strokeWidth={STROKE_WIDTH}
                strokeCap="round"
                strokeJoin="round"
                color="black"
              />
            </Group>
          </Canvas>
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  contentLayer: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.deepPurple,
  },
  contentText: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 16,
    color: colors.pearlWhite,
    textAlign: "center",
    lineHeight: 24,
  },
  canvasLayer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  canvas: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  revealedCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.deepPurple,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
});
```

- [ ] **Step 2: Create ScratchSelector**

`src/features/discover/components/ScratchSelector.tsx`:

```tsx
import { StyleSheet, View, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Body } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";

type ScratchSelectorProps = {
  count: number;
  onSelect: (index: number) => void;
};

export const ScratchSelector = ({ count, onSelect }: ScratchSelectorProps) => {
  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      {Array.from({ length: count }, (_, i) => (
        <Pressable key={i} onPress={() => onSelect(i)}>
          <View style={styles.card}>
            <Body style={styles.questionMark}>?</Body>
            <Body style={styles.label}>{i + 1}</Body>
          </View>
        </Pressable>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "center",
  },
  card: {
    width: 100,
    height: 140,
    borderRadius: radius.lg,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  questionMark: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 36,
    color: colors.gold,
  },
  label: {
    fontSize: 12,
    color: colors.whiteDim,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/features/discover/components/ScratchCard.tsx src/features/discover/components/ScratchSelector.tsx
git commit -m "feat: add ScratchCard with Skia scratch effect and ScratchSelector"
```

---

## Task 10: DiscoverTabs + Discover Screen Rewrite

**Files:**
- Create: `src/features/discover/components/DiscoverTabs.tsx`
- Create: `src/features/discover/components/index.ts`
- Modify: `app/(tabs)/discover.tsx`

- [ ] **Step 1: Create DiscoverTabs**

`src/features/discover/components/DiscoverTabs.tsx`:

```tsx
import { StyleSheet, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import { Body } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";
import type { DiscoverTab } from "../types";

type DiscoverTabsProps = {
  selected: DiscoverTab;
  onSelect: (tab: DiscoverTab) => void;
};

export const DiscoverTabs = ({ selected, onSelect }: DiscoverTabsProps) => {
  const { t } = useTranslation();

  const tabs: { id: DiscoverTab; label: string }[] = [
    { id: "wheel", label: t("discover.wheel.title") },
    { id: "scratch", label: t("discover.scratch.title") },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onSelect(tab.id)}
          style={[styles.tab, selected === tab.id && styles.tabActive]}
        >
          <Body
            style={[
              styles.label,
              selected === tab.id && styles.labelActive,
            ]}
          >
            {tab.label}
          </Body>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.whiteOverlay,
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  label: {
    fontSize: 13,
    color: colors.whiteDim,
    fontFamily: "Inter-Medium",
  },
  labelActive: {
    color: colors.gold,
  },
});
```

- [ ] **Step 2: Create barrel export**

`src/features/discover/components/index.ts`:

```typescript
export { DiscoverTabs } from "./DiscoverTabs";
export { FortuneWheel } from "./FortuneWheel";
export { WheelIndicator } from "./WheelIndicator";
export { WheelResult } from "./WheelResult";
export { ScratchCard } from "./ScratchCard";
export { ScratchSelector } from "./ScratchSelector";
```

- [ ] **Step 3: Rewrite Discover screen**

`app/(tabs)/discover.tsx`:

```tsx
import { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

import { ScreenContainer, Body, Button } from "@shared/components";
import { spacing } from "@shared/theme";
import { useRewardedAd } from "@services/ads";
import { useWheel, useScratch } from "@features/discover/hooks";
import {
  DiscoverTabs,
  FortuneWheel,
  WheelIndicator,
  WheelResult,
  ScratchCard,
  ScratchSelector,
} from "@features/discover/components";
import type { DiscoverTab } from "@features/discover/types";

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<DiscoverTab>("wheel");
  const { showAd } = useRewardedAd();

  const wheel = useWheel();
  const scratch = useScratch();

  const handleSpinPress = async () => {
    if (wheel.hasSpunToday) {
      const rewarded = await showAd();
      if (!rewarded) return;
    }
    wheel.startSpin();
  };

  const handleScratchSelect = async (index: number) => {
    if (scratch.hasScratchedToday) {
      const rewarded = await showAd();
      if (!rewarded) return;
    }
    scratch.selectCard(index);
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <DiscoverTabs selected={activeTab} onSelect={setActiveTab} />

        {activeTab === "wheel" ? (
          <ScrollView
            contentContainerStyle={styles.wheelContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.wheelWrapper}>
              <WheelIndicator />
              <FortuneWheel
                items={wheel.items}
                spinning={wheel.isSpinning}
                onSpinEnd={wheel.selectResult}
                onSpinStart={wheel.startSpin}
                disabled={wheel.isLoading || wheel.items.length === 0}
              />
            </View>

            {wheel.result ? (
              <WheelResult result={wheel.result} />
            ) : (
              <Button
                title={
                  wheel.hasSpunToday
                    ? t("discover.wheel.unlockSpin")
                    : t("discover.wheel.spin")
                }
                onPress={handleSpinPress}
                disabled={wheel.isSpinning || wheel.isLoading}
              />
            )}

            {wheel.result && (
              <Button
                title={
                  wheel.hasSpunToday
                    ? t("discover.wheel.unlockSpin")
                    : t("discover.wheel.spinAgain")
                }
                onPress={handleSpinPress}
                variant="ghost"
              />
            )}
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scratchContent}
            showsVerticalScrollIndicator={false}
          >
            {scratch.selectedIndex === null ? (
              <>
                <Body style={styles.instruction}>
                  {t("discover.scratch.choose")}
                </Body>
                <ScratchSelector
                  count={scratch.contents.length || 3}
                  onSelect={handleScratchSelect}
                />
              </>
            ) : (
              <View style={styles.scratchCardWrapper}>
                <Body style={styles.instruction}>
                  {t("discover.scratch.scratchIt")}
                </Body>
                <ScratchCard
                  content={scratch.contents[scratch.selectedIndex] ?? ""}
                  onReveal={scratch.reveal}
                />
                {scratch.isRevealed && (
                  <Button
                    title={
                      scratch.hasScratchedToday
                        ? t("ads.watchToUnlock")
                        : t("discover.scratch.scratchAgain")
                    }
                    variant="ghost"
                    onPress={() => {
                      scratch.reset();
                    }}
                  />
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  wheelContent: {
    alignItems: "center",
    gap: spacing.xl,
    paddingBottom: spacing["5xl"],
  },
  wheelWrapper: {
    alignItems: "center",
    position: "relative",
  },
  scratchContent: {
    alignItems: "center",
    gap: spacing.xl,
    paddingBottom: spacing["5xl"],
  },
  scratchCardWrapper: {
    alignItems: "center",
    gap: spacing.lg,
  },
  instruction: {
    fontSize: 14,
    opacity: 0.5,
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/features/discover/components/ app/\(tabs\)/discover.tsx
git commit -m "feat: rewrite Discover screen with Fortune Wheel and Scratch Cards"
```

---

## Post-Plan Verification

```bash
# Run all tests
npx jest

# Type check
npx tsc --noEmit

# Build Cloud Functions
cd functions && npm run build && cd ..
```

All must pass. The Tarot screen shows an interactive fan with card draw and flip animation. The Discover screen has a tabbed view with Fortune Wheel (Skia + gesture) and Scratch Cards (Skia scratch effect).
