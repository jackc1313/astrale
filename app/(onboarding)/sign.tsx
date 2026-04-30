import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenContainer, Title, Body, Button, ProgressBar } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import { getZodiacSign, getZodiacSignById, getZodiacIconName } from '@shared/utils/zodiac';
import { useOnboardingContext } from './_layout';

export default function SignScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { birthDate, setBirthDate, zodiacSign, setZodiacSign } = useOnboardingContext();

  const handleDateChange = (_: unknown, date?: Date) => {
    if (date) {
      setBirthDate(date);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      setZodiacSign(getZodiacSign(month, day));
    }
  };

  const sign = zodiacSign ? getZodiacSignById(zodiacSign) : null;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ProgressBar steps={4} currentStep={1} />
        <View style={styles.header}>
          <Title style={styles.headerTitle}>{t('onboarding.sign.title')}</Title>
          <Body style={styles.subtitle}>{t('onboarding.sign.subtitle')}</Body>
        </View>
        <View style={styles.pickerWrapper}>
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
            onChange={handleDateChange}
            themeVariant="dark"
            style={styles.picker}
          />
        </View>
        {sign && (
          <View style={styles.result}>
            <MaterialCommunityIcons
              name={getZodiacIconName(sign.id) as any}
              size={90}
              color={colors.gold}
            />
            <Body style={styles.signName}>{t(sign.nameKey)}</Body>
          </View>
        )}
        <View style={styles.footer}>
          <Button
            title={t('common.continue')}
            onPress={() => router.push('/(onboarding)/ascendant')}
            disabled={!zodiacSign}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  header: { marginTop: spacing['4xl'], gap: spacing.sm },
  headerTitle: { fontSize: 24, lineHeight: 34 },
  subtitle: { opacity: 0.6, fontSize: 14 },
  pickerWrapper: { alignItems: 'center', marginTop: spacing.lg },
  picker: { height: 150, width: '100%' },
  result: { alignItems: 'center', paddingTop: spacing['4xl'], paddingBottom: spacing['4xl'], gap: spacing.md },
  signEmoji: { fontSize: 48 },
  signName: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 28, lineHeight: 40, color: colors.pearlWhite },
  footer: { marginTop: 'auto' },
});
