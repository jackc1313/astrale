import { StyleSheet, View, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

import { Card, Body, Title, Label } from "@shared/components";
import { colors, spacing } from "@shared/theme";
import { getZodiacSignById, type ZodiacSignId } from "@shared/utils/zodiac";

type AffinityCardProps = {
  compatibility: ZodiacSignId;
  unlocked: boolean;
  onUnlock: () => void;
};

export const AffinityCard = ({ compatibility, unlocked, onUnlock }: AffinityCardProps) => {
  const { t } = useTranslation();
  const sign = getZodiacSignById(compatibility);

  if (!unlocked) {
    return (
      <Pressable onPress={onUnlock}>
        <Card variant="gold">
          <Title style={styles.title}>{t("horoscope.affinity")}</Title>
          <View style={styles.lockContent}>
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
      <Card variant="gold">
        <Title style={styles.title}>{t("horoscope.affinity")}</Title>
        <Label>{t("horoscope.affinityDesc")}</Label>
        <View style={styles.signRow}>
          <Body style={styles.signSymbol}>{sign.symbol}</Body>
          <Body style={styles.signName}>{t(sign.nameKey)}</Body>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 16, marginBottom: spacing.xs },
  lockContent: { paddingVertical: spacing.xl, alignItems: "center" },
  lockText: { color: colors.gold, fontSize: 13, fontFamily: "Inter-SemiBold" },
  signRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.lg },
  signSymbol: { fontSize: 32 },
  signName: { fontFamily: "PlayfairDisplay-Bold", fontSize: 20, color: colors.pearlWhite },
});
