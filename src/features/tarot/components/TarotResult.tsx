import { StyleSheet, View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Body, Title, Card } from "@shared/components";
import { colors, spacing } from "@shared/theme";
import type { DrawnCard, TarotInterpretation, TarotMode } from "../types";
import { TarotCard } from "./TarotCard";

type TarotResultProps = {
  drawnCards: DrawnCard[];
  interpretation: TarotInterpretation | null;
  mode: TarotMode;
  countdown?: string;
};

const THREE_CARD_LABELS: Record<string, string[]> = {
  three_card: ["tarot.past", "tarot.present", "tarot.future"],
  love: ["tarot.you", "tarot.partner", "tarot.relationship"],
};

export const TarotResult = ({ drawnCards, interpretation, mode, countdown }: TarotResultProps) => {
  const { t } = useTranslation();
  const labels = THREE_CARD_LABELS[mode];

  return (
    <Animated.View entering={FadeInDown.duration(600).delay(300)}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.cardsRow}>
          {drawnCards.map((drawn, i) => (
            <View key={drawn.card.id} style={styles.cardWrapper}>
              {labels && <Body style={styles.cardLabel}>{t(labels[i])}</Body>}
              <TarotCard
                card={drawn.card}
                side="front"
                reversed={drawn.orientation === "reversed"}
                width={mode === "daily" ? 160 : 100}
                height={mode === "daily" ? 250 : 156}
              />
              <Body style={styles.cardName}>{t(drawn.card.nameKey)}</Body>
              <Body style={styles.orientation}>
                {t(drawn.orientation === "upright" ? "tarot.upright" : "tarot.reversed")}
              </Body>
            </View>
          ))}
        </View>

        {drawnCards.length > 0 && (
          <Card variant="subtle" style={styles.meaningCard}>
            <Body style={styles.meaningText}>
              {t(drawnCards[0].orientation === "upright" ? drawnCards[0].card.uprightKey : drawnCards[0].card.reversedKey)}
            </Body>
          </Card>
        )}

        {interpretation && (
          <Card variant="gold" style={styles.interpretationCard}>
            <Title style={styles.interpretationTitle}>{t("horoscope.general")}</Title>
            <Body style={styles.interpretationText}>{interpretation.general}</Body>
          </Card>
        )}

        {countdown && (
          <View style={styles.countdownContainer}>
            <Body style={styles.countdownLabel}>Prossima carta tra</Body>
            <Body style={styles.countdownTime}>{countdown}</Body>
          </View>
        )}

      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scroll: { gap: spacing.lg, paddingBottom: spacing["5xl"] },
  cardsRow: { flexDirection: "row", justifyContent: "center", gap: spacing.md, marginTop: spacing.lg },
  cardWrapper: { alignItems: "center", gap: spacing.xs },
  cardLabel: { fontSize: 11, color: colors.gold, fontFamily: "Inter-SemiBold", textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.xs },
  cardName: { fontFamily: "PlayfairDisplay-Bold", fontSize: 13, color: colors.pearlWhite, marginTop: spacing.xs },
  orientation: { fontSize: 10, color: colors.gold, opacity: 0.7 },
  meaningCard: { marginTop: spacing.sm },
  meaningText: { lineHeight: 22, fontSize: 14 },
  interpretationCard: { marginTop: spacing.sm },
  interpretationTitle: { fontSize: 14, marginBottom: spacing.xs },
  interpretationText: { lineHeight: 22, fontSize: 14 },
  countdownContainer: { alignItems: "center", gap: spacing.xs, marginTop: spacing.xl },
  countdownLabel: { fontSize: 12, opacity: 0.5 },
  countdownTime: { fontSize: 24, fontFamily: "PlayfairDisplay-Bold", color: colors.gold },
});
