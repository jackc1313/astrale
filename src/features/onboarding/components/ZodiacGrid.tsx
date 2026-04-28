import { StyleSheet, Pressable, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing } from '@shared/theme';
import { Body } from '@shared/components';
import { zodiacSigns, type ZodiacSignId } from '@shared/utils/zodiac';

type ZodiacGridProps = {
  selected: ZodiacSignId | null;
  onSelect: (id: ZodiacSignId) => void;
};

export const ZodiacGrid = ({ selected, onSelect }: ZodiacGridProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.grid}>
      {zodiacSigns.map((sign) => {
        const isSelected = selected === sign.id;
        return (
          <Pressable
            key={sign.id}
            onPress={() => onSelect(sign.id)}
            style={[styles.cell, isSelected ? styles.cellSelected : styles.cellDefault]}
          >
            <Text style={styles.symbol}>{sign.emoji}</Text>
            <Body style={styles.name}>{t(sign.nameKey)}</Body>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: {
    width: '30%', flexGrow: 1, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center', gap: spacing.xs,
  },
  cellDefault: {
    backgroundColor: colors.whiteOverlay, borderWidth: 1, borderColor: colors.whiteBorder,
  },
  cellSelected: {
    backgroundColor: colors.goldMuted, borderWidth: 1, borderColor: colors.goldBorder,
  },
  symbol: { fontSize: 20 },
  name: { fontSize: 9 },
});
