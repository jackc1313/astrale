# Astrale — Guida Monetizzazione

Questa guida documenta la configurazione di monetizzazione completa dell'app, attualmente disattivata per il lancio. Tutto il codice e' nel codebase ma inattivo. Per riattivare, segui le istruzioni sotto.

---

## Stato attuale (lancio)

- Banner footer: ATTIVI (Home, Tarocchi, Scopri)
- Rewarded ads: DISATTIVATI (tutto sbloccato)
- Interstitial ads: DISATTIVATI
- Premium/Paywall: NASCOSTI
- RevenueCat: codice presente ma non attivo

---

## Come riattivare i blocchi rewarded ad

### Home — Sezioni dettaglio

In `app/(tabs)/index.tsx`, la logica attuale sblocca tutto. Per riattivare:

```typescript
// ATTUALE (tutto sbloccato):
const [unlockedSections, setUnlockedSections] = useState<Record<HoroscopeSection, boolean>>({
  love: true,
  work: true,
  health: true,
  luck: true,
});
const [affinityUnlocked, setAffinityUnlocked] = useState(true);

// RIPRISTINARE CON:
const freeSection: HoroscopeSection =
  interests.includes("love") ? "love" :
  (interests[0] as HoroscopeSection | undefined) ?? "love";

const [unlockedSections, setUnlockedSections] = useState<Record<HoroscopeSection, boolean>>({
  love: isPremium || freeSection === "love",
  work: isPremium || freeSection === "work",
  health: isPremium || freeSection === "health",
  luck: isPremium || freeSection === "luck",
});
const [affinityUnlocked, setAffinityUnlocked] = useState(isPremium);
```

Riattivare anche `handleUnlockSection` e `handleUnlockAffinity` con `showAd()`.

### Tarocchi — Modalita' amore

In `app/(tabs)/tarot.tsx`:

```typescript
// ATTUALE (tutto sbloccato):
const [unlockedModes, setUnlockedModes] = useState<TarotMode[]>(["daily", "three_card", "love"]);
const lockedModes: TarotMode[] = [];

// RIPRISTINARE CON:
const [unlockedModes, setUnlockedModes] = useState<TarotMode[]>(
  isPremium ? ["daily", "three_card", "love"] : ["daily", "three_card"]
);
const lockedModes = isPremium ? [] : (["love"] as TarotMode[]).filter(
  (m) => !unlockedModes.includes(m)
);
```

### Scopri — Spin/Gratta extra

In `app/(tabs)/discover.tsx`:

```typescript
// ATTUALE (nessun gate):
const handleSpinPress = async () => {
  wheel.startSpin();
};
const handleScratchSelect = async (index: number) => {
  scratch.selectCard(index);
};

// RIPRISTINARE CON:
const handleSpinPress = async () => {
  if (wheel.hasSpunToday && !isPremium) {
    const rewarded = await showAd();
    if (!rewarded) return;
  }
  wheel.startSpin();
};
const handleScratchSelect = async (index: number) => {
  if (scratch.hasScratchedToday && !isPremium) {
    const rewarded = await showAd();
    if (!rewarded) return;
  }
  scratch.selectCard(index);
};
```

### Interstitial ads

In ogni schermata, dopo un'interazione:

```typescript
const { maybeShowInterstitial } = useInterstitialAd();

// Chiamare dopo ogni interazione:
const usage = storageService.getDailyUsage(todayStr);
storageService.setDailyUsage({ ...usage, interactionsCount: usage.interactionsCount + 1 });
maybeShowInterstitial(usage.interactionsCount + 1, isPremium);
```

### Premium banner nel profilo

In `app/profile.tsx`, riaggiungere prima del bottone logout:

```tsx
{!isPremium && <PremiumBanner />}
```

### Banner ads — Nascondere per premium

In tutte le schermate con banner, il check `{!isPremium && ...}` nasconde il banner per gli utenti premium. Attualmente isPremium e' sempre false quindi il banner e' sempre visibile.

---

## Pricing

- Mensile: `astrale_plus_monthly` — 2,99 EUR/mese
- Annuale: `astrale_plus_yearly` — 19,99 EUR/anno (Risparmia 40%)

## Dipendenze

- `react-native-google-mobile-ads` — AdMob (banner, rewarded, interstitial)
- `react-native-purchases` — RevenueCat (in-app purchase)
- `src/services/ads.ts` — useRewardedAd, useInterstitialAd
- `src/services/premium.ts` — usePremium, initPremium
- `src/features/premium/` — Paywall, PremiumBanner
- `app/paywall.tsx` — Route paywall
