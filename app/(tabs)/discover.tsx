import { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

import { ScreenContainer, Body, Button } from "@shared/components";
import { spacing } from "@shared/theme";
import { useRewardedAd } from "@services/ads";
import { usePremium } from '@services/premium';
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
  const { isPremium } = usePremium();

  const wheel = useWheel();
  const scratch = useScratch();

  const handleSpinPress = async () => {
    if (wheel.hasSpunToday && !isPremium) {
      const rewarded = await showAd();
      if (!rewarded) return;
    }
    wheel.startSpin();
  };

  const handleScratchSelect = async (index: number) => {
    if (scratch.hasScratchedToday && !isPremium) {
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
                title={wheel.hasSpunToday ? t("discover.wheel.unlockSpin") : t("discover.wheel.spin")}
                onPress={handleSpinPress}
                disabled={wheel.isSpinning || wheel.isLoading}
              />
            )}

            {wheel.result && (
              <Button
                title={wheel.hasSpunToday ? t("discover.wheel.unlockSpin") : t("discover.wheel.spinAgain")}
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
                <Body style={styles.instruction}>{t("discover.scratch.choose")}</Body>
                <ScratchSelector
                  count={scratch.stones.length || 3}
                  onSelect={handleScratchSelect}
                />
              </>
            ) : (
              <View style={styles.scratchCardWrapper}>
                <Body style={styles.instruction}>{t("discover.scratch.scratchIt")}</Body>
                <ScratchCard
                  stone={scratch.stones[scratch.selectedIndex] ?? { name: "", emoji: "", properties: "", message: "" }}
                  onReveal={scratch.reveal}
                />
                {scratch.isRevealed && (
                  <Button
                    title={scratch.hasScratchedToday ? t("ads.watchToUnlock") : t("discover.scratch.scratchAgain")}
                    variant="ghost"
                    onPress={() => scratch.reset()}
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
  container: { flex: 1, padding: spacing.xl, paddingTop: spacing.lg, gap: spacing.lg },
  wheelContent: { alignItems: "center", gap: spacing.xl, paddingBottom: spacing["5xl"] },
  wheelWrapper: { alignItems: "center", position: "relative" },
  scratchContent: { alignItems: "center", gap: spacing.xl, paddingBottom: spacing["5xl"] },
  scratchCardWrapper: { alignItems: "center", gap: spacing.lg },
  instruction: { fontSize: 14, opacity: 0.5 },
});
