# Astrale Fase 2A — Backend & Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Firebase Cloud Functions for AI content generation (Gemini API), AdMob rewarded ad service, and the complete Home screen with horoscope display and ad-gated sections.

**Architecture:** Firebase Cloud Functions (Node.js) generate horoscope/tarot/daily content via Gemini API and write to Firestore on a weekly schedule. The app reads from Firestore with MMKV caching. Rewarded ads gate premium content sections. All ads use test IDs during development.

**Tech Stack:** Firebase Functions v2, @google/generative-ai (Gemini), firebase-admin, react-native-google-mobile-ads, expo-haptics, Firestore

---

## File Map

### Cloud Functions (new project)

| Path | Responsibility |
|------|---------------|
| `functions/package.json` | Functions dependencies |
| `functions/tsconfig.json` | TypeScript config |
| `functions/src/index.ts` | Entry point, exports all functions |
| `functions/src/gemini.ts` | Gemini API client wrapper |
| `functions/src/prompts/horoscope.ts` | Horoscope prompt template |
| `functions/src/prompts/tarot.ts` | Tarot prompt template |
| `functions/src/prompts/dailyContent.ts` | Daily content prompt template |
| `functions/src/generateHoroscopes.ts` | Weekly horoscope generation |
| `functions/src/generateDailyContent.ts` | Weekly daily content generation |
| `functions/src/generateTarot.ts` | One-shot tarot interpretation generation |
| `firebase.json` | Firebase project config |
| `firestore.rules` | Security rules |
| `.firebaserc` | Firebase project alias |

### App (new + modified files)

| Path | Responsibility |
|------|---------------|
| `src/services/ads.ts` | AdMob rewarded ad hook |
| `src/features/horoscope/types.ts` | Horoscope data types |
| `src/features/horoscope/hooks/useHoroscope.ts` | Fetch + cache horoscope |
| `src/features/horoscope/hooks/index.ts` | Barrel export |
| `src/features/horoscope/components/HoroscopeCard.tsx` | General horoscope card |
| `src/features/horoscope/components/LuckyBadges.tsx` | Lucky number + color |
| `src/features/horoscope/components/StarsIndicator.tsx` | Stars 1-5 with lock |
| `src/features/horoscope/components/DetailSection.tsx` | Detail section with lock |
| `src/features/horoscope/components/AffinityCard.tsx` | Affinity card with lock |
| `src/features/horoscope/components/index.ts` | Barrel export |
| `src/i18n/locales/it.json` | Updated Italian translations |
| `app/(tabs)/index.tsx` | Home screen (full rewrite) |

---

## Task 1: Firebase Functions Project Setup

**Files:**
- Create: `functions/package.json`
- Create: `functions/tsconfig.json`
- Create: `functions/.gitignore`
- Create: `firebase.json`
- Create: `.firebaserc`
- Create: `firestore.rules`

- [ ] **Step 1: Create functions/package.json**

```json
{
  "name": "astrale-functions",
  "private": true,
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions"
  },
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "firebase-admin": "^13.0.0",
    "firebase-functions": "^6.3.0",
    "@google/generative-ai": "^0.24.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "firebase-functions-test": "^3.4.0"
  }
}
```

- [ ] **Step 2: Create functions/tsconfig.json**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2022",
    "skipLibCheck": true
  },
  "compileOnSave": true,
  "include": ["src"]
}
```

- [ ] **Step 3: Create functions/.gitignore**

```
lib/
node_modules/
```

- [ ] **Step 4: Create firebase.json**

```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs20",
    "predeploy": ["npm --prefix functions run build"]
  },
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

- [ ] **Step 5: Create .firebaserc**

```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID"
  }
}
```

- [ ] **Step 6: Create firestore.rules**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /horoscopes/{date}/signs/{sign} {
      allow read: if true;
      allow write: if false;
    }
    match /tarot_interpretations/{cardId} {
      allow read: if true;
      allow write: if false;
    }
    match /daily_content/{date} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

- [ ] **Step 7: Install functions dependencies**

```bash
cd functions && npm install && cd ..
```

- [ ] **Step 8: Commit**

```bash
git add functions/ firebase.json .firebaserc firestore.rules
git commit -m "feat: scaffold Firebase Functions project with Firestore rules"
```

---

## Task 2: Gemini API Client & Prompt Templates

