import { getZodiacSign, zodiacSigns } from '../src/shared/utils/zodiac';

describe('getZodiacSign', () => {
  it('returns aries for March 25', () => {
    expect(getZodiacSign(3, 25)).toBe('aries');
  });

  it('returns taurus for May 15', () => {
    expect(getZodiacSign(5, 15)).toBe('taurus');
  });

  it('returns capricorn for January 5', () => {
    expect(getZodiacSign(1, 5)).toBe('capricorn');
  });

  it('returns sagittarius for December 15', () => {
    expect(getZodiacSign(12, 15)).toBe('sagittarius');
  });

  it('returns capricorn for December 25', () => {
    expect(getZodiacSign(12, 25)).toBe('capricorn');
  });

  it('returns pisces for February 28', () => {
    expect(getZodiacSign(2, 28)).toBe('pisces');
  });

  it('handles boundary: March 21 is aries', () => {
    expect(getZodiacSign(3, 21)).toBe('aries');
  });

  it('handles boundary: March 20 is pisces', () => {
    expect(getZodiacSign(3, 20)).toBe('pisces');
  });
});

describe('zodiacSigns', () => {
  it('contains 12 signs', () => {
    expect(zodiacSigns).toHaveLength(12);
  });

  it('each sign has required fields', () => {
    for (const sign of zodiacSigns) {
      expect(sign).toHaveProperty('id');
      expect(sign).toHaveProperty('nameKey');
      expect(sign).toHaveProperty('symbol');
      expect(sign).toHaveProperty('startMonth');
      expect(sign).toHaveProperty('startDay');
      expect(sign).toHaveProperty('endMonth');
      expect(sign).toHaveProperty('endDay');
    }
  });
});
