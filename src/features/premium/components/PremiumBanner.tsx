import { StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Body, Title } from '@shared/components';
import { spacing } from '@shared/theme';

export const PremiumBanner = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push('/paywall')}>
      <Card variant="gold" style={styles.card}>
        <Title style={styles.title}>{'\u2B50'} {t('premium.title')}</Title>
        <Body style={styles.subtitle}>{t('premium.subtitle')}</Body>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.xs },
  title: { fontSize: 16 },
  subtitle: { fontSize: 12, opacity: 0.7 },
});
