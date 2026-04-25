import { StyleSheet, View, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

import { Card, Body, Title } from "@shared/components";
import { colors, spacing } from "@shared/theme";
import type { HoroscopeSection } from "../types";

type DetailSectionProps = {
  section: HoroscopeSection;
  text: string;
  unlocked: boolean;
  onUnlock: () => void;
};

export const DetailSection = ({ section, text, unlocked, onUnlock }: DetailSectionProps) => {
  const { t } = useTranslation();
  const sectionLabel = t(`horoscope.${section}`);

  if (!unlocked) {
    return (
      <Pressable onPress={onUnlock}>
        <Card variant="subtle">
          <Title style={styles.sectionTitle}>{sectionLabel}</Title>
          <Body style={styles.blurredText} numberOfLines={3}>{text}</Body>
          <View style={styles.lockOverlay}>
            <Body style={styles.lockText}>
              {"\uD83D\uDD12"} {t("ads.watchToUnlock")}
            </Body>
          </View>
        </Card>
      </Pressable>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(600)}>
      <Card variant="subtle">
        <Title style={styles.sectionTitle}>{sectionLabel}</Title>
        <Body style={styles.text}>{text}</Body>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, marginBottom: spacing.sm },
  text: { lineHeight: 24, fontSize: 14 },
  blurredText: { lineHeight: 24, fontSize: 14, opacity: 0.15 },
  lockOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  lockText: { color: colors.gold, fontSize: 13, fontFamily: "Inter-SemiBold" },
});
