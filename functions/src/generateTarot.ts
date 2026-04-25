import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { generateJSON, delay } from "./gemini";
import {
  buildTarotPrompt,
  buildTarotBasePrompt,
  MAJOR_ARCANA,
} from "./prompts/tarot";

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer",
  "leo", "virgo", "libra", "scorpio",
  "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

type TarotBase = {
  name: string;
  upright: string;
  reversed: string;
};

type TarotContextual = {
  love: string;
  work: string;
  general: string;
};

export const generateTarotInterpretations = onCall(
  {
    memory: "512MiB",
    timeoutSeconds: 540,
  },
  async () => {
    const db = admin.firestore();

    for (const cardId of MAJOR_ARCANA) {
      try {
        const basePrompt = buildTarotBasePrompt(cardId);
        const base = await generateJSON<TarotBase>(basePrompt);
        await delay(4500);

        const contextual: Record<string, TarotContextual> = {};

        for (const sign of ZODIAC_SIGNS) {
          const prompt = buildTarotPrompt(cardId, sign);
          const ctx = await generateJSON<TarotContextual>(prompt);
          contextual[sign] = ctx;
          await delay(4500);
        }

        await db.doc(`tarot_interpretations/${cardId}`).set({
          ...base,
          contextual,
        });

        console.log(`Generated tarot: ${cardId}`);
      } catch (error) {
        console.error(`Failed tarot: ${cardId}`, error);
      }
    }

    console.log("Tarot interpretations generation complete");
    return { success: true };
  }
);
