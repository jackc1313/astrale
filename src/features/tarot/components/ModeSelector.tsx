import { StyleSheet, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import { Body } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";
import type { TarotMode } from "../types";

type ModeSelectorProps = {
  selected: TarotMode;
  onSelect: (mode: TarotMode) => void;
  lockedModes: TarotMode[];
  onUnlockMode: (mode: TarotMode) => void;
};

const MODES: { id: TarotMode; labelKey: string }[] = [
  { id: "daily", labelKey: "tarot.cardOfDay" },
  { id: "three_card", labelKey: "tarot.pastPresentFuture" },
  { id: "love", labelKey: "tarot.loveReading" },
];

export const ModeSelector = ({ selected, onSelect, lockedModes, onUnlockMode }: ModeSelectorProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {MODES.map((m) => {
        const isActive = selected === m.id;
        const isLocked = lockedModes.includes(m.id);

        return (
          <Pressable
            key={m.id}
            onPress={() => { isLocked ? onUnlockMode(m.id) : onSelect(m.id); }}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Body style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
              {isLocked ? "\uD83D\uDD12 " : ""}{t(m.labelKey)}
            </Body>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", backgroundColor: colors.whiteOverlay, borderRadius: radius.md, padding: 3, gap: 3 },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: "center", borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.goldMuted, borderWidth: 1, borderColor: colors.goldBorder },
  label: { fontSize: 11, color: colors.whiteDim, fontFamily: "Inter-Medium" },
  labelActive: { color: colors.gold },
});
