import { StyleSheet, View, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Body, Title } from '@shared/components';
import { colors, spacing } from '@shared/theme';
import type { NotificationSettings as NotificationSettingsType } from '../types';

type NotificationSettingsProps = {
  settings: NotificationSettingsType;
  onUpdate: (partial: Partial<NotificationSettingsType>) => void;
};

export const NotificationSettings = ({ settings, onUpdate }: NotificationSettingsProps) => {
  const { t } = useTranslation();

  const formatTime = (hour: number, minute: number): string =>
    `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return (
    <View>
      <Title style={styles.sectionTitle}>{t('profile.notifications')}</Title>

      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Body style={styles.label}>{t('profile.morning')}</Body>
          <Body style={styles.time}>{formatTime(settings.morningHour, settings.morningMinute)}</Body>
        </View>
        <Switch
          value={settings.morningEnabled}
          onValueChange={(v) => onUpdate({ morningEnabled: v })}
          trackColor={{ true: colors.gold, false: colors.whiteBorder }}
          thumbColor={colors.pearlWhite}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Body style={styles.label}>{t('profile.evening')}</Body>
          <Body style={styles.time}>{formatTime(settings.eveningHour, settings.eveningMinute)}</Body>
        </View>
        <Switch
          value={settings.eveningEnabled}
          onValueChange={(v) => onUpdate({ eveningEnabled: v })}
          trackColor={{ true: colors.gold, false: colors.whiteBorder }}
          thumbColor={colors.pearlWhite}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, marginBottom: spacing.md },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.whiteBorder,
  },
  labelRow: { gap: 2 },
  label: { fontSize: 14 },
  time: { fontSize: 11, color: colors.whiteDim },
});
