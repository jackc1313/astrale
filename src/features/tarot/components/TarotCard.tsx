import { StyleSheet, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Body } from "@shared/components";
import { colors, radius } from "@shared/theme";
import type { TarotCard as TarotCardType } from "../types";
import { getRomanNumeral } from "../data/majorArcana";

const appIcon = require("../../../../assets/icon_golden_only.png");

type TarotCardProps = {
  card: TarotCardType;
  side: "front" | "back";
  width?: number;
  height?: number;
};

export const TarotCard = ({ card, side, width = 140, height = 220 }: TarotCardProps) => {
  if (side === "back") {
    return (
      <LinearGradient colors={[colors.deepPurple, "#2a1838"]} style={[styles.card, { width, height }]}>
        <Image source={appIcon} style={styles.backIcon} resizeMode="contain" />
        <Body style={styles.backLabel}>ASTRALE</Body>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#2a1838", colors.deepPurple, "#0d0d0d"]} style={[styles.card, { width, height }]}>
      <Body style={styles.roman}>{getRomanNumeral(card.number)}</Body>
      <Body style={styles.symbol}>{card.symbol}</Body>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.goldBorder,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  roman: { fontFamily: "PlayfairDisplay-Bold", fontSize: 14, color: colors.gold, position: "absolute", top: 12 },
  symbol: { fontSize: 40, color: colors.gold },
  backIcon: { width: "60%", height: "60%" },
  backLabel: { fontFamily: "PlayfairDisplay-Bold", fontSize: 8, color: colors.gold, opacity: 0.4, letterSpacing: 4, marginTop: 4 },
});
