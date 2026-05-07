import { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, View, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useTranslation } from "react-i18next";

import { ScreenContainer, Body, Button } from "@shared/components";
import { colors, spacing } from "@shared/theme";
import { useRewardedAd } from "@services/ads";
import { usePremium } from '@services/premium';
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useTarot, loadSavedDraw } from "@features/tarot/hooks";
import {
  TarotFan,
  ModeSelector,
  TarotResult,
} from "@features/tarot/components";
import type { TarotMode, TarotCard } from "@features/tarot/types";

const getTimeUntilMidnight = (): string => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const MODES: TarotMode[] = ["daily", "three_card", "love"];
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TarotScreen() {
  const { t } = useTranslation();
  const { showAd } = useRewardedAd();
  const { isPremium } = usePremium();
  const {
    mode, setMode, drawnCards, interpretation, isDrawn,
    alreadyDrawnToday, drawCards, reset,
  } = useTarot();

  const scrollRef = useRef<ScrollView>(null);
  const isTabPress = useRef(false);
  const [countdown, setCountdown] = useState(getTimeUntilMidnight());
  const pageWidth = SCREEN_WIDTH;

  useEffect(() => {
    setCountdown(getTimeUntilMidnight());
    if (!alreadyDrawnToday) return;
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 60000);
    return () => clearInterval(interval);
  }, [alreadyDrawnToday]);

  const handleTabSelect = useCallback((m: TarotMode) => {
    isTabPress.current = true;
    const index = MODES.indexOf(m);
    scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true });
    setMode(m);
  }, [pageWidth]);

  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isTabPress.current) {
      isTabPress.current = false;
      return;
    }
    const index = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    const newMode = MODES[index];
    if (newMode && newMode !== mode) {
      setMode(newMode);
    }
  }, [pageWidth, mode]);

  // All modes unlocked (monetization disabled for launch)
  const lockedModes: TarotMode[] = [];

  const handleUnlockMode = (_m: TarotMode) => {};

  const handleSelectCard = (_card: TarotCard) => {
    drawCards();
  };

  const renderPage = (m: TarotMode) => {
    const saved = loadSavedDraw(m);
    const isActive = m === mode;

    if (saved.drawn) {
      return (
        <TarotResult
          drawnCards={saved.cards}
          interpretation={saved.interpretation}
          mode={m}
          countdown={countdown}
        />
      );
    }

    return (
      <View style={styles.fanSection}>
        <Body style={styles.instruction}>{t("tarot.drawCard")}</Body>
        <TarotFan onSelect={handleSelectCard} disabled={!isActive} />
      </View>
    );
  };

  return (
    <ScreenContainer edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ModeSelector
            selected={mode}
            onSelect={handleTabSelect}
            lockedModes={lockedModes}
            onUnlockMode={handleUnlockMode}
          />
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          style={styles.pager}
        >
          {MODES.map((m) => (
            <View key={m} style={[styles.page, { width: pageWidth }]}>
              {renderPage(m)}
            </View>
          ))}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg, gap: spacing.lg },
  header: { paddingHorizontal: spacing.xl },
  pager: { flex: 1 },
  page: { flex: 1, paddingHorizontal: spacing.xl },
  fanSection: { flex: 1, justifyContent: "center", alignItems: "center" },
  instruction: { fontSize: 14, opacity: 0.5, marginBottom: spacing.lg },
});
