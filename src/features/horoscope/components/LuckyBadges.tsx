import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Body, Label } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";

type LuckyBadgesProps = {
  luckyNumber: number;
  luckyColor: string;
};

export const LuckyBadges = ({ luckyNumber, luckyColor }: LuckyBadgesProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Label>{t("horoscope.luckyNumber")}</Label>
        <Body style={styles.number}>{luckyNumber}</Body>
      </View>
      <View style={styles.badge}>
        <Label>{t("horoscope.luckyColor")}</Label>
        <Body style={styles.colorName}>{luckyColor}</Body>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: spacing.md },
  badge: {
    flex: 1,
    backgroundColor: colors.whiteOverlay,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  number: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 22,
    color: colors.pearlWhite,
  },
  colorName: { fontSize: 14, color: colors.pearlWhite },
});
