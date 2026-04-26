# Astrale — Guida al Lancio (Fase 5)

Guida step-by-step per testare, ottimizzare e pubblicare l'app su App Store e Play Store.

---

## Indice

1. [Setup Firebase](#1-setup-firebase)
2. [Popolare Firestore con i contenuti](#2-popolare-firestore-con-i-contenuti)
3. [Testing locale](#3-testing-locale)
4. [Performance e ottimizzazione](#4-performance-e-ottimizzazione)
5. [Creare l'icona dell'app](#5-creare-licona-dellapp)
6. [Screenshot per gli store](#6-screenshot-per-gli-store)
7. [Account sviluppatore](#7-account-sviluppatore)
8. [Configurare AdMob](#8-configurare-admob)
9. [Configurare RevenueCat](#9-configurare-revenuecat)
10. [Build di produzione](#10-build-di-produzione)
11. [Pubblicazione su App Store (iOS)](#11-pubblicazione-su-app-store-ios)
12. [Pubblicazione su Play Store (Android)](#12-pubblicazione-su-play-store-android)
13. [Post-lancio](#13-post-lancio)

---

## 1. Setup Firebase

### 1.1 Creare il progetto

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Clicca "Aggiungi progetto" → nome: `astrale`
3. Disabilita Google Analytics (non ci serve, usiamo PostHog)
4. Clicca "Crea progetto"

### 1.2 Aggiungere le app

**iOS:**
1. Nella dashboard Firebase, clicca l'icona iOS
2. Bundle ID: `com.astrale.app`
3. Nome app: `Astrale`
4. Scarica `GoogleService-Info.plist` (ti servira' dopo)
5. Completa la registrazione

**Android:**
1. Clicca l'icona Android
2. Package name: `com.astrale.app`
3. Nome app: `Astrale`
4. Scarica `google-services.json` (ti servira' dopo)
5. Completa la registrazione

### 1.3 Configurare le env vars

Dalla dashboard Firebase → Impostazioni progetto → Generali. Copia i valori e crea il file `.env` nella root del progetto:

```
EXPO_PUBLIC_FIREBASE_API_KEY=il_tuo_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=astrale.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=astrale
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=astrale.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=il_tuo_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=il_tuo_app_id
```

### 1.4 Aggiornare .firebaserc

```json
{
  "projects": {
    "default": "astrale"
  }
}
```

(Sostituisci `astrale` con l'ID reale del tuo progetto se diverso)

### 1.5 Deployare le Firestore Security Rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### 1.6 Configurare il Gemini API key per le Cloud Functions

1. Vai su [Google AI Studio](https://aistudio.google.com/apikey)
2. Crea una API key
3. Configura la key nelle Cloud Functions:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

Inserisci la key quando richiesto.

### 1.7 Deployare le Cloud Functions

```bash
cd functions && npm run build && cd ..
firebase deploy --only functions
```

---

## 2. Popolare Firestore con i contenuti

### 2.1 Generare gli oroscopi

Le Cloud Functions sono schedulate (domenica alle 3:00), ma per il primo lancio devi triggerarle manualmente.

**Oroscopi settimanali:**
Vai su Firebase Console → Functions → `generateWeeklyHoroscopes` → clicca "Esegui in test".

Oppure da terminale:
```bash
firebase functions:shell
> generateWeeklyHoroscopes()
```

Attendi ~10 minuti (84 chiamate API con delay di 4.5s ciascuna).

**Contenuti giornalieri (ruota + gratta):**
```bash
firebase functions:shell
> generateDailyContent()
```

Attendi ~1 minuto.

**Interpretazioni tarocchi (una tantum):**

Questa funzione e' callable, va invocata dal client o da shell:
```bash
firebase functions:shell
> generateTarotInterpretations()
```

ATTENZIONE: questa genera 22 carte x 12 segni = 264+ chiamate API. Richiede ~20 minuti. Falla girare una volta sola.

### 2.2 Verificare i dati

Vai su Firebase Console → Firestore Database. Dovresti vedere:
- `horoscopes/` → documenti per data → subcollection `signs/` con 12 segni
- `daily_content/` → documenti per data con array `wheel` e `scratch`
- `tarot_interpretations/` → 22 documenti (uno per carta)

---

## 3. Testing locale

### 3.1 iOS — Simulatore Xcode

Prerequisito: Xcode installato dal Mac App Store.

```bash
# Genera i file nativi iOS
npx expo prebuild --platform ios

# Build e lancia sul simulatore
npx expo run:ios
```

La prima build richiede 5-10 minuti. Le successive sono piu' veloci.

**Cosa testare:**
- [ ] Onboarding: tutte 4 le schermate funzionano
- [ ] Home: oroscopo caricato da Firestore, sezioni bloccate, rewarded ad gate
- [ ] Tarocchi: ventaglio scrollabile, tap pesca carta, flip 3D, 3 modalita'
- [ ] Ruota: spin con gesture, inerzia, risultato
- [ ] Gratta: selezione carta, scratch effect, rivelazione al 60%
- [ ] Profilo: streak, badge, calendario, notifiche toggle
- [ ] Tab bar: navigazione fluida tra le 3 tab
- [ ] Profilo accessibile da avatar in Home

### 3.2 Android — APK su device fisico

```bash
# Login a EAS (crea account se necessario)
npx eas login

# Configura EAS
npx eas build:configure

# Build APK di sviluppo
npx eas build --profile development --platform android
```

EAS genera un link per scaricare l'`.apk`. Scaricalo sul telefono Android e installalo (potrebbe servire abilitare "Installa da fonti sconosciute" nelle impostazioni).

Poi lancia il dev server:
```bash
npx expo start --dev-client
```

L'app sul telefono si connette al tuo Mac via WiFi (stessa rete).

**Testa le stesse cose della checklist iOS.**

### 3.3 Bug comuni da controllare

- [ ] Font caricati correttamente (testo non "salta" al primo render)
- [ ] Gradient background visibile su tutte le schermate
- [ ] Date picker funziona nell'onboarding
- [ ] MMKV persiste i dati tra i riavvii dell'app
- [ ] Le notifiche locali si schedulano correttamente
- [ ] Il calendario nel profilo mostra i dot dorati
- [ ] La ruota della fortuna ha inerzia realistica
- [ ] L'effetto scratch risponde al tocco in modo fluido

---

## 4. Performance e ottimizzazione

### 4.1 Rimuovere log di debug

Cerca e rimuovi eventuali `console.log` o `console.error` lasciati nel codice di produzione. Tieni solo quelli nelle Cloud Functions (CloudWatch li cattura).

### 4.2 Ottimizzare le immagini

I font sono gia' ottimizzati (TTF). Se in futuro aggiungi illustrazioni per le carte dei tarocchi, usa il formato WebP.

### 4.3 Splash screen

L'app usa gia' uno splash screen con sfondo `#0d0d0d`. Per aggiungere un logo:

1. Crea un'immagine PNG 1284x2778px (sfondo `#0d0d0d` con logo Astrale al centro)
2. Salvala come `assets/splash.png`
3. Aggiorna `app.json`:

```json
"splash": {
  "image": "./assets/splash.png",
  "resizeMode": "cover",
  "backgroundColor": "#0d0d0d"
}
```

---

## 5. Creare l'icona dell'app

Serve un'immagine PNG **1024x1024px** senza trasparenza.

Suggerimento: sfondo deep purple `#1a1028` con un simbolo zodiacale stilizzato in oro `#d4af37`. Puoi crearla con Canva o Figma.

Salva come `assets/icon.png` e aggiorna `app.json` (gia' configurato per puntare a `./assets/icon.png`).

Per Android, serve anche l'adaptive icon:
1. Crea `assets/adaptive-icon.png` (1024x1024, solo il simbolo centrale con margine)
2. Aggiorna `app.json`:

```json
"android": {
  "adaptiveIcon": {
    "foregroundImage": "./assets/adaptive-icon.png",
    "backgroundColor": "#1a1028"
  }
}
```

---

## 6. Screenshot per gli store

### 6.1 Dimensioni richieste

**App Store (iOS):**
- iPhone 6.7" (1290x2796px) — obbligatorio, iPhone 15 Pro Max
- iPhone 6.5" (1284x2778px) — opzionale ma consigliato
- Minimo 3 screenshot, massimo 10

**Play Store (Android):**
- Minimo 2 screenshot, massimo 8
- Dimensione: tra 320px e 3840px per lato, aspect ratio max 2:1
- Consigliato: 1080x1920px (portrait)

### 6.2 Come fare gli screenshot

**Da simulatore iOS (Xcode):**
1. Lancia l'app sul simulatore iPhone 15 Pro Max
2. Completa l'onboarding con dati di esempio
3. Per ogni schermata: `Cmd + S` (salva screenshot nella cartella Desktop)

**Da device Android:**
- Premi Volume Giu + Power contemporaneamente

### 6.3 Quali schermate catturare (in ordine)

1. **Home** — oroscopo del giorno con saluto personalizzato, stelle visibili
2. **Tarocchi** — ventaglio di carte a faccia in giu'
3. **Tarocchi risultato** — carta rivelata con interpretazione
4. **Ruota della fortuna** — ruota colorata pronta per lo spin
5. **Gratta e scopri** — 3 carte misteriose da scegliere
6. **Profilo** — streak counter con badge e calendario

### 6.4 Impaginazione (opzionale)

Per screenshot piu' professionali, puoi aggiungere testo sopra/sotto il mockup del telefono usando Canva:
- Sfondo: `#0d0d0d`
- Testo: oro `#d4af37`, font serif
- Frasi brevi: "Il tuo oroscopo quotidiano", "Pesca la tua carta", "Gira la ruota del destino"

---

## 7. Account sviluppatore

### 7.1 Apple Developer Program

1. Vai su [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/)
2. Accedi con il tuo Apple ID (o creane uno)
3. Segui il processo di iscrizione — 99$/anno
4. L'approvazione puo' richiedere 24-48 ore
5. Una volta approvato, avrai accesso a App Store Connect

### 7.2 Google Play Developer

1. Vai su [play.google.com/console/signup](https://play.google.com/console/signup)
2. Accedi con il tuo account Google
3. Paga la fee una tantum di 25$
4. Completa la verifica dell'identita' (puo' richiedere qualche giorno)
5. Una volta approvato, avrai accesso a Google Play Console

---

## 8. Configurare AdMob

### 8.1 Creare account AdMob

1. Vai su [admob.google.com](https://admob.google.com/)
2. Registrati con il tuo account Google
3. Crea una nuova app → iOS → nome "Astrale"
4. Crea una nuova app → Android → nome "Astrale"

### 8.2 Creare le ad unit

Per CIASCUNA piattaforma (iOS e Android), crea:

| Tipo | Nome |
|------|------|
| Banner | `astrale_banner` |
| Interstitial | `astrale_interstitial` |
| Rewarded | `astrale_rewarded` |

### 8.3 Aggiornare le env vars

Aggiungi al tuo `.env` gli ID delle ad unit (usa quelli iOS o Android a seconda della build):

```
EXPO_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-xxxxx/yyyyy
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=ca-app-pub-xxxxx/yyyyy
EXPO_PUBLIC_ADMOB_REWARDED_ID=ca-app-pub-xxxxx/yyyyy
```

NOTA: per ora il codice usa `TestIds` (IDs di test). Per passare ai veri IDs in produzione, aggiorna `src/services/ads.ts` sostituendo `TestIds.REWARDED`, `TestIds.INTERSTITIAL`, `TestIds.ADAPTIVE_BANNER` con le env vars:

```typescript
const REWARDED_AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID ?? TestIds.REWARDED;
const INTERSTITIAL_AD_UNIT_ID = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? TestIds.INTERSTITIAL;
```

E nella Home per il banner:
```typescript
unitId={process.env.EXPO_PUBLIC_ADMOB_BANNER_ID ?? TestIds.ADAPTIVE_BANNER}
```

---

## 9. Configurare RevenueCat

### 9.1 Creare account RevenueCat

1. Vai su [app.revenuecat.com](https://app.revenuecat.com/)
2. Registrati (free tier sufficiente per iniziare)
3. Crea un nuovo progetto → nome "Astrale"

### 9.2 Configurare le piattaforme

**iOS (App Store Connect):**
1. In RevenueCat → progetto Astrale → Platform → App Store
2. Inserisci il Bundle ID: `com.astrale.app`
3. Inserisci l'App Store Connect Shared Secret (lo trovi in App Store Connect → App → Informazioni app → Segreto condiviso)

**Android (Google Play):**
1. In RevenueCat → progetto Astrale → Platform → Play Store
2. Inserisci il Package Name: `com.astrale.app`
3. Collega il service account Google Play (segui la guida RevenueCat)

### 9.3 Creare i prodotti

**In App Store Connect:**
1. Vai su App → Abbonamenti
2. Crea un gruppo di abbonamento: "Astrale Plus"
3. Crea due abbonamenti:
   - `astrale_plus_monthly` — 2,99 EUR/mese
   - `astrale_plus_yearly` — 19,99 EUR/anno

**In Google Play Console:**
1. Vai su App → Monetizzazione → Abbonamenti
2. Crea due abbonamenti con gli stessi ID e prezzi

**In RevenueCat:**
1. Crea un Entitlement: "premium"
2. Crea un Offering: "default"
3. Aggiungi i due prodotti all'offering (monthly e annual)
4. Associa i prodotti all'entitlement "premium"

### 9.4 Aggiornare le env vars

```
EXPO_PUBLIC_REVENUECAT_API_KEY=la_tua_api_key_pubblica
```

(La trovi in RevenueCat → progetto → API Keys → Public App-Specific API Key)

---

## 10. Build di produzione

### 10.1 Configurare EAS per produzione

Crea/aggiorna `eas.json` nella root del progetto:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "la_tua_email@apple.com",
        "ascAppId": "il_tuo_app_id_numerico",
        "appleTeamId": "il_tuo_team_id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json"
      }
    }
  }
}
```

### 10.2 Build iOS

```bash
npx eas build --platform ios --profile production
```

EAS genera un file `.ipa`. Il processo richiede 10-20 minuti.

### 10.3 Build Android

```bash
npx eas build --platform android --profile production
```

EAS genera un file `.aab` (Android App Bundle). Il processo richiede 10-15 minuti.

---

## 11. Pubblicazione su App Store (iOS)

### 11.1 App Store Connect

1. Vai su [appstoreconnect.apple.com](https://appstoreconnect.apple.com/)
2. Clicca "+" → Nuova app
3. Compila:
   - Nome: `Astrale`
   - Lingua principale: Italiano
   - Bundle ID: seleziona `com.astrale.app`
   - SKU: `astrale`

### 11.2 Informazioni app

**Nome:** Astrale — Oroscopo e Tarocchi

**Sottotitolo:** Oroscopo quotidiano e carte dei tarocchi

**Descrizione (copia/incolla):**

```
Astrale ti offre ogni giorno un'esperienza unica e personalizzata nel mondo dell'astrologia e della spiritualita'.

OROSCOPO QUOTIDIANO
Scopri cosa ti riservano le stelle con il tuo oroscopo personalizzato. Leggi le previsioni per amore, lavoro e fortuna, con indicatori stellari e il tuo numero e colore fortunato del giorno.

TAROCCHI INTERATTIVI
Pesca la tua carta del giorno da un mazzo di 22 Arcani Maggiori disposti a ventaglio. Sfoglia le carte con un gesto, tappane una e guardala rivoltarsi con un'animazione 3D. Scopri il significato personalizzato per il tuo segno zodiacale.

RUOTA DELLA FORTUNA
Gira la ruota con un gesto e lascia che il destino scelga per te un'affermazione, un consiglio o una sfida quotidiana.

GRATTA E SCOPRI
Scegli una delle tre carte misteriose e gratta per rivelare il tuo messaggio del giorno.

PROFILO E STREAK
Tieni traccia dei tuoi giorni consecutivi, colleziona badge e rivivi le tue letture passate nel calendario interattivo.

ASTRALE PLUS
Sblocca l'esperienza completa: oroscopo senza pubblicita', tarocchi illimitati, ruota e gratta senza limiti, e 30 giorni di storico letture.

Astrale e' il tuo compagno quotidiano per iniziare ogni giornata con ispirazione e un tocco di magia.
```

**Parole chiave (max 100 caratteri):**
```
oroscopo,tarocchi,zodiaco,astrologia,fortuna,spiritualita,segno zodiacale,carte,ruota,gratta
```

**Categoria:** Stile di vita (principale), Intrattenimento (secondaria)

**Classificazione eta':** 4+ (nessun contenuto sensibile)

### 11.3 Caricare screenshot

Carica gli screenshot creati al punto 6 per iPhone 6.7".

### 11.4 Inviare la build

```bash
npx eas submit --platform ios --profile production
```

Oppure carica manualmente l'`.ipa` tramite Transporter (app Mac).

### 11.5 Inviare per review

In App Store Connect:
1. Seleziona la build caricata
2. Compila le informazioni sulla privacy (l'app raccoglie: nessun dato personale, solo device ID locale)
3. Clicca "Invia per la revisione"

La review Apple richiede tipicamente 24-48 ore.

---

## 12. Pubblicazione su Play Store (Android)

### 12.1 Google Play Console

1. Vai su [play.google.com/console](https://play.google.com/console)
2. Clicca "Crea app"
3. Compila:
   - Nome: `Astrale — Oroscopo e Tarocchi`
   - Lingua: Italiano
   - App o gioco: App
   - Gratuita

### 12.2 Scheda dello store

**Descrizione breve (max 80 caratteri):**
```
Oroscopo quotidiano, tarocchi interattivi e ruota della fortuna
```

**Descrizione completa:**
(Usa la stessa descrizione di App Store al punto 11.2)

**Categoria:** Stile di vita

**Classificazione contenuti:** Completa il questionario (rispondi "No" a tutto → ottieni classificazione "Per tutti")

### 12.3 Caricare screenshot e grafica

- **Icona:** 512x512 (viene da `assets/icon.png`, ridimensionala)
- **Immagine in primo piano:** 1024x500px (banner orizzontale con logo + sfondo deep purple)
- **Screenshot telefono:** carica quelli creati al punto 6

### 12.4 Inviare la build

```bash
npx eas submit --platform android --profile production
```

Oppure carica manualmente il file `.aab` nella sezione "Release" della Play Console.

### 12.5 Pubblicare

1. Vai su Release → Produzione → Crea nuova release
2. Carica il `.aab`
3. Aggiungi note di rilascio:

```
Versione 1.0.0 — Lancio iniziale

- Oroscopo quotidiano personalizzato per il tuo segno
- Tarocchi interattivi con 22 Arcani Maggiori
- Ruota della Fortuna con animazione realistica
- Gratta e Scopri con effetto scratch
- Sistema streak e badge collezionabili
- Notifiche push personalizzabili
```

4. Clicca "Rivedi release" → "Avvia rollout in produzione"

La review Google richiede tipicamente poche ore — a volte minuti.

---

## 13. Post-lancio

### 13.1 Monitoraggio

- **Firebase Console** → monitora le Cloud Functions (errori, esecuzioni)
- **AdMob** → monitora revenue e fill rate
- **RevenueCat** → monitora conversioni e revenue premium
- **PostHog** (se configurato) → monitora DAU, retention, funnel

### 13.2 Contenuti settimanali

Le Cloud Functions girano automaticamente ogni domenica alle 3:00. Controlla periodicamente su Firestore che i nuovi contenuti vengano generati.

Se una generazione fallisce, puoi triggerare manualmente:
```bash
firebase functions:shell
> generateWeeklyHoroscopes()
> generateDailyContent()
```

### 13.3 Prossimi passi (post-MVP)

- **Fase 6 — Lingue:** Tradurre `en.json` e `es.json`, generare contenuti multilingua
- **Illustrazioni tarocchi:** Commissionare o generare illustrazioni reali per le 22 carte
- **Oroscopo settimanale/mensile:** Aggiungere per utenti premium
- **Temi visivi carte:** Temi alternativi per premium
- **A/B test ads:** Testare posizionamento e frequenza degli ads
- **ASO internazionale:** Tradurre le schede store in inglese e spagnolo

---

## Checklist finale pre-lancio

- [ ] Progetto Firebase creato e configurato
- [ ] Cloud Functions deployate e funzionanti
- [ ] Firestore popolato (oroscopi, tarocchi, daily content)
- [ ] `.env` configurato con tutti i valori reali
- [ ] App testata su simulatore iOS
- [ ] App testata su device Android
- [ ] Tutti i bug critici risolti
- [ ] Icona dell'app creata (1024x1024)
- [ ] Screenshot per entrambi gli store
- [ ] Account Apple Developer attivo
- [ ] Account Google Play Developer attivo
- [ ] AdMob configurato con ad unit reali
- [ ] RevenueCat configurato con prodotti
- [ ] `ads.ts` aggiornato con ad unit IDs reali
- [ ] Build di produzione iOS completata
- [ ] Build di produzione Android completata
- [ ] App inviata per review su App Store
- [ ] App pubblicata su Play Store
