import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown, ReduceMotion } from "react-native-reanimated";

import { Body, Card } from "@shared/components";
import { colors, spacing } from "@shared/theme";
import type { StarResponse } from "../data/starQuestions";

type StarAnswerProps = {
  response: StarResponse;
  questionText: string;
};

export const StarAnswer = ({ response, questionText }: StarAnswerProps) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(800).delay(200).reduceMotion(ReduceMotion.Never)}
      style={styles.container}
    >
      <Body style={styles.question}>{questionText}</Body>

      <Card variant="gold" style={styles.responseCard}>
        <MaterialCommunityIcons name="star-four-points" size={24} color={colors.gold} style={styles.icon} />
        <Body style={styles.responseText}>{response.text}</Body>
      </Card>

      <Card variant="subtle" style={styles.adviceCard}>
        <View style={styles.adviceHeader}>
          <MaterialCommunityIcons name="lightbulb-outline" size={18} color={colors.gold} />
          <Body style={styles.adviceLabel}>Consiglio delle stelle</Body>
        </View>
        <Body style={styles.adviceText}>{response.advice}</Body>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.lg, width: "100%" },
  question: {
    fontSize: 14,
    color: colors.whiteDim,
    textAlign: "center",
    fontStyle: "italic",
  },
  responseCard: { alignItems: "center", gap: spacing.md },
  icon: { marginBottom: spacing.xs },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.pearlWhite,
    textAlign: "center",
  },
  adviceCard: { gap: spacing.sm },
  adviceHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  adviceLabel: { fontSize: 12, color: colors.gold, fontFamily: "Inter-SemiBold" },
  adviceText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.pearlWhite,
    opacity: 0.85,
  },
});
