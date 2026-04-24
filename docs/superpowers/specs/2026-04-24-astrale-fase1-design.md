# Astrale — Fase 1 Design Spec

## Overview

App mobile (iOS + Android) di oroscopo, tarocchi e spiritualita'. React Native (Expo), Firebase backend, monetizzazione freemium con ads + premium subscription.

Questo documento copre il design completo dell'MVP, con focus sulla Fase 1 (fondamenta).

---

## Decisioni architetturali

| Tema | Scelta |
|------|--------|
| Framework | React Native (Expo) con Expo Router |
| Backend | Firebase (Firestore, Cloud Functions) |
| Identita' utente | Device ID + MMKV per free tier. Firebase Auth solo per premium |
| Stato locale | Zustand + MMKV |
| Navigazione | 3 tab: Home, Tarocchi, Scopri |
| Profilo | Icona avatar in alto a destra nella Home, schermata full-screen (push) |
| Generazione contenuti | Google Gemini API (free tier), Cloud Function schedulata settimanale |
| Onboarding | Completo: segno + ascendente + interessi + notifiche (4 schermate) |
| Design system | Palette scura (deep purple + nero + oro + bianco perlato), Playfair Display + Inter |
| Struttura progetto | Feature-based |

---

## Tech Stack

- **Framework**: React Native (Expo)
- **Linguaggio**: TypeScript
- **Navigazione**: Expo Router
- **Stato**: Zustand
- **Animazioni**: React Native Reanimated + Gesture Handler
- **Storage locale**: MMKV
- **Push Notifications**: Expo Notifications (locali)
- **Ads**: Google AdMob (react-native-google-mobile-ads)
- **Backend**: Firebase (Firestore, Cloud Functions)
- **Contenuti oroscopo**: Google Gemini API (free tier), batch settimanale
- **Analytics**: PostHog (free tier)
- **In-App Purchases**: RevenueCat
- **i18n**: react-i18next + expo-localization
- **Build & Deploy**: EAS Build + EAS Submit

---

## Struttura progetto

```
astrale/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout
│   ├── (onboarding)/             # Onboarding group
│   │   ├── _layout.tsx
│   │   ├── sign.tsx              # Selezione segno zodiacale
│   │   ├── ascendant.tsx         # Selezione ascendente
│   │   ├── interests.tsx         # Selezione interessi
│   │   └── notifications.tsx     # Permesso push
│   ├── (tabs)/                   # Tab group (post-onboarding)
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── index.tsx             # Home (oroscopo)
│   │   ├── tarot.tsx             # Tarocchi
│   │   └── discover.tsx          # Scopri (ruota + gratta)
│   └── profile.tsx               # Profilo (push da avatar)
├── src/
│   ├── features/
│   │   ├── onboarding/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types.ts
│   │   ├── horoscope/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types.ts
│   │   ├── tarot/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── data/             # Arcani Maggiori (nomi, significati)
│   │   │   └── types.ts
│   │   ├── discover/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types.ts
│   │   ├── profile/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types.ts
│   │   └── premium/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── types.ts
│   ├── shared/
│   │   ├── components/           # Button, Card, Typography, etc.
│   │   ├── theme/                # Colori, spacing, font config
│   │   └── utils/
│   ├── services/
│   │   ├── firebase.ts           # Config Firebase
│   │   ├── storage.ts            # MMKV wrapper
│   │   ├── ads.ts                # AdMob wrapper
│   │   └── notifications.ts      # Expo Notifications
│   └── i18n/
│       ├── index.ts              # Config react-i18next
│       └── locales/
│           ├── it.json
│           ├── en.json
│           └── es.json
├── assets/                       # Font, immagini, icone
├── app.json                      # Expo config
├── tsconfig.json
└── package.json
```

### Navigazione

