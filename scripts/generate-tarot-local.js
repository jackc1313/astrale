/**
 * One-shot script: generates tarot interpretations locally and uploads to Firestore.
 * Skips cards that already exist. Run once then delete.
 *
 * Usage: node scripts/generate-tarot-local.js
 *
 * Requires: GEMINI_API_KEY and Firebase service account credentials.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");

// --- Config ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Set GEMINI_API_KEY env var");
  process.exit(1);
}

// Init Firebase Admin with service account
const serviceAccount = require("../firebase-service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Init Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.9,
  },
});

const MAJOR_ARCANA = [
  "the_fool", "the_magician", "the_high_priestess", "the_empress",
  "the_emperor", "the_hierophant", "the_lovers", "the_chariot",
  "strength", "the_hermit", "wheel_of_fortune", "justice",
  "the_hanged_man", "death", "temperance", "the_devil",
  "the_tower", "the_star", "the_moon", "the_sun",
  "judgement", "the_world",
];

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer",
  "leo", "virgo", "libra", "scorpio",
  "sagittarius", "capricorn", "aquarius", "pisces",
];

const CARD_NAMES_IT = {
  the_fool: "Il Matto", the_magician: "Il Mago",
  the_high_priestess: "La Papessa", the_empress: "L'Imperatrice",
  the_emperor: "L'Imperatore", the_hierophant: "Il Papa",
  the_lovers: "Gli Amanti", the_chariot: "Il Carro",
  strength: "La Forza", the_hermit: "L'Eremita",
  wheel_of_fortune: "La Ruota della Fortuna", justice: "La Giustizia",
  the_hanged_man: "L'Appeso", death: "La Morte",
  temperance: "La Temperanza", the_devil: "Il Diavolo",
  the_tower: "La Torre", the_star: "La Stella",
  the_moon: "La Luna", the_sun: "Il Sole",
  judgement: "Il Giudizio", the_world: "Il Mondo",
};

const SIGN_NAMES_IT = {
  aries: "Ariete", taurus: "Toro", gemini: "Gemelli", cancer: "Cancro",
  leo: "Leone", virgo: "Vergine", libra: "Bilancia", scorpio: "Scorpione",
  sagittarius: "Sagittario", capricorn: "Capricorno", aquarius: "Acquario", pisces: "Pesci",
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateJSON(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (err) {
      console.warn(`  Retry ${i + 1}/${retries}: ${err.message?.slice(0, 80)}`);
      await delay(10000 * (i + 1)); // backoff: 10s, 20s, 30s
    }
  }
  throw new Error("Failed after retries");
}

async function main() {
  console.log("Starting tarot generation...\n");

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const cardId of MAJOR_ARCANA) {
    // Skip if exists
    const existing = await db.doc(`tarot_interpretations/${cardId}`).get();
    if (existing.exists) {
      console.log(`SKIP ${cardId} (already exists)`);
      skipped++;
      continue;
    }

    const cardName = CARD_NAMES_IT[cardId] || cardId;
    console.log(`Generating ${cardId} (${cardName})...`);

    try {
      // Base meaning
      const base = await generateJSON(`Sei un esperto di tarocchi. Genera il significato della carta "${cardName}".
REGOLE: Scrivi in italiano. Tono: mistico ma accessibile. Significato dritto: 30-50 parole. Significato rovesciato: 30-50 parole, mai catastrofico.
Rispondi SOLO con: {"name":"${cardName}","upright":"significato dritto","reversed":"significato rovesciato"}`);
      await delay(5000);

      // Contextual per sign
      const contextual = {};
      for (const sign of ZODIAC_SIGNS) {
        const signName = SIGN_NAMES_IT[sign];
        const ctx = await generateJSON(`Sei un esperto di tarocchi. Genera le interpretazioni della carta "${cardName}" per il segno ${signName}.
REGOLE: Scrivi in italiano. Tono: mistico ma accessibile, mai catastrofico. Ogni interpretazione: 40-60 parole, personalizzata per il segno.
Rispondi SOLO con: {"love":"interpretazione amore","work":"interpretazione lavoro","general":"interpretazione generale"}`);
        contextual[sign] = ctx;
        await delay(5000);
      }

      await db.doc(`tarot_interpretations/${cardId}`).set({ ...base, contextual });
      console.log(`  OK ${cardId}`);
      generated++;
    } catch (err) {
      console.error(`  FAILED ${cardId}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`);
  process.exit(0);
}

main();
