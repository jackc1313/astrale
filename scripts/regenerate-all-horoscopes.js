/**
 * Regenerate ALL horoscopes with health field.
 * Overwrites existing data. Usage: GEMINI_API_KEY=xxx node scripts/regenerate-all-horoscopes.js
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) { console.error("Set GEMINI_API_KEY"); process.exit(1); }

const sa = require("../firebase-service-account.json");
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro",
  generationConfig: { responseMimeType: "application/json", temperature: 0.9 },
});

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const SIGNS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
const SIGN_NAMES = {
  aries:"Ariete",taurus:"Toro",gemini:"Gemelli",cancer:"Cancro",leo:"Leone",virgo:"Vergine",
  libra:"Bilancia",scorpio:"Scorpione",sagittarius:"Sagittario",capricorn:"Capricorno",aquarius:"Acquario",pisces:"Pesci"
};

async function generateJSON(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (err) {
      console.warn(`  Retry ${i+1}/${retries}: ${err.message?.slice(0,80)}`);
      await delay(15000 * (i + 1));
    }
  }
  throw new Error("Failed after retries");
}

async function main() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }

  let generated = 0, failed = 0;

  for (const date of dates) {
    for (const sign of SIGNS) {
      console.log(`Generating ${date}/${sign}...`);
      try {
        const prompt = `Sei un astrologo esperto. Genera l'oroscopo giornaliero per il segno ${SIGN_NAMES[sign]} per il giorno ${date}.
REGOLE: Scrivi in italiano. Tono: positivo ma non banale, specifico, mai catastrofico. Ogni sezione: 50-80 parole. Stelle: 1-5. Numero fortunato: 1-99. Colore: in italiano. Compatibilita': segno in inglese lowercase.
Rispondi SOLO con: {"general":"...","love":"...","work":"...","health":"...","luck":"...","stars":{"love":4,"work":3,"health":4,"luck":5},"luckyNumber":7,"luckyColor":"blu","compatibility":"scorpio"}`;

        const data = await generateJSON(prompt);
        await db.doc(`horoscopes/${date}/signs/${sign}`).set(data);
        console.log(`  OK ${date}/${sign}`);
        generated++;
        await delay(5000);
      } catch (err) {
        console.error(`  FAILED ${date}/${sign}: ${err.message}`);
        failed++;
      }
    }
  }

  console.log(`\nDone. Generated: ${generated}, Failed: ${failed}`);
  process.exit(0);
}

main();
