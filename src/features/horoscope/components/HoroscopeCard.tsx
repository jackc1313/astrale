import { StyleSheet } from "react-native";

import { Card, Body } from "@shared/components";

type HoroscopeCardProps = {
  text: string;
};

export const HoroscopeCard = ({ text }: HoroscopeCardProps) => {
  return (
    <Card variant="subtle">
      <Body style={styles.text}>{text}</Body>
    </Card>
  );
};

const styles = StyleSheet.create({
  text: {
    lineHeight: 24,
    fontSize: 15,
  },
});
