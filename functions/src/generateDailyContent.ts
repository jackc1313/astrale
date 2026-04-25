import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { generateJSON, delay } from "./gemini";
import { buildDailyContentPrompt } from "./prompts/dailyContent";

type DailyContentData = {
  wheel: string[];
  scratch: string[];
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

export const generateDailyContent = onSchedule(
  {
    schedule: "30 3 * * 0",
    timeZone: "Europe/Rome",
    memory: "256MiB",
    timeoutSeconds: 300,
  },
  async () => {
    const db = admin.firestore();
    const dates = getNextSevenDays();

    for (const date of dates) {
      try {
        const prompt = buildDailyContentPrompt(date);
        const data = await generateJSON<DailyContentData>(prompt);

        await db.doc(`daily_content/${date}`).set(data);

        console.log(`Generated daily content: ${date}`);
        await delay(4500);
      } catch (error) {
        console.error(`Failed daily content: ${date}`, error);
      }
    }

    console.log("Daily content generation complete");
  }
);
