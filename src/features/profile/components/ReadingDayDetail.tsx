import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Body, Card } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import type { ReadingEntry } from '../types';

type ReadingDayDetailProps = {
  date: string;
  entries: ReadingEntry[];
};

const TYPE_ICONS: Record<string, string> = {
  horoscope: '\u2609',
  tarot: '\u2721',
  wheel: '\u2728',
  scratch: '\u2B50',
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
            <Body style={styles.icon}>{TYPE_ICONS[entry.type] ?? ''}</Body>
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
  icon: { fontSize: 20 },
  content: { flex: 1, gap: 2 },
  type: { fontSize: 12, fontFamily: 'Inter-SemiBold', color: colors.gold },
  summary: { fontSize: 12, opacity: 0.7 },
});
