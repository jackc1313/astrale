/**
 * Generate weekly horoscopes + daily content and write to Firestore.
 * Runs locally or in GitHub Actions.
 *
 * Usage:
 *   GEMINI_API_KEY=xxx node scripts/generate-weekly-content.js
 *
 * For GitHub Actions, FIREBASE_SERVICE_ACCOUNT env var contains the JSON string.
 * For local runs, it reads firebase-service-account.json from the project root.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
const path = require("path");

// --- Config ---

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is required");
  process.exit(1);
}

// Firebase init: support both local file and env var (GitHub Actions)
if (!admin.apps.length) {
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(sa);
  } else {
    const saPath = path.join(__dirname, "..", "firebase-service-account.json");
    const sa = require(saPath);
    credential = admin.credential.cert(sa);
  }
  admin.initializeApp({ credential });
}

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json", temperature: 0.9 },
});

// --- Helpers ---

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const SIGNS = [
  "aries", "taurus", "gemini", "cancer",
  "leo", "virgo", "libra", "scorpio",
  "sagittarius", "capricorn", "aquarius", "pisces",
];

const SIGN_NAMES = {
  aries: "Ariete", taurus: "Toro", gemini: "Gemelli", cancer: "Cancro",
  leo: "Leone", virgo: "Vergine", libra: "Bilancia", scorpio: "Scorpione",
  sagittarius: "Sagittario", capricorn: "Capricorno", aquarius: "Acquario", pisces: "Pesci",
};

const DAYS_AHEAD = parseInt(process.env.DAYS_AHEAD ?? "2", 10);

const getUpcomingDays = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

async function generateJSON(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (err) {
      const isRateLimit = err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("Resource has been exhausted");
      const waitTime = isRateLimit ? 60000 : 10000 * (i + 1);
      console.warn(`  Retry ${i + 1}/${retries} (wait ${waitTime / 1000}s): ${err.message?.slice(0, 100)}`);
      await delay(waitTime);
    }
  }
  throw new Error("Failed after retries");
}

// --- Prompts ---

function buildHoroscopePrompt(sign, date) {
  const signName = SIGN_NAMES[sign];
  return `Sei un astrologo esperto. Genera l'oroscopo giornaliero per il segno ${signName} per il giorno ${date}.

REGOLE:
- Scrivi in italiano
- Tono: positivo ma non banale, specifico, mai catastrofico
- Ogni sezione deve essere 50-80 parole
- Le stelle vanno da 1 a 5
- Il numero fortunato e' tra 1 e 99
- Il colore fortunato e' un colore in italiano
- La compatibilita' e' un segno zodiacale (in inglese lowercase: aries, taurus, etc.)

Rispondi SOLO con questo JSON:
{
  "general": "testo oroscopo generale",
  "love": "testo oroscopo amore",
  "work": "testo oroscopo lavoro",
  "health": "testo oroscopo salute e benessere",
  "luck": "testo oroscopo fortuna",
  "stars": { "love": 4, "work": 3, "health": 4, "luck": 5 },
  "luckyNumber": 7,
  "luckyColor": "blu",
  "compatibility": "scorpio"
}`;
}

function buildDailyContentPrompt(date) {
  return `Sei un coach spirituale positivo. Genera contenuti giornalieri per il giorno ${date}.

REGOLE:
- Scrivi in italiano
- Tono: positivo, motivante, leggero
- Affermazioni ruota: brevi (5-10 parole), varie (affermazioni, consigli, sfide, numeri fortunati)
- Frasi gratta: piu' lunghe (15-25 parole), personali e misteriose

Rispondi SOLO con questo JSON:
{
  "wheel": [
    "affermazione 1",
    "affermazione 2",
    "affermazione 3",
    "affermazione 4",
    "affermazione 5",
    "affermazione 6",
    "affermazione 7",
    "affermazione 8",
    "affermazione 9",
    "affermazione 10"
  ],
  "scratch": [
    "frase misteriosa 1",
    "frase misteriosa 2",
    "frase misteriosa 3",
    "frase misteriosa 4",
    "frase misteriosa 5"
  ]
}`;
}

// --- Main ---

async function generateHoroscopes(dates) {
  let generated = 0;
  let failed = 0;

  for (const date of dates) {
    for (const sign of SIGNS) {
      try {
        const existing = await db.doc(`horoscopes/${date}/signs/${sign}`).get();
        if (existing.exists) {
          console.log(`  Skip ${date}/${sign} (exists)`);
          continue;
        }

        const prompt = buildHoroscopePrompt(sign, date);
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

  return { generated, failed };
}

async function generateDailyContent(dates) {
  let generated = 0;
  let failed = 0;

  for (const date of dates) {
    try {
      const existing = await db.doc(`daily_content/${date}`).get();
      if (existing.exists) {
        console.log(`  Skip daily_content/${date} (exists)`);
        continue;
      }

      const prompt = buildDailyContentPrompt(date);
      const data = await generateJSON(prompt);
      await db.doc(`daily_content/${date}`).set(data);
      console.log(`  OK daily_content/${date}`);
      generated++;
      await delay(4500);
    } catch (err) {
      console.error(`  FAILED daily_content/${date}: ${err.message}`);
      failed++;
    }
  }

  return { generated, failed };
}

async function main() {
  const dates = getUpcomingDays();
  console.log(`\nGenerating content for: ${dates.join(", ")}\n`);

  console.log("=== Horoscopes ===");
  const horoscopes = await generateHoroscopes(dates);

  console.log("\n=== Daily Content ===");
  const daily = await generateDailyContent(dates);

  console.log("\n=== Summary ===");
  console.log(`Horoscopes - Generated: ${horoscopes.generated}, Failed: ${horoscopes.failed}`);
  console.log(`Daily Content - Generated: ${daily.generated}, Failed: ${daily.failed}`);

  const totalFailed = horoscopes.failed + daily.failed;
  const totalGenerated = horoscopes.generated + daily.generated;

  if (totalGenerated === 0 && totalFailed > 0) {
    console.error("All generations failed!");
    process.exit(1);
  }

  if (totalFailed > 0) {
    console.warn(`${totalFailed} items failed - will be retried on next run`);
  }

  process.exit(0);
}

main();
