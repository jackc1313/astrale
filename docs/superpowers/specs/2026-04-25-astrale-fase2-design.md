# Astrale — Fase 2 Design Spec (Core Features)

## Overview

Fase 2 implementa le feature core dell'app: oroscopo giornaliero nella Home, tarocchi con ventaglio interattivo e flip 3D, ruota della fortuna con Skia, gratta e scopri con scratch effect, e la Cloud Function per generazione contenuti con Gemini API.

---

## Decisioni architetturali Fase 2

| Tema | Scelta |
|------|--------|
| Generazione contenuti | Cloud Function inclusa in Fase 2, non rimandata |
| Ordine implementazione | Bottom-up: Cloud Function prima, poi Home, Tarocchi, Ruota, Gratta |
| Tarocchi — layout mazzo | Ventaglio interattivo con gesture swipe e tap per pescare |
| Rendering ruota + gratta | @shopify/react-native-skia per entrambi |
| Ads in dev | AdMob test IDs, integrazione reale in Fase 4 |
| Illustrazioni tarocchi | Card stilizzate placeholder (gradiente + simbolo), illustrazioni reali post-MVP |

---

## Cloud Function & Generazione Contenuti

### Struttura

```
functions/
├── src/
│   ├── index.ts                  # Entry point, export functions
│   ├── generateHoroscopes.ts     # Oroscopi settimanali
│   ├── generateTarot.ts          # Interpretazioni tarocchi (one-shot)
│   ├── generateDailyContent.ts   # Contenuti ruota/gratta
│   └── prompts/
│       ├── horoscope.ts          # Prompt template oroscopi
│       ├── tarot.ts              # Prompt template tarocchi
│       └── dailyContent.ts       # Prompt template ruota/gratta
├── package.json
└── tsconfig.json
```

### Functions

| Funzione | Trigger | Frequenza | Output Firestore |
|----------|---------|-----------|------------------|
| `generateWeeklyHoroscopes` | Pub/Sub schedule | Ogni domenica 03:00 | `horoscopes/{date}/{sign}` — 12 segni x 7 giorni x 4 sezioni + stelle + lucky number/color + compatibility |
| `generateDailyContent` | Pub/Sub schedule | Ogni domenica 03:30 | `daily_content/{date}` — 7 giorni, 10 item ruota + 5 item gratta per giorno |
| `generateTarotInterpretations` | HTTP callable (manuale) | Una tantum | `tarot_interpretations/{cardId}` — 22 carte x 12 segni x 3 aree |

### Flusso Gemini API

- Ogni function costruisce un prompt strutturato con istruzioni di tono e formato JSON
- Chiama Google Gemini API (free tier, modello gemini-2.0-flash) con JSON output forzato
- Parsa la risposta e scrive documenti Firestore in batch
- Rate limiting: max 15 RPM (free tier), le function attendono tra le chiamate
- Tono contenuti: positivo ma non banale, specifico, mai catastrofico

### Firestore Security Rules

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

Client puo' solo leggere. Solo le Cloud Functions (service account) scrivono.

---

## Home — Oroscopo Giornaliero

### Layout (ScrollView verticale)

