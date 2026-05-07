import { StyleSheet, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import { Body } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";
import type { DiscoverTab } from "../types";

type DiscoverTabsProps = {
  selected: DiscoverTab;
  onSelect: (tab: DiscoverTab) => void;
};

export const DiscoverTabs = ({ selected, onSelect }: DiscoverTabsProps) => {
  const { t } = useTranslation();

  const tabs: { id: DiscoverTab; label: string }[] = [
    { id: "wheel", label: t("discover.wheel.title") },
    { id: "scratch", label: t("discover.scratch.title") },
    { id: "stars", label: t("discover.stars.title") },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onSelect(tab.id)}
          style={[styles.tab, selected === tab.id && styles.tabActive]}
        >
          <Body style={[styles.label, selected === tab.id && styles.labelActive]}>
            {tab.label}
          </Body>
        </Pressable>
      ))}
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