**Files:**
- Create: `functions/src/gemini.ts`
- Create: `functions/src/prompts/horoscope.ts`
- Create: `functions/src/prompts/tarot.ts`
- Create: `functions/src/prompts/dailyContent.ts`

- [ ] **Step 1: Create Gemini API wrapper**

`functions/src/gemini.ts`:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { defineString } from "firebase-functions/params";

const geminiApiKey = defineString("GEMINI_API_KEY");

let genAI: GoogleGenerativeAI | null = null;

const getClient = (): GoogleGenerativeAI => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(geminiApiKey.value());
  }
  return genAI;
};

export const generateJSON = async <T>(prompt: string): Promise<T> => {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.9,
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as T;
};

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
```

- [ ] **Step 2: Create horoscope prompt template**

`functions/src/prompts/horoscope.ts`:

```typescript
const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer",
  "leo", "virgo", "libra", "scorpio",
  "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

const SIGN_NAMES_IT: Record<string, string> = {
  aries: "Ariete", taurus: "Toro", gemini: "Gemelli", cancer: "Cancro",
  leo: "Leone", virgo: "Vergine", libra: "Bilancia", scorpio: "Scorpione",
  sagittarius: "Sagittario", capricorn: "Capricorno", aquarius: "Acquario", pisces: "Pesci",
};

export const buildHoroscopePrompt = (sign: string, date: string): string => {
  const signName = SIGN_NAMES_IT[sign] ?? sign;

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
  "luck": "testo oroscopo fortuna",
  "stars": { "love": 4, "work": 3, "luck": 5 },
  "luckyNumber": 7,
  "luckyColor": "blu",
  "compatibility": "scorpio"
}`;
};

export { ZODIAC_SIGNS };
```

- [ ] **Step 3: Create tarot prompt template**

`functions/src/prompts/tarot.ts`:

```typescript
const MAJOR_ARCANA = [
  "the_fool", "the_magician", "the_high_priestess", "the_empress",
  "the_emperor", "the_hierophant", "the_lovers", "the_chariot",
  "strength", "the_hermit", "wheel_of_fortune", "justice",
  "the_hanged_man", "death", "temperance", "the_devil",
  "the_tower", "the_star", "the_moon", "the_sun",
  "judgement", "the_world",
] as const;

const CARD_NAMES_IT: Record<string, string> = {
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

const SIGN_NAMES_IT: Record<string, string> = {
  aries: "Ariete", taurus: "Toro", gemini: "Gemelli", cancer: "Cancro",
  leo: "Leone", virgo: "Vergine", libra: "Bilancia", scorpio: "Scorpione",
  sagittarius: "Sagittario", capricorn: "Capricorno", aquarius: "Acquario", pisces: "Pesci",
};

export const buildTarotPrompt = (cardId: string, sign: string): string => {
  const cardName = CARD_NAMES_IT[cardId] ?? cardId;
  const signName = SIGN_NAMES_IT[sign] ?? sign;

  return `Sei un esperto di tarocchi. Genera le interpretazioni della carta "${cardName}" per il segno ${signName}.

REGOLE:
- Scrivi in italiano
- Tono: mistico ma accessibile, mai catastrofico
- Ogni interpretazione deve essere 40-60 parole
- Le interpretazioni devono essere personalizzate per il segno

Rispondi SOLO con questo JSON:
{
  "love": "interpretazione per amore",
  "work": "interpretazione per lavoro",
  "general": "interpretazione generale"
}`;
};

export const buildTarotBasePrompt = (cardId: string): string => {
  const cardName = CARD_NAMES_IT[cardId] ?? cardId;

  return `Sei un esperto di tarocchi. Genera il significato della carta "${cardName}".

REGOLE:
- Scrivi in italiano
- Tono: mistico ma accessibile
- Significato dritto: 30-50 parole, positivo/costruttivo
- Significato rovesciato: 30-50 parole, sfida/attenzione (mai catastrofico)

Rispondi SOLO con questo JSON:
{
  "name": "${cardName}",
  "upright": "significato dritto",
  "reversed": "significato rovesciato"
}`;
};

export { MAJOR_ARCANA, CARD_NAMES_IT };
```

- [ ] **Step 4: Create daily content prompt template**

`functions/src/prompts/dailyContent.ts`:

```typescript
export const buildDailyContentPrompt = (date: string): string => {
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
};
```

- [ ] **Step 5: Commit**

```bash
git add functions/src/gemini.ts functions/src/prompts/
git commit -m "feat: add Gemini API client and prompt templates"
```

