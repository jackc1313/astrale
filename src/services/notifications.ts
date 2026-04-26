import * as Notifications from 'expo-notifications';

import i18n from '@i18n/index';
import type { NotificationSettings } from '@features/profile/types';

type NotificationType = 'morning' | 'evening' | 'streak';

const IDENTIFIERS: Record<NotificationType, string> = {
  morning: 'astrale-morning',
  evening: 'astrale-evening',
  streak: 'astrale-streak',
};

export const scheduleNotification = async (
  type: NotificationType,
  hour: number,
  minute: number,
): Promise<void> => {
  await cancelNotification(type);

  const contentMap: Record<NotificationType, { title: string; body: string }> = {
    morning: {
      title: 'Astrale',
      body: i18n.t('notifications.morning'),
    },
    evening: {
      title: 'Astrale',
      body: i18n.t('notifications.evening'),
    },
    streak: {
      title: 'Astrale',
      body: i18n.t('notifications.streak', { count: '' }),
    },
  };

  await Notifications.scheduleNotificationAsync({
    identifier: IDENTIFIERS[type],
    content: contentMap[type],
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};

export const cancelNotification = async (type: NotificationType): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(IDENTIFIERS[type]);
};

export const rescheduleAll = async (settings: NotificationSettings): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (settings.morningEnabled) {
    await scheduleNotification('morning', settings.morningHour, settings.morningMinute);
  }

  if (settings.eveningEnabled) {
    await scheduleNotification('evening', settings.eveningHour, settings.eveningMinute);
  }

  await scheduleNotification('streak', 21, 0);
};
