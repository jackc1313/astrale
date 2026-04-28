export type ZodiacSignId =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type ZodiacSign = {
  id: ZodiacSignId;
  nameKey: string;
  symbol: string;
  emoji: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
};

export const zodiacSigns: ZodiacSign[] = [
  { id: 'aries', nameKey: 'zodiac.aries', symbol: '\u2648', emoji: '\u2648', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { id: 'taurus', nameKey: 'zodiac.taurus', symbol: '\u2649', emoji: '\u2649', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { id: 'gemini', nameKey: 'zodiac.gemini', symbol: '\u264A', emoji: '\u264A', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { id: 'cancer', nameKey: 'zodiac.cancer', symbol: '\u264B', emoji: '\u264B', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { id: 'leo', nameKey: 'zodiac.leo', symbol: '\u264C', emoji: '\u264C', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { id: 'virgo', nameKey: 'zodiac.virgo', symbol: '\u264D', emoji: '\u264D', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { id: 'libra', nameKey: 'zodiac.libra', symbol: '\u264E', emoji: '\u264E', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { id: 'scorpio', nameKey: 'zodiac.scorpio', symbol: '\u264F', emoji: '\u264F', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { id: 'sagittarius', nameKey: 'zodiac.sagittarius', symbol: '\u2650', emoji: '\u2650', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { id: 'capricorn', nameKey: 'zodiac.capricorn', symbol: '\u2651', emoji: '\u2651', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { id: 'aquarius', nameKey: 'zodiac.aquarius', symbol: '\u2652', emoji: '\u2652', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { id: 'pisces', nameKey: 'zodiac.pisces', symbol: '\u2653', emoji: '\u2653', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
];

export const getZodiacSign = (month: number, day: number): ZodiacSignId => {
  const sign = zodiacSigns.find((s) => {
    if (s.startMonth === s.endMonth) {
      return month === s.startMonth && day >= s.startDay && day <= s.endDay;
    }
    if (s.startMonth > s.endMonth) {
      return (
        (month === s.startMonth && day >= s.startDay) ||
        (month === s.endMonth && day <= s.endDay)
      );
    }
    return (
      (month === s.startMonth && day >= s.startDay) ||
      (month === s.endMonth && day <= s.endDay)
    );
  });
  return sign?.id ?? 'aries';
};

export const getZodiacSignById = (id: ZodiacSignId): ZodiacSign => {
  return zodiacSigns.find((s) => s.id === id)!;
};

export const getZodiacSignFromDate = (dateString: string): ZodiacSignId => {
  const date = new Date(dateString);
  return getZodiacSign(date.getMonth() + 1, date.getDate());
};