- **Root layout**: controlla MMKV (`onboardingCompleted`) → redirect a `(onboarding)` o `(tabs)`
- **Onboarding**: stack lineare (segno → ascendente → interessi → notifiche → redirect a tabs)
- **Tabs**: 3 tab (Home, Tarocchi, Scopri) con bottom tab bar custom
- **Profilo**: push screen dal header della Home (non e' un tab)

---

## Data model

### MMKV (locale, dati utente)

```typescript
// Profilo utente
UserProfile {
  zodiacSign: string          // "aries", "taurus", ...
  birthDate: string           // "1990-05-15"
  ascendant: string | null    // opzionale
  interests: string[]         // ["love", "work", "health", "luck"]
  onboardingCompleted: boolean
  createdAt: string
}

// Streak e gamification
UserStreak {
  currentStreak: number
  longestStreak: number
  lastOpenDate: string        // "2026-04-24"
  badges: string[]            // ["7_days", "30_days", "100_days", "all_arcana"]
}

// Tracking uso giornaliero
DailyUsage {
  date: string
  freeHoroscopeRead: boolean
  tarotCardDrawn: boolean
  wheelSpun: boolean
  scratchUsed: boolean
  rewardedAdsWatched: number
}

// Collezione carte pescate (per badge "tutti gli arcani")
collectedCards: string[]      // ["the_fool", "the_magician", ...]
// Badge "all_arcana" si sblocca quando collectedCards.length === 22

// Storico letture (ultimi 7 giorni free, 30 premium)
ReadingHistory {
  date: string
  type: "horoscope" | "tarot" | "wheel" | "scratch"
  content: object             // snapshot del contenuto
}
```

### Firestore (remoto, contenuti generati)

```
horoscopes/
  └── {date}/                   # "2026-04-24"
      └── {sign}/               # "aries"
          ├── general: string
          ├── love: string
          ├── work: string
          ├── luck: string
          ├── stars: { love: 4, work: 3, luck: 5 }
          ├── luckyNumber: number
          ├── luckyColor: string
          └── compatibility: string

tarot_interpretations/
  └── {cardId}/                 # "the_fool"
      ├── name: string
      ├── upright: string
      ├── reversed: string
      └── contextual/
          └── {sign}/
              ├── love: string
              ├── work: string
              └── general: string

daily_content/
  └── {date}/
      ├── wheel: string[]        # pool affermazioni del giorno
      └── scratch: string[]      # pool frasi gratta e scopri
```

### Flusso dati

- App si apre → legge profilo da MMKV → fetch oroscopo del giorno da Firestore (con cache locale)
- Tarocchi: carta random lato client, interpretazione fetchata da Firestore
- Ruota/Gratta: contenuti fetchati da `daily_content`
- Tutto il tracking utente resta in MMKV, zero scritture su Firestore dal client

---

## Onboarding (4 schermate)

Progress bar segmentata in alto, visibile su tutte le schermate.

### Schermata 1 — Segno zodiacale
- Date picker per data di nascita
- Segno calcolato automaticamente, mostrato con icona e nome
- Link "Non e' il tuo segno? Cambialo" per override manuale

### Schermata 2 — Ascendente
- Griglia di 12 segni (selezionabili)
- Opzionale: link "Non conosco il mio ascendente" per skip
- Breve spiegazione di cosa sia l'ascendente

### Schermata 3 — Interessi
- 4 card selezionabili (multi-select): Amore, Lavoro, Salute, Fortuna
- Almeno 1 obbligatorio
- Icone tematiche per ciascuno

### Schermata 4 — Notifiche
- Illustrazione + copy persuasivo ("Non perderti l'oroscopo di domani")
- Bottone "Attiva notifiche" → richiede permesso OS
- Link "Forse dopo" per skip

Dopo l'onboarding: salva profilo in MMKV, `onboardingCompleted: true`, redirect ai tabs.

---

## Home — Oroscopo giornaliero

Layout verticale scrollabile, dall'alto verso il basso:

### Header
- Saluto personalizzato: "Buongiorno, Toro" con icona segno
- Icona avatar in alto a destra → push a profilo
- Data di oggi

### Oroscopo Generale (sempre visibile)
- Card con testo oroscopo generale (~50-80 parole)
- Numero fortunato + colore del giorno

### Indicatori stelle (rewarded ad gate)
- 3 indicatori: Amore, Lavoro, Fortuna (stelle 1-5)
- Coperti da overlay blur + icona play "Guarda un video per sbloccare"
- Dopo rewarded ad → si rivelano con animazione
- Premium: sempre visibili

### Sezioni dettaglio (rewarded ad gate)
- Card Amore, Card Lavoro, Card Fortuna
- Ciascuna coperta, sbloccabile singolarmente con rewarded ad
- Premium: tutte sbloccate

### Affinita' del giorno (rewarded ad gate)
- Card con overlay → "Guarda un video per sbloccare"
- Mostra segno piu' compatibile oggi
- Premium: sempre visibile (senza ad)

### Banner ad
- In fondo alla pagina, non invasivo
- Premium: nascosto

---

## Tarocchi

### Schermata principale
- Mazzo di 22 carte (Arcani Maggiori) disposte a ventaglio, faccia in giu'
- Sfondo scuro con particelle/stelle sottili

### Interazione
- Tap su una carta → animazione flip 3D (Reanimated) → carta rivelata
- Sotto la carta: nome, illustrazione, interpretazione personalizzata (basata su segno + interessi)

### Modalita'

| Modalita' | Carte | Accesso |
|-----------|-------|---------|
| Carta del giorno | 1 | 1 gratis/giorno |
| Passato/Presente/Futuro | 3 | Rewarded ad o premium |
| Lettura dell'amore | 3 | Rewarded ad o premium |

### Flusso
- Default: "Carta del giorno" selezionata
- Se gia' pescata oggi → mostra da MMKV
- Altre modalita': selector in alto, tap → check disponibilita' → rewarded ad gate o procedi
- Ogni carta pescata salvata in MMKV (storico + collectedCards)

### Dati
- 22 Arcani Maggiori hardcoded in `src/features/tarot/data/` (nome, immagine, significato dritto/rovesciato)
- Interpretazioni contestuali fetchate da Firestore (`tarot_interpretations/{cardId}/contextual/{sign}`)

---

## Scopri (Ruota + Gratta)

Tab con segmented control in alto per switchare tra le due sotto-sezioni.

### Ruota della Fortuna

**Layout:**
- Ruota colorata con 8-10 spicchi (affermazioni, consigli, sfide, numeri fortunati)
- Colori spicchi: variazioni di purple, oro, toni scuri

**Interazione:**
- Swipe/flick gesture (Gesture Handler) → ruota con inerzia realistica (Reanimated)
- Rallenta progressivamente → si ferma su uno spicchio
- Risultato: card animata con il contenuto dello spicchio

**Limiti:**
- 1 spin gratuito/giorno
- Spin extra: rewarded ad o premium
- Tracking in MMKV (`DailyUsage.wheelSpun`)

### Gratta e Scopri

**Layout:**
- 3 card coperte con texture "grattabile" (effetto scratch)
- L'utente ne sceglie 1

**Interazione:**
- Touch gesture → effetto scratch progressivo (canvas/skia)
- Sotto: frase del giorno, consiglio, o mini-previsione
- Rivelazione completata al 60% di area grattata

**Limiti:**
- 1 gratis/giorno
- Extra: rewarded ad o premium
- Tracking in MMKV (`DailyUsage.scratchUsed`)

**Contenuti:**
- Fetchati da Firestore (`daily_content/{date}`)
- Pool di ~200-300 affermazioni, rotazione mensile

---

## Profilo

Schermata full-screen (push da icona avatar nella Home).

**Layout dall'alto verso il basso:**
- Header: icona segno + nome segno + ascendente (se impostato)
- Streak counter: numero grande con fiamma, "X giorni consecutivi"
- Badge collezionati: griglia orizzontale scrollabile
  - 7 giorni, 30 giorni, 100 giorni, "tutti gli arcani" (22 carte pescate)
- Storico letture: lista per giorno, tap → dettaglio. 7 giorni free, 30 premium
- Impostazioni: lingua, orario notifiche, interessi, ascendente (modificabili)
- Banner "Passa ad Astrale Plus" (se free)

### Sistema Streak

- Ogni apertura app: confronta `lastOpenDate` con oggi
- Se ieri → `currentStreak++`
- Se oggi → noop
- Se piu' vecchio → `currentStreak = 1`
- Aggiorna `longestStreak` se superato
- Badge assegnati automaticamente al raggiungimento soglia

---

## Notifiche Push

Tutte locali (Expo Notifications), nessun server push per MVP.

| Notifica | Default | Personalizzabile |
|----------|---------|-----------------|
| Mattina — oroscopo pronto | 08:00 | Si, orario |
| Sera — "Hai pescato la carta?" | Off | Si, on/off + orario |
| Streak a rischio | Auto (21:00) | No |

Il contenuto delle notifiche viene dai file i18n.

---

## Monetizzazione

### Free tier

| Feature | Limite |
|---------|--------|
| Oroscopo giornaliero — Generale | Sempre disponibile |
| Oroscopo — Amore, Lavoro, Fortuna | Rewarded ad per ciascuno |
| Oroscopo — Indicatori stelle | Rewarded ad |
| Affinita' del giorno | Rewarded ad |
| Tarocchi — carta del giorno | 1/giorno |
| Tarocchi — lettura 3 carte | Rewarded ad |
| Tarocchi — lettura amore | Rewarded ad |
| Ruota della fortuna | 1 spin/giorno, extra con rewarded ad |
| Gratta e scopri | 1/giorno, extra con rewarded ad |
| Storico letture | 7 giorni |
| Ads | Banner + interstitial |

### Premium "Astrale Plus" — 2.99 EUR/mese o 19.99 EUR/anno

| Feature | Accesso |
|---------|---------|
| Oroscopo completo | Tutte le sezioni + indicatori + affinita' (senza ad) |
| Tarocchi | Tutte le letture, illimitate |
| Ruota + Gratta | Illimitati |
| Storico letture | 30 giorni |
| Ads | Zero |

### Strategia ads
- **Banner**: in fondo alla home (non invasivo)
- **Interstitial**: dopo la seconda interazione giornaliera (non alla prima apertura)
- **Rewarded video**: per sbloccare sezioni oroscopo, letture extra, spin extra

---

## Design system

### Palette
- Nero: `#0d0d0d`
- Deep Purple: `#1a1028`
- Oro: `#d4af37`
- Bianco Perlato: `#f5f0e8`

### Typography
- Titoli: Playfair Display (serif, 700)
- Body: Inter (sans-serif, 400/500)

### Stile
- Mistico ma moderno
- Animazioni fluide e "magiche" — flip 3D, inerzia ruota, effetto scratch
- Ogni schermata deve dare la sensazione di qualcosa di personale e misterioso

---

## Internazionalizzazione

Predisposta dal giorno zero. Nessuna stringa hardcoded.

- Lancio: italiano (`it.json`)
- Fase 2: inglese (`en.json`), spagnolo (`es.json`)
- Lingua app segue lingua dispositivo, con override manuale nelle impostazioni
- Contenuti generati (oroscopi, interpretazioni) prodotti per lingua e salvati separatamente in Firestore

---

## Generazione contenuti

Cloud Function Firebase schedulata, eseguita settimanalmente.

- Chiama Google Gemini API (free tier)
- Genera: 12 segni x 7 giorni x 4 sezioni = 336 testi/settimana
- Ogni sezione: ~50-80 parole
- Tono: positivo ma non banale, specifico, mai catastrofico
- Indicatori (stelle 1-5) generati insieme al testo
- Scrive risultati in Firestore

Interpretazioni tarocchi: generate una tantum (22 carte x 12 segni x 3 aree), poi aggiornate periodicamente.

Contenuti ruota/gratta: pool di ~200-300 affermazioni, rotazione mensile.
