import { StyleSheet, View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Body, Title } from '@shared/components';
import { colors, radius, spacing } from '@shared/theme';
import type { BadgeInfo } from '../types';

type BadgeGridProps = {
  badges: BadgeInfo[];
};

export const BadgeGrid = ({ badges }: BadgeGridProps) => {
  const { t } = useTranslation();

  return (
    <View>
      <Title style={styles.sectionTitle}>{t('profile.badges')}</Title>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {badges.map((badge) => (
          <View key={badge.id} style={[styles.badge, badge.earned ? styles.earned : styles.notEarned]}>
            <Body style={[styles.icon, !badge.earned && styles.iconGrey]}>{badge.icon}</Body>
            <Body style={[styles.name, !badge.earned && styles.nameGrey]}>{t(badge.nameKey)}</Body>
            {!badge.earned && (
              <Body style={styles.progress}>
                {t('badges.progress', { current: badge.current, total: badge.total })}
              </Body>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, marginBottom: spacing.md },
  scroll: { gap: spacing.md, paddingRight: spacing.xl },
  badge: {
    width: 90, borderRadius: radius.md, padding: spacing.md,
    alignItems: 'center', gap: spacing.xs,
  },
  earned: { backgroundColor: colors.goldMuted, borderWidth: 1, borderColor: colors.goldBorder },
  notEarned: { backgroundColor: colors.whiteOverlay, borderWidth: 1, borderColor: colors.whiteBorder },
  icon: { fontSize: 28 },
  iconGrey: { opacity: 0.3 },
  name: { fontSize: 10, color: colors.gold, textAlign: 'center', fontFamily: 'Inter-Medium' },
  nameGrey: { color: colors.whiteDim },
  progress: { fontSize: 9, color: colors.whiteDim, opacity: 0.6 },
});