**Header** (gia' implementato in Fase 1, va esteso):
- Saluto "Buongiorno, Toro" + data + avatar

**Card oroscopo generale (sempre visibile):**
- Fetch da Firestore: `horoscopes/{today}/{userSign}`
- Testo ~50-80 parole in una Card component
- Sotto: numero fortunato (badge circolare) + colore del giorno (cerchio colorato con nome)

**Indicatori stelle (rewarded ad gate):**
- 3 mini-card in riga: Amore, Lavoro, Fortuna
- Stato bloccato: overlay blur + icona lucchetto
- Tap → rewarded ad → rivelazione con animazione fade-in
- Stelle 1-5 dal campo `stars` di Firestore
- Stato sblocco in MMKV (`DailyUsage`)

**Sezioni dettaglio (rewarded ad gate):**
- 3 card: Amore, Lavoro, Fortuna
- Stato bloccato: testo blurred + bottone "Sblocca con video"
- Ogni sezione sbloccabile indipendentemente con rewarded ad

**Affinita' del giorno (rewarded ad gate):**
- Card con segno piu' compatibile oggi
- Bloccato → rewarded ad → rivelato

**Banner AdMob:**
- In fondo allo scroll, fisso
- Componente BannerAd da react-native-google-mobile-ads
- In dev: test ad unit ID

### Nuovi file

```
src/features/horoscope/
├── components/
│   ├── HoroscopeCard.tsx         # Card oroscopo generale
│   ├── StarsIndicator.tsx        # Mini-card stelle (1-5) con lock overlay
│   ├── DetailSection.tsx         # Card dettaglio (amore/lavoro/fortuna) con lock
│   ├── AffinityCard.tsx          # Card affinita' del giorno con lock
│   ├── LuckyBadges.tsx           # Numero fortunato + colore del giorno
│   └── index.ts
├── hooks/
│   ├── useHoroscope.ts           # Fetch oroscopo da Firestore + cache MMKV
│   └── index.ts
└── types.ts                      # Tipi Horoscope, HoroscopeSection, Stars
```

### Hook useHoroscope

- Fetch `horoscopes/{today}/{userSign}` da Firestore
- Cache locale in MMKV (chiave `horoscope.{date}.{sign}`)
- Se cache presente e data corrisponde → usa cache, skip fetch
- Espone: `horoscope`, `isLoading`, `error`
- Tipo `Horoscope`: `{ general, love, work, luck, stars, luckyNumber, luckyColor, compatibility }`

### Hook useRewardedAd (shared)

```
src/services/ads.ts
```

- Hook generico riusabile in tutte le feature
- Carica rewarded ad in background (preload)
- Espone: `isLoaded`, `showAd(): Promise<boolean>`
- Al completamento: ritorna `true`, il chiamante aggiorna lo stato
- In dev: usa Google test ad unit IDs

---

## Tarocchi — Ventaglio Interattivo + Flip 3D

### Layout

**Selector modalita' (top):**
- Segmented control: "Carta del giorno", "Passato/Presente/Futuro", "Amore"
- Default: "Carta del giorno"
- Modalita' bloccate: icona lucchetto → rewarded ad gate

**Mazzo a ventaglio (centro):**
- 22 carte disposte a semicerchio
- Ogni carta leggermente ruotata e sovrapposta (effetto ventaglio)
- Carta al centro in primo piano, laterali arretrano (scale ridotto)
- Gesture: swipe orizzontale per ruotare il ventaglio (Gesture Handler)
- Implementazione: Animated.FlatList orizzontale + Reanimated transforms (rotateZ, scale, translateY) basati sulla posizione

**Pesca:**
- Tap su carta → lift-up animation (translateY + scale)
- Flip 3D: Reanimated rotateY 0° → 180° → rivela il fronte
- Carta flippata al centro, mazzo scompare con fade

**Risultato:**
- Carta grande al centro con illustrazione
- Nome carta + significato (dritto o rovesciato, randomizzato 50/50)
- Interpretazione personalizzata da Firestore (`tarot_interpretations/{cardId}/contextual/{sign}`)
- Modalita' 3 carte: in riga, flip in sequenza (con delay 500ms tra una e l'altra)
  - Passato/Presente/Futuro: etichette sopra le carte
  - Amore: etichette "Tu", "Partner", "Relazione"

### Dati carte (22 Arcani Maggiori)

Hardcoded in `src/features/tarot/data/majorArcana.ts`:

```typescript
type TarotCard = {
  id: string;           // "the_fool", "the_magician", ...
  number: number;       // 0-21
  nameKey: string;      // i18n key
  uprightKey: string;   // i18n key significato dritto
  reversedKey: string;  // i18n key significato rovesciato
};
```

22 carte: The Fool (0) → The World (21).

Illustrazioni placeholder: card stilizzate con gradiente purple/gold + numero romano + simbolo unicode. Le illustrazioni reali verranno commissionate post-MVP.

### Nuovi file

```
src/features/tarot/
├── components/
│   ├── TarotFan.tsx              # Ventaglio interattivo con gesture
│   ├── TarotCard.tsx             # Singola carta (fronte/retro)
│   ├── CardFlip.tsx              # Animazione flip 3D
│   ├── TarotResult.tsx           # Risultato con interpretazione
│   ├── ModeSelector.tsx          # Segmented control modalita'
│   └── index.ts
├── hooks/
│   ├── useTarot.ts               # Stato tarocchi, pesca, fetch interpretazione
│   └── index.ts
├── data/
│   └── majorArcana.ts            # 22 Arcani Maggiori
└── types.ts
```

### Hook useTarot

- Stato: modalita' selezionata, carte pescate, orientamento (dritto/rovesciato)
- Pesca random senza ripetizione nella stessa sessione
- Fetch interpretazione da Firestore (`tarot_interpretations/{cardId}/contextual/{sign}`)
- Check MMKV: carta del giorno gia' pescata? → mostra risultato salvato
- Salva in `collectedCards` (per badge "tutti gli arcani") e `ReadingHistory`

---

## Ruota della Fortuna (Skia + Gesture)

### Layout

- Ruota centrata, ~70% larghezza schermo
- Indicatore/freccia fisso in alto al centro (punta verso il basso)
- Card risultato sotto la ruota (appare dopo spin)

### Rendering (Skia)

- Canvas @shopify/react-native-skia
- 8 spicchi disegnati come archi (Path con arc)
- Colori alternati: variazioni di deep purple, oro scuro, viola chiaro, nero
- Testo sugli spicchi: label breve (2-3 parole) ruotata lungo l'arco
- Contenuto spicchi da Firestore (`daily_content/{date}/wheel`) — primi 8 item del giorno

### Interazione

