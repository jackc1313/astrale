import { StyleSheet, View, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Body } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";

type ScratchSelectorProps = {
  count: number;
  onSelect: (index: number) => void;
};

export const ScratchSelector = ({ count, onSelect }: ScratchSelectorProps) => {
  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      {Array.from({ length: count }, (_, i) => (
        <Pressable key={i} onPress={() => onSelect(i)}>
          <View style={styles.card}>
            <Body style={styles.questionMark}>?</Body>
            <Body style={styles.label}>{i + 1}</Body>
          </View>
        </Pressable>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: spacing.md, justifyContent: "center" },
  card: {
    width: 100, height: 140, borderRadius: radius.lg,
    backgroundColor: colors.goldMuted, borderWidth: 1, borderColor: colors.goldBorder,
    alignItems: "center", justifyContent: "center", gap: spacing.sm,
  },
  questionMark: { fontFamily: "PlayfairDisplay-Bold", fontSize: 36, color: colors.gold },
  label: { fontSize: 12, color: colors.whiteDim },
});
