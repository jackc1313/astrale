import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Body, Title } from '@shared/components';
import { Card } from '@shared/components';
import { colors, spacing } from '@shared/theme';

type StreakCounterProps = {
  currentStreak: number;
  longestStreak: number;
};

export const StreakCounter = ({ currentStreak, longestStreak }: StreakCounterProps) => {
  const { t } = useTranslation();

  return (
    <Card variant="gold">
      <View style={styles.row}>
        <Body style={styles.flame}>{'\uD83D\uDD25'}</Body>
        <View>
          <Title style={styles.count}>{currentStreak}</Title>
          <Body style={styles.label}>
            {t('profile.streak', { count: currentStreak })}
          </Body>
        </View>
      </View>
      <Body style={styles.longest}>
        {t('profile.longestStreak', { count: longestStreak })}
      </Body>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flame: { fontSize: 36 },
  count: { fontSize: 32, color: colors.gold },
  label: { fontSize: 13, opacity: 0.7 },
  longest: { fontSize: 11, opacity: 0.5, marginTop: spacing.sm },
});