---

## Task 3: generateWeeklyHoroscopes Cloud Function

**Files:**
- Create: `functions/src/generateHoroscopes.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Create horoscope generation function**

`functions/src/generateHoroscopes.ts`:

```typescript
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
```

Firestore path: `horoscopes/{date}/signs/{sign}` (subcollection pattern).

- [ ] **Step 2: Create index.ts entry point**

`functions/src/index.ts`:

```typescript
import * as admin from "firebase-admin";

admin.initializeApp();

export { generateWeeklyHoroscopes } from "./generateHoroscopes";
export { generateDailyContent } from "./generateDailyContent";
export { generateTarotInterpretations } from "./generateTarot";
```

Note: `generateDailyContent` and `generateTarot` don't exist yet — they'll be created in Tasks 4 and 5. The imports will cause build errors until then. This is intentional — the implementer should create placeholder exports or comment them out until ready.

Alternatively, only export what exists:

```typescript
import * as admin from "firebase-admin";

admin.initializeApp();

export { generateWeeklyHoroscopes } from "./generateHoroscopes";
```

And update in subsequent tasks.

- [ ] **Step 3: Commit**

```bash
git add functions/src/generateHoroscopes.ts functions/src/index.ts
git commit -m "feat: add generateWeeklyHoroscopes Cloud Function"
```

---

## Task 4: generateDailyContent Cloud Function

**Files:**
- Create: `functions/src/generateDailyContent.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Create daily content generation function**

`functions/src/generateDailyContent.ts`:

```typescript
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
```

- [ ] **Step 2: Add export to index.ts**

Add to `functions/src/index.ts`:

```typescript
export { generateDailyContent } from "./generateDailyContent";
```

- [ ] **Step 3: Commit**

```bash
git add functions/src/generateDailyContent.ts functions/src/index.ts
git commit -m "feat: add generateDailyContent Cloud Function"
```

---

## Task 5: generateTarotInterpretations Cloud Function

