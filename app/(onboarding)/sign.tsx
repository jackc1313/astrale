import { useState } from 'react';
import { StyleSheet, View, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ScreenContainer, Title, Body, Button, ProgressBar } from '@shared/components';
import { colors, radius, spacing } from '@shared/theme';
import { getZodiacSign, getZodiacSignById, getZodiacIconName } from '@shared/utils/zodiac';
import { useOnboardingContext } from './_layout';

export default function SignScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { birthDate, setBirthDate, zodiacSign, setZodiacSign } = useOnboardingContext();
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const handleDateChange = (_: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (date) {
      setBirthDate(date);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      setZodiacSign(getZodiacSign(month, day));
    }
  };

  const formatDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

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
          {Platform.OS === 'android' && (
            <Pressable onPress={() => setShowPicker(true)} style={styles.dateButton}>
              <MaterialCommunityIcons name="calendar" size={22} color={colors.gold} />
              <Body style={styles.dateText}>{formatDate(birthDate)}</Body>
            </Pressable>
          )}
          {showPicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              minimumDate={new Date(1920, 0, 1)}
              onChange={handleDateChange}
              themeVariant="dark"
              style={Platform.OS === 'ios' ? styles.picker : undefined}
            />
          )}
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
  pickerWrapper: { alignItems: 'center', marginTop: spacing.lg, gap: spacing.md },
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.whiteOverlay, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.goldBorder },
  dateText: { fontSize: 18, color: colors.pearlWhite, fontFamily: 'PlayfairDisplay-Bold' },
  picker: { height: 150, width: '100%' },
  result: { alignItems: 'center', paddingTop: spacing['4xl'], paddingBottom: spacing['4xl'], gap: spacing.md },
  signEmoji: { fontSize: 48 },
  signName: { fontFamily: 'PlayfairDisplay-Bold', fontSize: 28, lineHeight: 40, color: colors.pearlWhite },
  footer: { marginTop: 'auto' },
});
