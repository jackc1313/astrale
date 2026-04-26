export type ReadingEntry = {
  type: "horoscope" | "tarot" | "wheel" | "scratch";
  summary: string;
  timestamp: string;
};

export type ReadingHistoryDay = {
  date: string;
  entries: ReadingEntry[];
};

export type NotificationSettings = {
  morningEnabled: boolean;
  morningHour: number;
  morningMinute: number;
  eveningEnabled: boolean;
  eveningHour: number;
  eveningMinute: number;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  morningEnabled: true,
  morningHour: 8,
  morningMinute: 0,
  eveningEnabled: false,
  eveningHour: 20,
  eveningMinute: 0,
};

export type BadgeId = "7_days" | "30_days" | "100_days" | "all_arcana";

export type BadgeInfo = {
  id: BadgeId;
  nameKey: string;
  icon: string;
  current: number;
  total: number;
  earned: boolean;
};
