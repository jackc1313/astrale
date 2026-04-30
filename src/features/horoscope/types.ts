import type { ZodiacSignId } from "@shared/utils/zodiac";

export type Stars = {
  love: number;
  work: number;
  health: number;
  luck: number;
};

export type Horoscope = {
  general: string;
  love: string;
  work: string;
  health: string;
  luck: string;
  stars: Stars;
  luckyNumber: number;
  luckyColor: string;
  compatibility: ZodiacSignId;
};

export type HoroscopeSection = "love" | "work" | "health" | "luck";
