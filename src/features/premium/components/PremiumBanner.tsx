import { StyleSheet, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Card, Body, Title } from '@shared/components';
import { colors, spacing } from '@shared/theme';

export const PremiumBanner = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push('/paywall')}>
      <Card variant="gold" style={styles.card}>
        <View style={styles.row}>
          <MaterialCommunityIcons name="star-four-points" size={18} color={colors.gold} />
          <Title style={styles.title}>{t('premium.title')}</Title>
        </View>
        <Body style={styles.subtitle}>{t('premium.subtitle')}</Body>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: 16 },
  subtitle: { fontSize: 12, opacity: 0.7 },
});
