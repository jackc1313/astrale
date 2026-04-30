import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Body, Card } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import type { ReadingEntry } from '../types';

type ReadingDayDetailProps = {
  date: string;
  entries: ReadingEntry[];
};

const TYPE_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  horoscope: 'star-four-points-outline',
  tarot: 'cards-outline',
  wheel: 'compass-outline',
  scratch: 'diamond-stone',
};

export const ReadingDayDetail = ({ date, entries }: ReadingDayDetailProps) => {
  const { t } = useTranslation();

  if (entries.length === 0) {
    return (
      <Body style={styles.empty}>{t('history.noEntries')}</Body>
    );
  }

  return (
    <View style={styles.container}>
      {entries.map((entry, i) => (
        <Card key={i} variant="subtle" style={styles.entry}>
          <View style={styles.row}>
            <MaterialCommunityIcons
              name={TYPE_ICONS[entry.type] ?? 'circle'}
              size={20}
              color={colors.gold}
            />
            <View style={styles.content}>
              <Body style={styles.type}>{t(`history.${entry.type}`)}</Body>
              <Body style={styles.summary} numberOfLines={2}>{entry.summary}</Body>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.sm, marginTop: spacing.md },
  empty: { opacity: 0.4, textAlign: 'center', marginTop: spacing.lg },
  entry: { padding: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  content: { flex: 1, gap: 2 },
  type: { fontSize: 12, fontFamily: 'Inter-SemiBold', color: colors.gold },
  summary: { fontSize: 12, opacity: 0.7 },
});
