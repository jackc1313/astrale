import { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Body, Title } from '@shared/components';
import { colors, radius, spacing } from '@shared/theme';

type ReadingCalendarProps = {
  daysWithEntries: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  maxDaysBack: number;
};

const WEEKDAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

const getMonthDays = (year: number, month: number): (number | null)[] => {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  return cells;
};

const formatDate = (year: number, month: number, day: number): string =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const ReadingCalendar = ({
  daysWithEntries,
  selectedDate,
  onSelectDate,
  maxDaysBack,
}: ReadingCalendarProps) => {
  const { t } = useTranslation();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const days = getMonthDays(viewYear, viewMonth);
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxDaysBack);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else { setViewMonth(viewMonth - 1); }
  };

  const goForward = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else { setViewMonth(viewMonth + 1); }
  };

  return (
    <View>
      <Title style={styles.sectionTitle}>{t('profile.history')}</Title>

      <View style={styles.header}>
        <Pressable onPress={goBack}><Body style={styles.arrow}>{'<'}</Body></Pressable>
        <Body style={styles.monthName}>{monthName}</Body>
        <Pressable onPress={goForward}><Body style={styles.arrow}>{'>'}</Body></Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <Body key={i} style={styles.weekday}>{d}</Body>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day, i) => {
          if (day === null) return <View key={`e-${i}`} style={styles.cell} />;

          const dateStr = formatDate(viewYear, viewMonth, day);
          const hasEntry = daysWithEntries.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isFuture = dateStr > todayStr;
          const isOutOfRange = dateStr < cutoffStr;
          const disabled = isFuture || isOutOfRange;

          return (
            <Pressable
              key={dateStr}
              onPress={() => !disabled && onSelectDate(dateStr)}
              style={[styles.cell, isSelected && styles.cellSelected]}
            >
              <Body style={[styles.dayText, disabled && styles.dayDisabled]}>{day}</Body>
              {hasEntry && <View style={styles.dot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  arrow: { color: colors.gold, fontSize: 18, paddingHorizontal: spacing.md },
  monthName: { fontSize: 14, fontFamily: 'Inter-Medium', color: colors.pearlWhite, textTransform: 'capitalize' },
  weekRow: { flexDirection: 'row', marginBottom: spacing.xs },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, color: colors.whiteDim, fontFamily: 'Inter-Medium' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  cellSelected: { backgroundColor: colors.goldMuted },
  dayText: { fontSize: 13, color: colors.pearlWhite },
  dayDisabled: { opacity: 0.25 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.gold, marginTop: 2 },
});
