import { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

import { ScreenContainer, Title, Body } from "@shared/components";
import { colors, spacing } from "@shared/theme";
import { storageService } from "@services/storage";
import { useRewardedAd } from "@services/ads";
import { usePremium } from '@services/premium';
import { getZodiacSignById } from "@shared/utils/zodiac";
import { useHoroscope } from "@features/horoscope/hooks";
import {
  HoroscopeCard,
  LuckyBadges,
  StarsIndicator,
  DetailSection,
  AffinityCard,
} from "@features/horoscope/components";
import type { HoroscopeSection } from "@features/horoscope/types";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { horoscope, isLoading, error } = useHoroscope();
  const { showAd } = useRewardedAd();
  const { isPremium } = usePremium();

  const profile = storageService.getUserProfile();
  const sign = profile ? getZodiacSignById(profile.zodiacSign) : null;

  const todayStr = new Date().toISOString().split("T")[0];
  const usage = storageService.getDailyUsage(todayStr);

  const [starsUnlocked, setStarsUnlocked] = useState(isPremium || usage.freeHoroscopeRead);
  const [unlockedSections, setUnlockedSections] = useState<Record<HoroscopeSection, boolean>>({
    love: isPremium,
    work: isPremium,
    luck: isPremium,
  });
  const [affinityUnlocked, setAffinityUnlocked] = useState(isPremium);

  const handleUnlockStars = async () => {
    const rewarded = await showAd();
    if (rewarded) {
      setStarsUnlocked(true);
      const updated = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({
        ...updated,
        freeHoroscopeRead: true,
        rewardedAdsWatched: updated.rewardedAdsWatched + 1,
      });
    }
  };

  const handleUnlockSection = async (section: HoroscopeSection) => {
    const rewarded = await showAd();
    if (rewarded) {
      setUnlockedSections((prev) => ({ ...prev, [section]: true }));
      const updated = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({
        ...updated,
        rewardedAdsWatched: updated.rewardedAdsWatched + 1,
      });
    }
  };

  const handleUnlockAffinity = async () => {
    const rewarded = await showAd();
    if (rewarded) {
      setAffinityUnlocked(true);
      const updated = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({
        ...updated,
        rewardedAdsWatched: updated.rewardedAdsWatched + 1,
      });
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <Body style={styles.loadingText}>...</Body>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Title>
              {t("home.greeting", { sign: sign ? t(sign.nameKey) : "" })}
            </Title>
            <Body style={styles.date}>
              {new Date().toLocaleDateString("it-IT", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Body>
          </View>
          <Pressable onPress={() => router.push("/profile")}>
            <View style={styles.avatar}>
              <Body style={styles.avatarText}>
                {sign?.symbol ?? "\u2609"}
              </Body>
            </View>
          </Pressable>
        </View>

        {horoscope ? (
          <View style={styles.content}>
            <HoroscopeCard text={horoscope.general} />

            <LuckyBadges
              luckyNumber={horoscope.luckyNumber}
              luckyColor={horoscope.luckyColor}
            />

            <StarsIndicator
              stars={horoscope.stars}
              unlocked={starsUnlocked}
              onUnlock={handleUnlockStars}
            />

            {(["love", "work", "luck"] as HoroscopeSection[]).map(
              (section) => (
                <DetailSection
                  key={section}
                  section={section}
                  text={horoscope[section]}
                  unlocked={unlockedSections[section]}
                  onUnlock={() => handleUnlockSection(section)}
                />
              )
            )}

            <AffinityCard
              compatibility={horoscope.compatibility}
              unlocked={affinityUnlocked}
              onUnlock={handleUnlockAffinity}
            />
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Body style={styles.errorText}>
              {error ?? "Oroscopo non disponibile"}
            </Body>
          </View>
        )}

        {!isPremium && (
          <View style={styles.bannerContainer}>
            <BannerAd unitId={TestIds.ADAPTIVE_BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  date: { fontSize: 12, opacity: 0.5, marginTop: spacing.xs },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.goldMuted, borderWidth: 1, borderColor: colors.goldBorder,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 18 },
  content: { gap: spacing.lg },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { opacity: 0.5 },
  errorContainer: {
    flex: 1, justifyContent: "center", alignItems: "center",
    paddingVertical: spacing["5xl"],
  },
  errorText: { opacity: 0.5, textAlign: "center" },
  bannerContainer: { alignItems: "center", marginTop: spacing.lg },
});
