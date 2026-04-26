# Astrale — Fase 4 Design Spec (Monetizzazione)

## Overview

Fase 4 implementa la monetizzazione: RevenueCat per premium subscription "Astrale Plus", interstitial ads, premium gate su tutte le feature esistenti, e paywall screen. Tutti gli IDs (AdMob, RevenueCat) sono esternalizzati come env vars — verranno configurati al lancio.

---

## 1. RevenueCat — Premium "Astrale Plus"

### Servizio `src/services/premium.ts`

- Init RevenueCat SDK con `EXPO_PUBLIC_REVENUECAT_API_KEY`
- Hook `usePremium` espone: `isPremium`, `offerings`, `purchase(packageId)`, `restore()`
- `isPremium` cachato in MMKV (chiave `user.isPremium`) per accesso sincrono
- Al boot dell'app: check subscription status con RevenueCat, aggiorna cache MMKV
- Se RevenueCat non configurato (no API key): `isPremium = false`, nessun crash

### Prodotti (configurati su RevenueCat dashboard al lancio)

| Prodotto | ID | Prezzo |
|----------|-----|--------|
| Mensile | `astrale_plus_monthly` | 2.99 EUR |
| Annuale | `astrale_plus_yearly` | 19.99 EUR |

---

## 2. Premium Gate — Aggiornamento feature esistenti

Logica: se `isPremium === true` → tutto sbloccato, zero ads.

### Home (`app/(tabs)/index.tsx`)
- Stelle, sezioni dettaglio, affinita': sbloccate senza rewarded ad
- Banner AdMob: nascosto

### Tarot (`app/(tabs)/tarot.tsx`)
- Modalita' "Passato/Presente/Futuro" e "Amore": sbloccate senza rewarded ad

### Discover (`app/(tabs)/discover.tsx`)
- Spin ruota e gratta: illimitati senza rewarded ad

### Profile (`app/profile.tsx`)
- Calendario storico: 30 giorni (invece di 7)
- Banner "Passa ad Astrale Plus": nascosto

---

## 3. Interstitial Ads

Logica: interstitial dopo la seconda interazione giornaliera. Non alla prima apertura.

### Tracking
- Aggiungere `interactionsCount: number` a `DailyUsage` in types
- Incrementare a ogni interazione: oroscopo letto, carta pescata, ruota girata, gratta rivelato
- Se `interactionsCount >= 2` e `!isPremium` → mostra interstitial

### Hook `useInterstitialAd`
- In `src/services/ads.ts` (accanto a `useRewardedAd`)
- Preload interstitial in background
- `maybeShowInterstitial()` — controlla count e premium, mostra se necessario
- Test ad unit ID in dev (`TestIds.INTERSTITIAL`)

---

## 4. Paywall Screen

### Route: `app/paywall.tsx` (modal presentation)

### Layout
- Header con icona e titolo "Astrale Plus"
- Lista benefici (icone + testo):
  - Oroscopo completo senza pubblicita'
  - Tarocchi illimitati
  - Ruota e Gratta illimitati
  - Storico 30 giorni
  - Zero pubblicita'
- Card mensile (2.99/mese)
- Card annuale (19.99/anno) con badge "Risparmia 40%"
- Bottone acquisto
- Link "Ripristina acquisti"
- Link chiudi

### Accessibile da
- Banner "Passa ad Astrale Plus" nel profilo
- Qualsiasi lock overlay (opzionale, per ora solo dal profilo)

---

## 5. PremiumBanner Component

Componente riusabile per il CTA premium. Usato nel profilo e potenzialmente in altre schermate.

```
src/features/premium/components/PremiumBanner.tsx
```

- Card gold con testo + bottone
- `onPress` → naviga a `/paywall`

---

## File nuovi

```
src/services/premium.ts                    # RevenueCat init + usePremium hook
src/features/premium/components/
    Paywall.tsx                            # Schermata acquisto con benefici e prezzi
    PremiumBanner.tsx                      # Banner CTA riusabile
    index.ts                               # Barrel export
app/paywall.tsx                            # Route paywall (modal)
```

## File modificati

| File | Modifica |
|------|----------|
| `src/services/ads.ts` | Aggiungere `useInterstitialAd` hook |
| `src/services/index.ts` | Aggiungere export premium |
| `src/services/storage.ts` | Aggiungere MMKV key + helpers per isPremium |
| `src/features/onboarding/types.ts` | Aggiungere `interactionsCount` a `DailyUsage` |
| `app/_layout.tsx` | Aggiungere route paywall + init premium check |
| `app/(tabs)/index.tsx` | Premium check: skip ads se premium, nascondi banner |
| `app/(tabs)/tarot.tsx` | Premium check: modalita' sbloccate |
| `app/(tabs)/discover.tsx` | Premium check: illimitati |
| `app/profile.tsx` | Premium check: 30gg calendario, nascondi banner premium |
| `src/i18n/locales/it.json` | Chiavi paywall e premium |

---

## Aggiornamenti i18n

```
premium.title           — "Astrale Plus"
premium.subtitle        — "Sblocca l'esperienza completa"
premium.benefit1        — "Oroscopo completo senza pubblicita'"
premium.benefit2        — "Tarocchi illimitati, tutte le modalita'"
premium.benefit3        — "Ruota e Gratta illimitati"
premium.benefit4        — "Storico letture 30 giorni"
premium.benefit5        — "Zero pubblicita'"
premium.monthly         — "Mensile"
premium.monthlyPrice    — "2,99 EUR/mese"
premium.yearly          — "Annuale"
premium.yearlyPrice     — "19,99 EUR/anno"
premium.yearlySave      — "Risparmia 40%"
premium.subscribe       — "Abbonati"
premium.restore         — "Ripristina acquisti"
premium.close           — "Non ora"
```

---

## Dipendenze aggiuntive

| Package | Scopo |
|---------|-------|
| `react-native-purchases` | RevenueCat SDK |

---

## Env vars aggiuntive

Aggiungere a `.env.example`:
```
EXPO_PUBLIC_REVENUECAT_API_KEY=
EXPO_PUBLIC_ADMOB_BANNER_ID=
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=
EXPO_PUBLIC_ADMOB_REWARDED_ID=
```
