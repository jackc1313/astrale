import { StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Card, Body } from "@shared/components";
import { spacing } from "@shared/theme";
import type { WheelItem } from "../types";

type WheelResultProps = {
  result: WheelItem;
};

export const WheelResult = ({ result }: WheelResultProps) => {
  return (
    <Animated.View entering={FadeInUp.duration(500)}>
      <Card variant="gold" style={styles.card}>
        <Body style={styles.text}>{result.fullText}</Body>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: { marginTop: spacing.xl },
  text: { fontSize: 16, lineHeight: 24, textAlign: "center", fontFamily: "PlayfairDisplay-Bold" },
});
