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
    mode, setMode, drawnCards, interpretation, isDrawn,
    alreadyDrawnToday, drawCards, reset,
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
          onSelect={(m) => { setMode(m); reset(); }}
          lockedModes={lockedModes}
          onUnlockMode={handleUnlockMode}
        />

        {!isDrawn ? (
          <View style={styles.fanSection}>
            {mode === "daily" && alreadyDrawnToday ? (
              <Body style={styles.alreadyDrawn}>{t("tarot.alreadyDrawn")}</Body>
            ) : (
              <>
                <Body style={styles.instruction}>{t("tarot.drawCard")}</Body>
                <TarotFan
                  onSelect={handleSelectCard}
                  disabled={mode === "daily" && alreadyDrawnToday}
                />
              </>
            )}
          </View>
        ) : (
          <TarotResult drawnCards={drawnCards} interpretation={interpretation} mode={mode} />
        )}

        {isDrawn && (
          <Button title={t("common.back")} variant="ghost" onPress={reset} style={styles.resetButton} />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, paddingTop: spacing.lg, gap: spacing.lg },
  fanSection: { flex: 1, justifyContent: "center", alignItems: "center" },
  instruction: { fontSize: 14, opacity: 0.5, marginBottom: spacing.lg },
  alreadyDrawn: { fontSize: 14, opacity: 0.5, textAlign: "center" },
  resetButton: { marginBottom: spacing.lg },
});