- Pan gesture (Gesture Handler) per "lanciare" la ruota
- Velocita' flick → velocita' iniziale rotazione
- Reanimated: rotazione con decelerazione friction-based
- Angolo finale → determina spicchio selezionato
- Haptic feedback durante lo spin (Expo Haptics)

### Risultato

- Card slide-up + fade-in sotto la ruota
- Contenuto completo dello spicchio (affermazione, consiglio, sfida)
- Bottone "Gira ancora" (se disponibile) o "Guarda un video per girare"

### Limiti

- 1 spin gratuito/giorno → `DailyUsage.wheelSpun`
- Extra: rewarded ad gate

### Nuovi file

```
src/features/discover/
├── components/
│   ├── FortuneWheel.tsx          # Canvas Skia con spicchi
│   ├── WheelIndicator.tsx        # Freccia indicatore
│   ├── WheelResult.tsx           # Card risultato
│   ├── ScratchCard.tsx           # Singola card grattabile
│   ├── ScratchSelector.tsx       # 3 card da scegliere
│   ├── DiscoverTabs.tsx          # Segmented control Ruota/Gratta
│   └── index.ts
├── hooks/
│   ├── useWheel.ts               # Fetch contenuti, stato spin, selezione
│   ├── useScratch.ts             # Fetch contenuti, stato gratta, rivelazione
│   └── index.ts
└── types.ts
```

### Hook useWheel

- Fetch `daily_content/{date}/wheel` da Firestore
- Cache MMKV
- Stato: hasSpunToday, result, isSpinning
- Selezione spicchio basata su angolo finale della rotazione

---

## Gratta e Scopri (Skia scratch)

### Layout

- 3 card affiancate orizzontalmente, coperte
- Tap su una → si ingrandisce al centro, le altre fade-out (Reanimated)

### Effetto scratch (Skia)

- Canvas Skia sovrapposto alla card
- Layer superiore: gradiente gold/purple con pattern decorativo
- Touch gesture: path drawing con `BlendMode.Clear`
- Larghezza tratto: ~40px
- Calcolo area: quando >60% cancellato → dissolve automatico del layer + haptic

### Contenuto

- Frase/consiglio/previsione da Firestore (`daily_content/{date}/scratch`)
- Testo centrato, font Playfair Display
- 3 contenuti diversi (uno per card), assegnati random

### Flusso

1. 3 card coperte → tap su una
2. Carta si ingrandisce (Reanimated scale + translate)
3. Utente gratta con il dito
4. Al 60% → dissolve completo + haptic feedback
5. Contenuto visibile, bottone "Gratta ancora" (se spin disponibile)

### Limiti

- 1 gratis/giorno → `DailyUsage.scratchUsed`
- Extra: rewarded ad gate

### Hook useScratch

- Fetch `daily_content/{date}/scratch` da Firestore
- Cache MMKV
- Stato: hasScratchedToday, selectedCard, revealedContent
- 3 contenuti assegnati random alle card

---

## Dipendenze aggiuntive Fase 2

| Package | Scopo |
|---------|-------|
| `@shopify/react-native-skia` | Canvas per ruota e scratch |
| `react-native-google-mobile-ads` | Banner + rewarded ads |
| `expo-haptics` | Feedback tattile |
| `firebase-functions` (in functions/) | Cloud Functions runtime |
| `@google/generative-ai` (in functions/) | Gemini API client |

---

## Aggiornamenti i18n (it.json)

Nuove chiavi per Fase 2:

- `horoscope.*` — titoli sezioni, label stelle, bottoni sblocco, affinita'
- `tarot.*` — nomi 22 Arcani Maggiori, significati dritto/rovesciato, nomi modalita', etichette 3 carte
- `discover.wheel.*` — titolo, bottone gira, bottone sblocca
- `discover.scratch.*` — titolo, istruzioni, bottone gratta ancora
- `ads.*` — "Guarda un video per sbloccare", "Sblocca con Astrale Plus"

---

## Schema Firestore (recap con dettagli)

### horoscopes/{date}/{sign}

```typescript
{
  general: string;           // ~50-80 parole
  love: string;              // ~50-80 parole
  work: string;              // ~50-80 parole
  luck: string;              // ~50-80 parole
  stars: {
    love: number;            // 1-5
    work: number;            // 1-5
    luck: number;            // 1-5
  };
  luckyNumber: number;       // 1-99
  luckyColor: string;        // nome colore in italiano
  compatibility: string;     // ZodiacSignId del segno piu' compatibile
}
```

### tarot_interpretations/{cardId}

```typescript
{
  name: string;
  upright: string;           // significato generale dritto
  reversed: string;          // significato generale rovesciato
  contextual: {
    [sign: string]: {        // "aries", "taurus", ...
      love: string;
      work: string;
      general: string;
    }
  }
}
```

### daily_content/{date}

```typescript
{
  wheel: string[];           // 10 affermazioni/consigli/sfide
  scratch: string[];         // 5 frasi/consigli/previsioni
}
```
