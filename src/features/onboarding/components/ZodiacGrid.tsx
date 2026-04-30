import { StyleSheet, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { colors, radius, spacing } from '@shared/theme';
import { Body } from '@shared/components';
import { zodiacSigns, getZodiacIconName, type ZodiacSignId } from '@shared/utils/zodiac';

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
            <MaterialCommunityIcons
              name={getZodiacIconName(sign.id) as any}
              size={20}
              color={isSelected ? colors.gold : colors.pearlWhite}
            />
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
  name: { fontSize: 9 },
});