**Files:**
- Create: `functions/src/generateTarot.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: Create tarot generation function**

`functions/src/generateTarot.ts`:

```typescript
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
```

- [ ] **Step 2: Add export to index.ts**

Add to `functions/src/index.ts`:

```typescript
export { generateTarotInterpretations } from "./generateTarot";
```

- [ ] **Step 3: Build and verify**

```bash
cd functions && npm run build && cd ..
```

Expected: compiles without errors.

- [ ] **Step 4: Commit**

```bash
git add functions/src/
git commit -m "feat: add generateTarotInterpretations Cloud Function"
```

---

## Task 6: App Dependencies & i18n Updates

**Files:**
- Modify: `package.json` (new deps)
- Modify: `src/i18n/locales/it.json` (new keys)
- Modify: `src/services/index.ts` (ads export)

- [ ] **Step 1: Install new app dependencies**

```bash
npx expo install @shopify/react-native-skia expo-haptics
npm install react-native-google-mobile-ads --legacy-peer-deps
```

- [ ] **Step 2: Update it.json with Fase 2 translations**

Add the following keys to `src/i18n/locales/it.json` (merge with existing):

```json
{
  "horoscope": {
    "general": "Generale",
    "love": "Amore",
    "work": "Lavoro",
    "luck": "Fortuna",
    "luckyNumber": "Numero fortunato",
    "luckyColor": "Colore del giorno",
    "affinity": "Affinita' del giorno",
    "affinityDesc": "Il segno piu' compatibile con te oggi",
    "stars": "Indicatori"
  },
  "ads": {
    "watchToUnlock": "Guarda un video per sbloccare",
    "unlockWithPremium": "Sblocca con Astrale Plus"
  },
  "tarot": {
    "cardOfDay": "Carta del giorno",
    "pastPresentFuture": "Passato/Presente/Futuro",
    "loveReading": "Lettura dell'amore",
    "past": "Passato",
    "present": "Presente",
    "future": "Futuro",
    "you": "Tu",
    "partner": "Partner",
    "relationship": "Relazione",
    "upright": "Dritto",
    "reversed": "Rovesciato",
    "drawCard": "Pesca una carta",
    "alreadyDrawn": "Hai gia' pescato la carta di oggi",
    "cards": {
      "the_fool": "Il Matto",
      "the_magician": "Il Mago",
      "the_high_priestess": "La Papessa",
      "the_empress": "L'Imperatrice",
      "the_emperor": "L'Imperatore",
      "the_hierophant": "Il Papa",
      "the_lovers": "Gli Amanti",
      "the_chariot": "Il Carro",
      "strength": "La Forza",
      "the_hermit": "L'Eremita",
      "wheel_of_fortune": "La Ruota della Fortuna",
      "justice": "La Giustizia",
      "the_hanged_man": "L'Appeso",
      "death": "La Morte",
      "temperance": "La Temperanza",
      "the_devil": "Il Diavolo",
      "the_tower": "La Torre",
      "the_star": "La Stella",
      "the_moon": "La Luna",
      "the_sun": "Il Sole",
      "judgement": "Il Giudizio",
      "the_world": "Il Mondo"
    },
    "meanings": {
      "the_fool_upright": "Nuovi inizi, spontaneita', liberta' di spirito e fiducia nel viaggio che ti attende",
      "the_fool_reversed": "Imprudenza, rischio non calcolato, paura di fare il primo passo",
      "the_magician_upright": "Potere personale, abilita' e risorse a tua disposizione, manifestazione",
      "the_magician_reversed": "Talenti sprecati, manipolazione, mancanza di direzione",
      "the_high_priestess_upright": "Intuizione, saggezza interiore, misteri che si svelano",
      "the_high_priestess_reversed": "Segreti nascosti, disconnessione dall'intuito",
      "the_empress_upright": "Abbondanza, fertilita', creativita' e nutrimento",
      "the_empress_reversed": "Blocco creativo, dipendenza, trascuratezza verso se stessi",
      "the_emperor_upright": "Autorita', struttura, stabilita' e controllo",
      "the_emperor_reversed": "Rigidita', eccesso di controllo, tirannia",
      "the_hierophant_upright": "Tradizione, guida spirituale, conformita' positiva",
      "the_hierophant_reversed": "Ribellione, anticonformismo, sfida alle regole",
      "the_lovers_upright": "Amore, armonia, scelte importanti del cuore",
      "the_lovers_reversed": "Disarmonia, scelte difficili, conflitto interiore",
      "the_chariot_upright": "Determinazione, vittoria, controllo delle emozioni",
      "the_chariot_reversed": "Mancanza di direzione, aggressivita', sconfitta",
      "strength_upright": "Coraggio interiore, pazienza, forza dolce",
      "strength_reversed": "Insicurezza, debolezza, dubbio su se stessi",
      "the_hermit_upright": "Introspezione, ricerca interiore, saggezza",
      "the_hermit_reversed": "Isolamento eccessivo, solitudine, rifiuto del mondo",
      "wheel_of_fortune_upright": "Cambiamento positivo, destino, cicli della vita",
      "wheel_of_fortune_reversed": "Sfortuna temporanea, resistenza al cambiamento",
      "justice_upright": "Equilibrio, verita', conseguenze giuste",
      "justice_reversed": "Ingiustizia, disonesta', squilibrio",
      "the_hanged_man_upright": "Sacrificio, nuova prospettiva, attesa consapevole",
      "the_hanged_man_reversed": "Stallo, resistenza, sacrificio inutile",
      "death_upright": "Trasformazione, fine di un ciclo, rinascita",
      "death_reversed": "Resistenza al cambiamento, paura della trasformazione",
      "temperance_upright": "Equilibrio, moderazione, pazienza, armonia",
      "temperance_reversed": "Eccesso, impazienza, squilibrio",
      "the_devil_upright": "Tentazione, attaccamento, ombre da affrontare",
      "the_devil_reversed": "Liberazione, rottura delle catene, consapevolezza",
      "the_tower_upright": "Cambiamento improvviso, rivelazione, crollo necessario",
      "the_tower_reversed": "Paura del cambiamento, evitare il necessario",
      "the_star_upright": "Speranza, ispirazione, serenita' e rinnovamento",
      "the_star_reversed": "Scoraggiamento, perdita di fede, disconnessione",
      "the_moon_upright": "Illusione, intuizione profonda, sogni e misteri",
      "the_moon_reversed": "Confusione, paure irrazionali, inganno",
      "the_sun_upright": "Gioia, successo, vitalita' e ottimismo",
      "the_sun_reversed": "Ottimismo eccessivo, temporanea tristezza",
      "judgement_upright": "Rinascita, chiamata interiore, valutazione onesta",
      "judgement_reversed": "Autocritica eccessiva, rifiuto della chiamata",
      "the_world_upright": "Completamento, realizzazione, successo pieno",
      "the_world_reversed": "Incompletezza, mancanza di chiusura, ritardo"
    }
  },
  "discover": {
    "wheel": {
      "title": "Ruota della Fortuna",
      "spin": "Gira la ruota",
      "spinAgain": "Gira ancora",
      "unlockSpin": "Guarda un video per girare",
      "alreadySpun": "Hai gia' girato oggi"
    },
    "scratch": {
      "title": "Gratta e Scopri",
      "choose": "Scegli una carta",
      "scratchIt": "Gratta per scoprire",
      "scratchAgain": "Gratta ancora",
      "alreadyScratched": "Hai gia' grattato oggi"
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json src/i18n/locales/it.json
git commit -m "feat: add Fase 2 dependencies and Italian translations"
```

---

## Task 7: Horoscope Types & useHoroscope Hook

**Files:**
- Create: `src/features/horoscope/types.ts`
- Create: `src/features/horoscope/hooks/useHoroscope.ts`
- Create: `src/features/horoscope/hooks/index.ts`

- [ ] **Step 1: Create horoscope types**

`src/features/horoscope/types.ts`:

```typescript
import type { ZodiacSignId } from "@shared/utils/zodiac";

export type Stars = {
  love: number;
  work: number;
  luck: number;
};

export type Horoscope = {
  general: string;
  love: string;
  work: string;
  luck: string;
  stars: Stars;
  luckyNumber: number;
  luckyColor: string;
  compatibility: ZodiacSignId;
};

export type HoroscopeSection = "love" | "work" | "luck";
```

- [ ] **Step 2: Create useHoroscope hook**

`src/features/horoscope/hooks/useHoroscope.ts`:

```typescript
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@services/firebase";
import { storage } from "@services/storage";
import { storageService } from "@services/storage";
import type { Horoscope } from "../types";

const today = (): string => new Date().toISOString().split("T")[0];

const CACHE_KEY_PREFIX = "horoscope.cache";

const getCacheKey = (date: string, sign: string): string =>
  `${CACHE_KEY_PREFIX}.${date}.${sign}`;

export const useHoroscope = () => {
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHoroscope = async () => {
      const profile = storageService.getUserProfile();
      if (!profile) {
        setIsLoading(false);
        return;
      }

      const date = today();
      const sign = profile.zodiacSign;
      const cacheKey = getCacheKey(date, sign);

      const cached = storage.getString(cacheKey);
      if (cached) {
        setHoroscope(JSON.parse(cached) as Horoscope);
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "horoscopes", date, "signs", sign);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data() as Horoscope;
          storage.set(cacheKey, JSON.stringify(data));
          setHoroscope(data);
        } else {
          setError("Horoscope not available");
        }
      } catch (err) {
        setError("Failed to load horoscope");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHoroscope();
  }, []);

  return { horoscope, isLoading, error };
};
```

- [ ] **Step 3: Create barrel export**

`src/features/horoscope/hooks/index.ts`:

```typescript
export { useHoroscope } from "./useHoroscope";
```

- [ ] **Step 4: Commit**

```bash
git add src/features/horoscope/
git commit -m "feat: add horoscope types and useHoroscope hook with Firestore fetch"
```

---

## Task 8: AdMob Rewarded Ad Service

**Files:**
- Create: `src/services/ads.ts`
- Modify: `src/services/index.ts`

- [ ] **Step 1: Create ads service**

`src/services/ads.ts`:

```typescript
import { useCallback, useEffect, useState } from "react";
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

const REWARDED_AD_UNIT_ID = TestIds.REWARDED;

export const useRewardedAd = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [adInstance, setAdInstance] = useState<RewardedAd | null>(null);

  const loadAd = useCallback(() => {
    const ad = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);

    const unsubLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setIsLoaded(true);
      }
    );

    const unsubEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {}
    );

    ad.load();
    setAdInstance(ad);

    return () => {
      unsubLoaded();
      unsubEarned();
    };
  }, []);

  useEffect(() => {
    const cleanup = loadAd();
    return cleanup;
  }, [loadAd]);

  const showAd = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!adInstance || !isLoaded) {
        resolve(false);
        return;
      }

      const unsubEarned = adInstance.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          unsubEarned();
          setIsLoaded(false);
          loadAd();
          resolve(true);
        }
      );

      adInstance.show().catch(() => {
        unsubEarned();
        resolve(false);
      });
    });
  };

  return { isLoaded, showAd };
};
```

- [ ] **Step 2: Update services barrel**

Add to `src/services/index.ts`:

```typescript
export { useRewardedAd } from './ads';
```

- [ ] **Step 3: Commit**

```bash
git add src/services/ads.ts src/services/index.ts
git commit -m "feat: add useRewardedAd hook for AdMob integration"
```

---

## Task 9: Home Screen Components — HoroscopeCard, LuckyBadges, StarsIndicator

**Files:**
- Create: `src/features/horoscope/components/HoroscopeCard.tsx`
- Create: `src/features/horoscope/components/LuckyBadges.tsx`
- Create: `src/features/horoscope/components/StarsIndicator.tsx`

- [ ] **Step 1: Create HoroscopeCard**

`src/features/horoscope/components/HoroscopeCard.tsx`:

```tsx
import { StyleSheet, View } from "react-native";

