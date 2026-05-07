import { StyleSheet, View, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { Body } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";
import type { StarCategory } from "../data/starQuestions";

type StarCategoriesProps = {
  categories: { id: StarCategory; labelKey: string; icon: string }[];
  onSelect: (category: StarCategory) => void;
};

export const StarCategories = ({ categories, onSelect }: StarCategoriesProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {categories.map((cat) => (
        <Pressable key={cat.id} style={styles.card} onPress={() => onSelect(cat.id)}>
          <MaterialCommunityIcons name={cat.icon as any} size={32} color={colors.gold} />
          <Body style={styles.label}>{t(cat.labelKey)}</Body>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.md, width: "100%" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    backgroundColor: colors.whiteOverlay,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: spacing.lg,
  },
  label: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 18,
    color: colors.pearlWhite,
  },
});
