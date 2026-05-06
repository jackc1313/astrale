import { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { ScreenContainer, Body, Button } from "@shared/components";
import { colors, spacing } from "@shared/theme";
import { useRewardedAd } from "@services/ads";
import { usePremium } from '@services/premium';
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useTarot } from "@features/tarot/hooks";
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

export default function TarotScreen() {
  const { t } = useTranslation();
  const { showAd } = useRewardedAd();
  const { isPremium } = usePremium();
  const {
    mode, setMode, drawnCards, interpretation, isDrawn,
    alreadyDrawnToday, drawCards, reset,
  } = useTarot();

  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  useEffect(() => {
    if (!alreadyDrawnToday) return;
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 60000);
    return () => clearInterval(interval);
  }, [alreadyDrawnToday]);

  // All modes unlocked (monetization disabled for launch)
  const lockedModes: TarotMode[] = [];

  const handleUnlockMode = (_m: TarotMode) => {};

  const handleSelectCard = (_card: TarotCard) => {
    drawCards();
  };

  const showResult = isDrawn || (mode === "daily" && alreadyDrawnToday && drawnCards.length > 0);

  return (
    <ScreenContainer edges={["top"]}>
      <View style={styles.container}>
        <ModeSelector
          selected={mode}
          onSelect={(m) => { setMode(m); reset(); }}
          lockedModes={lockedModes}
          onUnlockMode={handleUnlockMode}
        />

        {showResult ? (
          <TarotResult
            drawnCards={drawnCards}
            interpretation={interpretation}
            mode={mode}
            countdown={mode === "daily" && alreadyDrawnToday ? countdown : undefined}
          />
        ) : (
          <View style={styles.fanSection}>
            <Body style={styles.instruction}>{t("tarot.drawCard")}</Body>
            <TarotFan
              onSelect={handleSelectCard}
              disabled={mode === "daily" && alreadyDrawnToday}
            />
          </View>
        )}

        {isDrawn && !alreadyDrawnToday && (
          <Button title={t("common.back")} variant="ghost" onPress={reset} style={styles.resetButton} />
        )}
      </View>
      {!isPremium && (
        <View style={styles.bannerContainer}>
          <BannerAd unitId={TestIds.ADAPTIVE_BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, paddingTop: spacing.lg, gap: spacing.lg },
  fanSection: { flex: 1, justifyContent: "center", alignItems: "center" },
  instruction: { fontSize: 14, opacity: 0.5, marginBottom: spacing.lg },
  resetButton: { marginBottom: spacing.lg },
  bannerContainer: { alignItems: "center" },
});
