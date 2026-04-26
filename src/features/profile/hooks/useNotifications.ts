import { useState, useCallback } from 'react';

import { storageService } from '@services/storage';
import { rescheduleAll } from '@services/notifications';
import type { NotificationSettings } from '../types';

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(
    () => storageService.getNotificationSettings(),
  );

  const updateSettings = useCallback(async (partial: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    storageService.setNotificationSettings(updated);
    await rescheduleAll(updated);
  }, [settings]);

  return { settings, updateSettings };
};
