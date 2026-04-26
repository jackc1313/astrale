import { useCallback, useState } from 'react';

import { storageService } from '@services/storage';
import type { ReadingHistoryDay, ReadingEntry } from '../types';

export const useReadingHistory = () => {
  const [history] = useState<ReadingHistoryDay[]>(() => storageService.getReadingHistory());

  const getEntriesForDate = useCallback((date: string): ReadingEntry[] => {
    const day = history.find((d) => d.date === date);
    return day?.entries ?? [];
  }, [history]);

  const getDaysWithEntries = useCallback((month: number, year: number): Set<string> => {
    const days = new Set<string>();
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    for (const day of history) {
      if (day.date.startsWith(prefix)) {
        days.add(day.date);
      }
    }
    return days;
  }, [history]);

  return { history, getEntriesForDate, getDaysWithEntries };
};
