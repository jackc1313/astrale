import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Card, Body, Label } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";
import type { WheelItem } from "../types";

type WheelResultProps = {
  result: WheelItem;
};

export const WheelResult = ({ result }: WheelResultProps) => {
  return (
    <Animated.View entering={FadeInUp.duration(500)}>
      <Card variant="gold" style={styles.card}>
        <View style={styles.header}>
          <MaterialCommunityIcons name={result.icon as any} size={24} color={colors.gold} />
          <Body style={styles.category}>{result.category}</Body>
        </View>

        <Body style={styles.message}>{result.fullText}</Body>

        <View style={styles.detailsRow}>
          <View style={styles.detailBox}>
            <Label style={styles.detailLabel}>Consiglio</Label>
            <Body style={styles.detailText}>{result.tip}</Body>
          </View>
          <View style={styles.detailBox}>
            <Label style={styles.detailLabel}>Momento ideale</Label>
            <Body style={styles.detailText}>{result.bestMoment}</Body>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: { marginTop: spacing.xl, gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  emoji: { fontSize: 24 },
  category: {
    fontFamily: "PlayfairDisplay-Bold", fontSize: 18,
    color: colors.gold,
  },
  message: {
    fontSize: 14, lineHeight: 22, color: colors.pearlWhite,
  },
  detailsRow: {
    flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs,
  },
  detailBox: {
    flex: 1, backgroundColor: colors.whiteOverlay, borderRadius: radius.sm,
    padding: spacing.sm, gap: spacing.xs,
  },
  detailLabel: {
    fontSize: 9, color: colors.gold,
  },
  detailText: {
    fontSize: 12, color: colors.pearlWhite, lineHeight: 16,
  },
});
