import { StyleSheet, View, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { Body } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";
import type { StarQuestion } from "../data/starQuestions";

type StarQuestionsProps = {
  questions: StarQuestion[];
  isAsked: (id: string) => boolean;
  onSelect: (question: StarQuestion) => void;
  onBack: () => void;
};

export const StarQuestions = ({ questions, isAsked, onSelect, onBack }: StarQuestionsProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack} style={styles.backRow}>
        <MaterialCommunityIcons name="arrow-left" size={20} color={colors.gold} />
        <Body style={styles.backLabel}>{t("discover.stars.backToCategories")}</Body>
      </Pressable>
      <View style={styles.questions}>
        {questions.map((q) => {
          const asked = isAsked(q.id);
          return (
            <Pressable
              key={q.id}
              style={[styles.card, asked && styles.cardDisabled]}
              onPress={() => !asked && onSelect(q)}
              disabled={asked}
            >
              <Body style={[styles.questionText, asked && styles.questionTextDisabled]}>
                {t(q.textKey)}
              </Body>
              {asked && (
                <MaterialCommunityIcons name="check-circle" size={20} color={colors.gold} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.lg, width: "100%" },
  backRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  backLabel: { fontSize: 13, color: colors.gold },
  questions: { gap: spacing.md },
  card: {
    backgroundColor: colors.whiteOverlay,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardDisabled: { opacity: 0.5 },
  questionText: { fontSize: 15, color: colors.pearlWhite, flex: 1 },
  questionTextDisabled: { opacity: 0.7 },
});
