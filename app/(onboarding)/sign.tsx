import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

import { ScreenContainer, Title, Body, Button, ProgressBar } from '@shared/components';
import { spacing } from '@shared/theme';
import { getZodiacSign, getZodiacSignById } from '@shared/utils/zodiac';
import { useOnboardingContext } from './_layout';

export default function SignScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { birthDate, setBirthDate, zodiacSign, setZodiacSign } = useOnboardingContext();
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (_: unknown, date?: Date) => {
    if (date) {
      setBirthDate(date);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      setZodiacSign(getZodiacSign(month, day));
    }
    setShowPicker(false);
  };

  const sign = zodiacSign ? getZodiacSignById(zodiacSign) : null;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <ProgressBar steps={4} currentStep={1} />
        <View style={styles.header}>
          <Title>{t('onboarding.sign.title')}</Title>
          <Body style={styles.subtitle}>{t('onboarding.sign.subtitle')}</Body>
        </View>
        <View style={styles.pickerButton}>
          <Button
            title={birthDate.toLocaleDateString('it-IT')}
            variant="ghost"
            onPress={() => setShowPicker(true)}
          />
        </View>
        {showPicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
            onChange={handleDateChange}
            themeVariant="dark"
          />
        )}
        {sign && (
          <View style={styles.result}>
            <Body style={styles.signSymbol}>{sign.symbol}</Body>
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
  header: { marginTop: spacing['3xl'], gap: spacing.sm },
  subtitle: { opacity: 0.6, fontSize: 11 },
  pickerButton: { marginTop: spacing.xl },
  result: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  signSymbol: { fontSize: 48 },
  signName: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 20 },
  footer: { marginTop: 'auto' },
});
