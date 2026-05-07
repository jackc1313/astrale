import { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

import { ScreenContainer, Body, Button } from "@shared/components";
import { spacing } from "@shared/theme";
import { useRewardedAd } from "@services/ads";
import { usePremium } from '@services/premium';
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useWheel, useScratch, useStars } from "@features/discover/hooks";
import {
  DiscoverTabs,
  FortuneWheel,
  WheelIndicator,
  WheelResult,
  ScratchCard,
  ScratchSelector,
  ParticleBurst,
  StarCategories,
  StarQuestions,
  ConstellationReveal,
  StarAnswer,
} from "@features/discover/components";
import type { DiscoverTab } from "@features/discover/types";

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<DiscoverTab>("wheel");
  const { showAd } = useRewardedAd();
  const { isPremium } = usePremium();

  const wheel = useWheel();
  const scratch = useScratch();
  const stars = useStars();

  // No ad gates (monetization disabled for launch)
  const handleSpinPress = () => {
    wheel.startSpin();
  };

  const handleScratchSelect = (index: number) => {
    scratch.selectCard(index);
  };

  return (
    <ScreenContainer edges={["top"]}>
      <View style={styles.container}>
        <DiscoverTabs selected={activeTab} onSelect={setActiveTab} />

        {activeTab === "wheel" && (
          <View style={styles.wheelContent}>
            <View style={styles.wheelWrapper}>
              <ParticleBurst visible={!!wheel.result} />
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
              <ScrollView showsVerticalScrollIndicator={false} style={styles.resultScroll}>
                <WheelResult result={wheel.result} />
                <Button
                  title={t("discover.wheel.spinAgain")}
                  onPress={wheel.reset}
                  variant="ghost"
                />
              </ScrollView>
            ) : (
              <Button
                title={t("discover.wheel.spin")}
                onPress={handleSpinPress}
                disabled={wheel.isSpinning || wheel.isLoading}
              />
            )}
          </View>
        )}

        {activeTab === "scratch" && (
          <ScrollView
            contentContainerStyle={styles.scratchContent}
            showsVerticalScrollIndicator={false}
          >
            {scratch.selectedIndex === null ? (
              <>
                <Body style={styles.instruction}>{t("discover.scratch.choose")}</Body>
                <ScratchSelector
                  count={3}
                  onSelect={handleScratchSelect}
                />
              </>
            ) : (
              <View style={styles.scratchCardWrapper}>
                <Body style={styles.instruction}>{t("discover.scratch.scratchIt")}</Body>
                <ScratchCard
                  stone={scratch.selectedStone ?? { name: "", icon: "", properties: "", message: "" }}
                  onReveal={scratch.reveal}
                />
                {scratch.isRevealed && (
                  <Button
                    title={t("discover.scratch.scratchAgain")}
                    variant="ghost"
                    onPress={() => scratch.reset()}
                  />
                )}
              </View>
            )}
          </ScrollView>
        )}

        {activeTab === "stars" && (
          <ScrollView
            contentContainerStyle={styles.starsContent}
            showsVerticalScrollIndicator={false}
          >
            {stars.phase === "categories" && (
              <>
                <Body style={styles.instruction}>{t("discover.stars.chooseCategory")}</Body>
                <StarCategories
                  categories={stars.categories}
                  onSelect={stars.selectCategory}
                />
              </>
            )}

            {stars.phase === "questions" && stars.selectedCategory && (
              <>
                <Body style={styles.instruction}>{t("discover.stars.chooseQuestion")}</Body>
                <StarQuestions
                  questions={stars.questionsForCategory(stars.selectedCategory)}
                  isAsked={stars.isAsked}
                  onSelect={stars.selectQuestion}
                  onBack={stars.backToCategories}
                />
              </>
            )}

            {stars.phase === "thinking" && (
              <ConstellationReveal
                sign={stars.sign}
                onComplete={stars.showAnswer}
              />
            )}

            {stars.phase === "answer" && stars.response && stars.selectedQuestion && (
              <>
                <StarAnswer
                  response={stars.response}
                  questionText={t(stars.selectedQuestion.textKey)}
                />
                <Button
                  title={t("discover.stars.askAgain")}
                  variant="ghost"
                  onPress={stars.backToQuestions}
                />
              </>
            )}
          </ScrollView>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, paddingTop: spacing.lg, gap: spacing.lg },
  wheelContent: { flex: 1, alignItems: "center", gap: spacing.xl, paddingTop: spacing.lg },
  resultScroll: { flex: 1, width: "100%" },
  wheelWrapper: { alignItems: "center", position: "relative" },
  scratchContent: { alignItems: "center", gap: spacing.xl, paddingBottom: spacing["5xl"], flexGrow: 1 },
  scratchCardWrapper: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg },
  starsContent: { alignItems: "center", gap: spacing.xl, paddingBottom: spacing["5xl"], flexGrow: 1 },
  instruction: { fontSize: 14, opacity: 0.5 },
});
