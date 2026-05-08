import { useState, useRef, useCallback } from "react";
import { StyleSheet, View, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useTranslation } from "react-i18next";

import { ScreenContainer, Title, Body, Button } from "@shared/components";
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

const TABS: DiscoverTab[] = ["wheel", "scratch", "stars"];
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<DiscoverTab>("wheel");
  const { showAd } = useRewardedAd();
  const { isPremium } = usePremium();

  const wheel = useWheel();
  const scratch = useScratch();
  const stars = useStars();

  const scrollRef = useRef<ScrollView>(null);
  const isTabPress = useRef(false);
  const pageWidth = SCREEN_WIDTH;

  const handleTabSelect = useCallback((tab: DiscoverTab) => {
    isTabPress.current = true;
    const index = TABS.indexOf(tab);
    scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true });
    setActiveTab(tab);
  }, [pageWidth]);

  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isTabPress.current) {
      isTabPress.current = false;
      return;
    }
    const index = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    const newTab = TABS[index];
    if (newTab && newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [pageWidth, activeTab]);

  const handleSpinPress = () => {
    wheel.startSpin();
  };

  const handleScratchSelect = (index: number) => {
    scratch.selectCard(index);
  };

  return (
    <ScreenContainer edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <DiscoverTabs selected={activeTab} onSelect={handleTabSelect} />
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
          {/* Wheel page */}
          <View style={[styles.page, { width: pageWidth }]}>
            <View style={styles.wheelContent}>
              <Title style={styles.sectionTitle}>{t("discover.wheel.fullTitle")}</Title>
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
          </View>

          {/* Scratch page */}
          <View style={[styles.page, { width: pageWidth }]}>
            <ScrollView
              contentContainerStyle={styles.scratchContent}
              showsVerticalScrollIndicator={false}
            >
              {scratch.selectedIndex === null ? (
                <>
                  <Title style={styles.sectionTitle}>{t("discover.scratch.fullTitle")}</Title>
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
          </View>

          {/* Stars page */}
          <View style={[styles.page, { width: pageWidth }]}>
            <ScrollView
              contentContainerStyle={styles.starsContent}
              showsVerticalScrollIndicator={false}
            >
              {stars.phase === "categories" && (
                <>
                  <Title style={styles.sectionTitle}>{t("discover.stars.fullTitle")}</Title>
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
          </View>
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
  wheelContent: { flex: 1, alignItems: "center", gap: spacing.xl, paddingTop: spacing.lg },
  resultScroll: { flex: 1, width: "100%" },
  wheelWrapper: { alignItems: "center", position: "relative" },
  scratchContent: { alignItems: "center", gap: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing["5xl"], flexGrow: 1 },
  scratchCardWrapper: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg },
  starsContent: { alignItems: "center", gap: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing["5xl"], flexGrow: 1 },
  sectionTitle: { fontSize: 20, textAlign: "center" },
  instruction: { fontSize: 14, opacity: 0.5 },
});
