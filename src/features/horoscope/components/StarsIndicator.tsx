import { StyleSheet, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, { FadeIn } from "react-native-reanimated";

import { Body, Label } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";
import type { Stars } from "../types";

type StarsIndicatorProps = {
  stars: Stars;
  unlocked: boolean;
  onUnlock: () => void;
};

const renderStars = (count: number): string => {
  return "\u2605".repeat(count) + "\u2606".repeat(5 - count);
};

export const StarsIndicator = ({ stars, unlocked, onUnlock }: StarsIndicatorProps) => {
  const { t } = useTranslation();

  const sections: { key: keyof Stars; label: string }[] = [
    { key: "love", label: t("horoscope.love") },
    { key: "work", label: t("horoscope.work") },
    { key: "health", label: t("horoscope.health") },
    { key: "luck", label: t("horoscope.luck") },
  ];

  if (!unlocked) {
    return (
      <Pressable onPress={onUnlock} style={styles.lockedContainer}>
        {sections.map((s) => (
          <View key={s.key} style={styles.card}>
            <Label>{s.label}</Label>
            <Body style={styles.locked}>{"\uD83D\uDD12"}</Body>
          </View>
        ))}
        <View style={styles.unlockOverlay}>
          <Body style={styles.unlockText}>{t("ads.watchToUnlock")}</Body>
        </View>
      </Pressable>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
      {sections.map((s) => (
        <View key={s.key} style={styles.card}>
          <Label style={styles.cardLabel}>{s.label}</Label>
          <Body style={styles.stars}>{renderStars(stars[s.key])}</Body>
        </View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  lockedContainer: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, position: "relative" },
  card: {
    flexBasis: "47%", flexGrow: 1,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  cardLabel: { color: colors.gold },
  stars: { color: colors.gold, fontSize: 18, textAlign: "center" },
  locked: { fontSize: 18, opacity: 0.5 },
  unlockOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(13, 13, 13, 0.6)",
    borderRadius: radius.md,
  },
  unlockText: { color: colors.gold, fontSize: 12, fontFamily: "Inter-SemiBold" },
});
