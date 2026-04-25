import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { generateJSON, delay } from "./gemini";
import { buildHoroscopePrompt, ZODIAC_SIGNS } from "./prompts/horoscope";

type HoroscopeData = {
  general: string;
  love: string;
  work: string;
  luck: string;
  stars: { love: number; work: number; luck: number };
  luckyNumber: number;
  luckyColor: string;
  compatibility: string;
};

const getNextSevenDays = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

export const generateWeeklyHoroscopes = onSchedule(
  {
    schedule: "0 3 * * 0",
    timeZone: "Europe/Rome",
    memory: "512MiB",
    timeoutSeconds: 540,
  },
  async () => {
    const db = admin.firestore();
    const dates = getNextSevenDays();

    for (const sign of ZODIAC_SIGNS) {
      for (const date of dates) {
        try {
          const prompt = buildHoroscopePrompt(sign, date);
          const data = await generateJSON<HoroscopeData>(prompt);

          await db.doc(`horoscopes/${date}/signs/${sign}`).set(data);

          console.log(`Generated horoscope: ${date}/${sign}`);
          await delay(4500);
        } catch (error) {
          console.error(`Failed: ${date}/${sign}`, error);
        }
      }
    }

    console.log("Weekly horoscopes generation complete");
  }
);
