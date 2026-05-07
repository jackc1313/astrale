import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenContainer, Title, Body, Button, ProgressBar } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { ZodiacGrid } from '@features/onboarding/components';
import { useOnboardingContext } from './_layout';

export default function AscendantScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { ascendant, setAscendant } = useOnboardingContext();

  const handleSkip = () => {
    setAscendant(null);
    router.push('/(onboarding)/interests');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.pearlWhite} />
        </Pressable>
        <ProgressBar steps={4} currentStep={2} />
        <View style={styles.header}>
          <Title style={styles.headerTitle}>{t('onboarding.ascendant.title')}</Title>
          <Body style={styles.subtitle}>{t('onboarding.ascendant.subtitle')}</Body>
        </View>
        <Body style={styles.description}>{t('onboarding.ascendant.description')}</Body>
        <ZodiacGrid selected={ascendant} onSelect={setAscendant} />
        <Body onPress={handleSkip} style={styles.skipLink}>
          {t('onboarding.ascendant.skip')}
        </Body>
        <View style={styles.footer}>
          <Button
            title={t('common.continue')}
            onPress={() => router.push('/(onboarding)/interests')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  backButton: { marginBottom: spacing.sm },
  header: { marginTop: spacing['4xl'], gap: spacing.sm },
  headerTitle: { fontSize: 24, lineHeight: 34 },
  subtitle: { opacity: 0.6, fontSize: 14 },
  description: { marginTop: spacing.lg, marginBottom: spacing.xl, opacity: 0.7, fontSize: 13 },
  skipLink: { textAlign: 'center', color: colors.gold, fontSize: 12, marginTop: spacing['5xl'], opacity: 0.7 },
  footer: { marginTop: 'auto' },
});
