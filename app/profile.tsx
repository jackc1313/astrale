import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenContainer, Title, Body } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { storageService } from '@services/storage';
import { getZodiacSignById } from '@shared/utils/zodiac';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = storageService.getUserProfile();
  const sign = profile ? getZodiacSignById(profile.zodiacSign) : null;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Body style={styles.backButton}>{t('common.back')}</Body>
          </Pressable>
          <Title>{t('profile.title')}</Title>
        </View>
        {sign && (
          <View style={styles.signSection}>
            <Body style={styles.signSymbol}>{sign.symbol}</Body>
            <Body style={styles.signName}>{t(sign.nameKey)}</Body>
            {profile?.ascendant && (
              <Body style={styles.ascendantText}>
                Asc: {t(getZodiacSignById(profile.ascendant).nameKey)}
              </Body>
            )}
          </View>
        )}
        <View style={styles.placeholder}>
          <Body style={styles.placeholderText}>Streak, Badge, Storico — Fase 3</Body>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  header: { gap: spacing.lg },
  backButton: { color: colors.gold, fontSize: 14 },
  signSection: { alignItems: 'center', marginTop: spacing['3xl'], gap: spacing.sm },
  signSymbol: { fontSize: 48 },
  signName: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 24 },
  ascendantText: { opacity: 0.6, fontSize: 14 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { opacity: 0.3, fontSize: 14 },
});