import { Card } from "@shared/components";
import { Body } from "@shared/components";
import { spacing } from "@shared/theme";

type HoroscopeCardProps = {
  text: string;
};

export const HoroscopeCard = ({ text }: HoroscopeCardProps) => {
  return (
    <Card variant="subtle">
      <Body style={styles.text}>{text}</Body>
    </Card>
  );
};

const styles = StyleSheet.create({
  text: {
    lineHeight: 24,
    fontSize: 15,
  },
});
```

- [ ] **Step 2: Create LuckyBadges**

`src/features/horoscope/components/LuckyBadges.tsx`:

```tsx
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Body, Label } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";

type LuckyBadgesProps = {
  luckyNumber: number;
  luckyColor: string;
};

export const LuckyBadges = ({ luckyNumber, luckyColor }: LuckyBadgesProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Label>{t("horoscope.luckyNumber")}</Label>
        <Body style={styles.number}>{luckyNumber}</Body>
      </View>
      <View style={styles.badge}>
        <Label>{t("horoscope.luckyColor")}</Label>
        <Body style={styles.colorName}>{luckyColor}</Body>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.md,
  },
  badge: {
    flex: 1,
    backgroundColor: colors.whiteOverlay,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  number: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 22,
    color: colors.pearlWhite,
  },
  colorName: {
    fontSize: 14,
    color: colors.pearlWhite,
  },
});
```

- [ ] **Step 3: Create StarsIndicator**

`src/features/horoscope/components/StarsIndicator.tsx`:

```tsx
import { StyleSheet, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, { FadeIn } from "react-native-reanimated";

import { Body, Label } from "@shared/components";
import { colors, radius, spacing } from "@shared/theme";
import type { Stars } from "../types";

type StarsIndicatorProps = {
  stars: Stars;
  unlocked: boolean;
  onUnlock: () => void;
};

const renderStars = (count: number): string => {
  return "\u2605".repeat(count) + "\u2606".repeat(5 - count);
};

export const StarsIndicator = ({
  stars,
  unlocked,
  onUnlock,
}: StarsIndicatorProps) => {
  const { t } = useTranslation();

  const sections: { key: keyof Stars; label: string }[] = [
    { key: "love", label: t("horoscope.love") },
    { key: "work", label: t("horoscope.work") },
    { key: "luck", label: t("horoscope.luck") },
  ];

  if (!unlocked) {
    return (
      <Pressable onPress={onUnlock} style={styles.lockedContainer}>
        {sections.map((s) => (
          <View key={s.key} style={styles.card}>
            <Label>{s.label}</Label>
            <Body style={styles.locked}>{"\uD83D\uDD12"}</Body>
          </View>
        ))}
        <View style={styles.unlockOverlay}>
          <Body style={styles.unlockText}>
            {t("ads.watchToUnlock")}
          </Body>
        </View>
      </Pressable>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
      {sections.map((s) => (
        <View key={s.key} style={styles.card}>
          <Label style={styles.cardLabel}>{s.label}</Label>
          <Body style={styles.stars}>{renderStars(stars[s.key])}</Body>
        </View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  lockedContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    position: "relative",
  },
  card: {
    flex: 1,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  cardLabel: {
    color: colors.gold,
  },
  stars: {
    color: colors.gold,
    fontSize: 18,
  },
  locked: {
    fontSize: 18,
    opacity: 0.5,
  },
  unlockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(13, 13, 13, 0.6)",
    borderRadius: radius.md,
  },
  unlockText: {
    color: colors.gold,
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/features/horoscope/components/
git commit -m "feat: add HoroscopeCard, LuckyBadges, and StarsIndicator components"
```

---

## Task 10: Home Screen Components — DetailSection & AffinityCard

**Files:**
- Create: `src/features/horoscope/components/DetailSection.tsx`
- Create: `src/features/horoscope/components/AffinityCard.tsx`
- Create: `src/features/horoscope/components/index.ts`

- [ ] **Step 1: Create DetailSection**

`src/features/horoscope/components/DetailSection.tsx`:

```tsx
import { StyleSheet, View, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

import { Card, Body, Title } from "@shared/components";
import { colors, spacing } from "@shared/theme";
import type { HoroscopeSection } from "../types";

type DetailSectionProps = {
  section: HoroscopeSection;
  text: string;
  unlocked: boolean;
  onUnlock: () => void;
};

export const DetailSection = ({
  section,
  text,
  unlocked,
  onUnlock,
}: DetailSectionProps) => {
  const { t } = useTranslation();

  const sectionLabel = t(`horoscope.${section}`);

  if (!unlocked) {
    return (
      <Pressable onPress={onUnlock}>
        <Card variant="subtle">
          <Title style={styles.sectionTitle}>{sectionLabel}</Title>
          <Body style={styles.blurredText} numberOfLines={3}>
            {text}
          </Body>
          <View style={styles.lockOverlay}>
            <Body style={styles.lockText}>
              {"\uD83D\uDD12"} {t("ads.watchToUnlock")}
            </Body>
          </View>
        </Card>
      </Pressable>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(600)}>
      <Card variant="subtle">
        <Title style={styles.sectionTitle}>{sectionLabel}</Title>
        <Body style={styles.text}>{text}</Body>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  text: {
    lineHeight: 24,
    fontSize: 14,
  },
  blurredText: {
    lineHeight: 24,
    fontSize: 14,
    opacity: 0.15,
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  lockText: {
    color: colors.gold,
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
  },
});
```

- [ ] **Step 2: Create AffinityCard**

`src/features/horoscope/components/AffinityCard.tsx`:

```tsx
import { StyleSheet, View, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

import { Card, Body, Title, Label } from "@shared/components";
import { colors, spacing } from "@shared/theme";
import { getZodiacSignById, type ZodiacSignId } from "@shared/utils/zodiac";

type AffinityCardProps = {
  compatibility: ZodiacSignId;
  unlocked: boolean;
  onUnlock: () => void;
};

export const AffinityCard = ({
  compatibility,
  unlocked,
  onUnlock,
}: AffinityCardProps) => {
  const { t } = useTranslation();
  const sign = getZodiacSignById(compatibility);

  if (!unlocked) {
    return (
      <Pressable onPress={onUnlock}>
        <Card variant="gold">
          <Title style={styles.title}>{t("horoscope.affinity")}</Title>
          <View style={styles.lockContent}>
            <Body style={styles.lockText}>
              {"\uD83D\uDD12"} {t("ads.watchToUnlock")}
            </Body>
          </View>
        </Card>
      </Pressable>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(600)}>
      <Card variant="gold">
        <Title style={styles.title}>{t("horoscope.affinity")}</Title>
        <Label>{t("horoscope.affinityDesc")}</Label>
        <View style={styles.signRow}>
          <Body style={styles.signSymbol}>{sign.symbol}</Body>
          <Body style={styles.signName}>{t(sign.nameKey)}</Body>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  lockContent: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  lockText: {
    color: colors.gold,
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
  },
  signRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  signSymbol: {
    fontSize: 32,
  },
  signName: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 20,
    color: colors.pearlWhite,
  },
});
```

- [ ] **Step 3: Create barrel export**

`src/features/horoscope/components/index.ts`:

```typescript
export { HoroscopeCard } from "./HoroscopeCard";
export { LuckyBadges } from "./LuckyBadges";
export { StarsIndicator } from "./StarsIndicator";
export { DetailSection } from "./DetailSection";
export { AffinityCard } from "./AffinityCard";
```

- [ ] **Step 4: Commit**

```bash
git add src/features/horoscope/components/
git commit -m "feat: add DetailSection and AffinityCard components"
```

---

## Task 11: Home Screen — Full Rewrite

**Files:**
- Modify: `app/(tabs)/index.tsx` (replace placeholder)

- [ ] **Step 1: Rewrite Home screen**

`app/(tabs)/index.tsx`:

```tsx
import { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

import { ScreenContainer, Title, Body } from "@shared/components";
import { colors, spacing } from "@shared/theme";
import { storageService } from "@services/storage";
import { useRewardedAd } from "@services/ads";
import { getZodiacSignById } from "@shared/utils/zodiac";
import { useHoroscope } from "@features/horoscope/hooks";
import {
  HoroscopeCard,
  LuckyBadges,
  StarsIndicator,
  DetailSection,
  AffinityCard,
} from "@features/horoscope/components";
import type { HoroscopeSection } from "@features/horoscope/types";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { horoscope, isLoading, error } = useHoroscope();
  const { showAd } = useRewardedAd();

  const profile = storageService.getUserProfile();
  const sign = profile ? getZodiacSignById(profile.zodiacSign) : null;

  const todayStr = new Date().toISOString().split("T")[0];
  const usage = storageService.getDailyUsage(todayStr);

  const [starsUnlocked, setStarsUnlocked] = useState(usage.freeHoroscopeRead);
  const [unlockedSections, setUnlockedSections] = useState<
    Record<HoroscopeSection, boolean>
  >({
    love: false,
    work: false,
    luck: false,
  });
  const [affinityUnlocked, setAffinityUnlocked] = useState(false);

  const handleUnlockStars = async () => {
    const rewarded = await showAd();
    if (rewarded) {
      setStarsUnlocked(true);
      const updated = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({
        ...updated,
        freeHoroscopeRead: true,
        rewardedAdsWatched: updated.rewardedAdsWatched + 1,
      });
    }
  };

  const handleUnlockSection = async (section: HoroscopeSection) => {
    const rewarded = await showAd();
    if (rewarded) {
      setUnlockedSections((prev) => ({ ...prev, [section]: true }));
      const updated = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({
        ...updated,
        rewardedAdsWatched: updated.rewardedAdsWatched + 1,
      });
    }
  };

  const handleUnlockAffinity = async () => {
    const rewarded = await showAd();
    if (rewarded) {
      setAffinityUnlocked(true);
      const updated = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({
        ...updated,
        rewardedAdsWatched: updated.rewardedAdsWatched + 1,
      });
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <Body style={styles.loadingText}>...</Body>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Title>
              {t("home.greeting", { sign: sign ? t(sign.nameKey) : "" })}
            </Title>
            <Body style={styles.date}>
              {new Date().toLocaleDateString("it-IT", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Body>
          </View>
          <Pressable onPress={() => router.push("/profile")}>
            <View style={styles.avatar}>
              <Body style={styles.avatarText}>
                {sign?.symbol ?? "\u2609"}
              </Body>
            </View>
          </Pressable>
        </View>

        {horoscope ? (
          <View style={styles.content}>
            <HoroscopeCard text={horoscope.general} />

            <LuckyBadges
              luckyNumber={horoscope.luckyNumber}
              luckyColor={horoscope.luckyColor}
            />

            <StarsIndicator
              stars={horoscope.stars}
              unlocked={starsUnlocked}
              onUnlock={handleUnlockStars}
            />

            {(["love", "work", "luck"] as HoroscopeSection[]).map(
              (section) => (
                <DetailSection
                  key={section}
                  section={section}
                  text={horoscope[section]}
                  unlocked={unlockedSections[section]}
                  onUnlock={() => handleUnlockSection(section)}
                />
              )
            )}

            <AffinityCard
              compatibility={horoscope.compatibility}
              unlocked={affinityUnlocked}
              onUnlock={handleUnlockAffinity}
            />
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Body style={styles.errorText}>
              {error ?? "Oroscopo non disponibile"}
            </Body>
          </View>
        )}

        <View style={styles.bannerContainer}>
          <BannerAd
            unitId={TestIds.ADAPTIVE_BANNER}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing["5xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  date: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: spacing.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.goldMuted,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
  },
  content: {
    gap: spacing.lg,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    opacity: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["5xl"],
  },
  errorText: {
    opacity: 0.5,
    textAlign: "center",
  },
  bannerContainer: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "feat: rewrite Home screen with full horoscope layout and ad gates"
```

---

## Post-Plan Verification

```bash
# Run all tests
npx jest

# Build functions
cd functions && npm run build && cd ..

# Type check app
npx tsc --noEmit
```

All must pass. The Home screen displays horoscope data from Firestore with rewarded ad gates on stars, detail sections, and affinity card. Cloud Functions are ready to deploy for content generation.
