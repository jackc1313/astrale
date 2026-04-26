# Astrale Fase 4 — Monetizzazione Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement monetization: RevenueCat premium subscription, interstitial ads, premium gates on all features, and paywall screen. All IDs externalized as env vars for launch-time configuration.

**Architecture:** RevenueCat SDK manages subscription state, cached in MMKV for synchronous access. `usePremium` hook provides `isPremium` flag consumed by all screens. Interstitial ads trigger after the second daily interaction. Paywall is a modal screen accessible from profile.

**Tech Stack:** react-native-purchases (RevenueCat), react-native-google-mobile-ads, MMKV

---

## File Map

### New Files

| Path | Responsibility |
|------|---------------|
| `src/services/premium.ts` | RevenueCat init + usePremium hook |
| `src/features/premium/components/Paywall.tsx` | Purchase screen with benefits and pricing |
| `src/features/premium/components/PremiumBanner.tsx` | Reusable CTA banner |
| `src/features/premium/components/index.ts` | Barrel export |
| `app/paywall.tsx` | Paywall route (modal) |

### Modified Files

| Path | Change |
|------|--------|
| `src/features/onboarding/types.ts` | Add `interactionsCount` to DailyUsage |
| `src/services/storage.ts` | Add isPremium key + helpers |
| `src/services/ads.ts` | Add useInterstitialAd hook |
| `src/services/index.ts` | Add premium exports |
| `src/i18n/locales/it.json` | Add premium/paywall translations |
| `.env.example` | Add RevenueCat + AdMob env vars |
| `app/_layout.tsx` | Add paywall route + premium init |
| `app/(tabs)/index.tsx` | Premium check on Home |
| `app/(tabs)/tarot.tsx` | Premium check on Tarot |
| `app/(tabs)/discover.tsx` | Premium check on Discover |
| `app/profile.tsx` | Premium check + hide banner |

---

## Task 1: Dependencies, Types & i18n

**Files:**
- Modify: `src/features/onboarding/types.ts`
- Modify: `src/i18n/locales/it.json`
- Modify: `.env.example`

- [ ] **Step 1: Install RevenueCat**

```bash
npm install react-native-purchases --legacy-peer-deps
```

- [ ] **Step 2: Add interactionsCount to DailyUsage**

In `src/features/onboarding/types.ts`, add `interactionsCount: number;` to the `DailyUsage` type after `rewardedAdsWatched`:

```typescript
export type DailyUsage = {
  date: string;
  freeHoroscopeRead: boolean;
  tarotCardDrawn: boolean;
  wheelSpun: boolean;
  scratchUsed: boolean;
  rewardedAdsWatched: number;
  interactionsCount: number;
};
```

- [ ] **Step 3: Update DailyUsage default in storage.ts**

In `src/services/storage.ts`, in the `getDailyUsage` method, add `interactionsCount: 0` to the default return object:

```typescript
return {
  date, freeHoroscopeRead: false, tarotCardDrawn: false,
  wheelSpun: false, scratchUsed: false, rewardedAdsWatched: 0,
  interactionsCount: 0,
};
```

- [ ] **Step 4: Add premium i18n keys**

Read `src/i18n/locales/it.json`, MERGE new `premium` key:

```json
{
  "premium": {
    "title": "Astrale Plus",
    "subtitle": "Sblocca l'esperienza completa",
    "benefit1": "Oroscopo completo senza pubblicita'",
    "benefit2": "Tarocchi illimitati, tutte le modalita'",
    "benefit3": "Ruota e Gratta illimitati",
    "benefit4": "Storico letture 30 giorni",
    "benefit5": "Zero pubblicita'",
    "monthly": "Mensile",
    "monthlyPrice": "2,99 EUR/mese",
    "yearly": "Annuale",
    "yearlyPrice": "19,99 EUR/anno",
    "yearlySave": "Risparmia 40%",
    "subscribe": "Abbonati",
    "restore": "Ripristina acquisti",
    "close": "Non ora"
  }
}
```

- [ ] **Step 5: Update .env.example**

Append to `.env.example`:
```
EXPO_PUBLIC_REVENUECAT_API_KEY=
EXPO_PUBLIC_ADMOB_BANNER_ID=
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=
EXPO_PUBLIC_ADMOB_REWARDED_ID=
```

- [ ] **Step 6: Commit**

```bash
git add src/features/onboarding/types.ts src/services/storage.ts src/i18n/locales/it.json .env.example package.json package-lock.json
git commit -m "feat: add RevenueCat dep, interactionsCount type, premium i18n, env vars"
```

---

## Task 2: Premium Service & Storage

**Files:**
- Create: `src/services/premium.ts`
- Modify: `src/services/storage.ts`
- Modify: `src/services/index.ts`

- [ ] **Step 1: Add isPremium to storage**

In `src/services/storage.ts`, add to KEYS:
```typescript
IS_PREMIUM: 'user.isPremium',
```

Add to storageService (before `clearAll`):
```typescript
getIsPremium: (): boolean => {
  return storage.getBoolean(KEYS.IS_PREMIUM) ?? false;
},

setIsPremium: (value: boolean): void => {
  storage.set(KEYS.IS_PREMIUM, value);
},
```

- [ ] **Step 2: Create premium service**

`src/services/premium.ts`:

```typescript
import { useCallback, useEffect, useState } from 'react';
import Purchases, { type PurchasesOfferings, type PurchasesPackage } from 'react-native-purchases';

import { storageService } from './storage';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '';

let initialized = false;

export const initPremium = async (): Promise<void> => {
  if (initialized || !API_KEY) return;

  Purchases.configure({ apiKey: API_KEY });
  initialized = true;

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isActive = Object.keys(customerInfo.entitlements.active).length > 0;
    storageService.setIsPremium(isActive);
  } catch {
    // Offline or not configured — use cached value
  }
};

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(() => storageService.getIsPremium());
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);

  useEffect(() => {
    const loadOfferings = async () => {
      if (!API_KEY) return;
      try {
        const off = await Purchases.getOfferings();
        setOfferings(off);
      } catch {
        // Not configured yet
      }
    };
    loadOfferings();
  }, []);

  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isActive = Object.keys(customerInfo.entitlements.active).length > 0;
      setIsPremium(isActive);
      storageService.setIsPremium(isActive);
      return isActive;
    } catch {
      return false;
    }
  }, []);

  const restore = useCallback(async (): Promise<boolean> => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isActive = Object.keys(customerInfo.entitlements.active).length > 0;
      setIsPremium(isActive);
      storageService.setIsPremium(isActive);
      return isActive;
    } catch {
      return false;
    }
  }, []);

  return { isPremium, offerings, purchase, restore };
};
```

- [ ] **Step 3: Update services barrel**

Add to `src/services/index.ts`:
```typescript
export { initPremium, usePremium } from './premium';
```

- [ ] **Step 4: Commit**

```bash
git add src/services/premium.ts src/services/storage.ts src/services/index.ts
git commit -m "feat: add RevenueCat premium service with MMKV cache"
```

---

## Task 3: Interstitial Ad Hook

**Files:**
- Modify: `src/services/ads.ts`

- [ ] **Step 1: Add useInterstitialAd to ads.ts**

Read existing `src/services/ads.ts`. Append after the `useRewardedAd` export:

```typescript
import {
  InterstitialAd,
  AdEventType,
} from "react-native-google-mobile-ads";

const INTERSTITIAL_AD_UNIT_ID = TestIds.INTERSTITIAL;

export const useInterstitialAd = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [adInstance, setAdInstance] = useState<InterstitialAd | null>(null);

  const loadAd = useCallback(() => {
    const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID);

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      setIsLoaded(true);
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setIsLoaded(false);
      loadAd();
    });

    ad.load();
    setAdInstance(ad);

    return () => {
      unsubLoaded();
      unsubClosed();
    };
  }, []);

  useEffect(() => {
    const cleanup = loadAd();
    return cleanup;
  }, [loadAd]);

  const maybeShowInterstitial = useCallback(
    async (interactionsCount: number, isPremium: boolean): Promise<void> => {
      if (isPremium || interactionsCount < 2 || !adInstance || !isLoaded) return;
      try {
        await adInstance.show();
      } catch {
        // Ad not ready
      }
    },
    [adInstance, isLoaded]
  );

  return { maybeShowInterstitial };
};
```

NOTE: The imports `InterstitialAd` and `AdEventType` need to be added to the existing import from `react-native-google-mobile-ads` at the top of the file. Merge them with the existing imports.

- [ ] **Step 2: Update services barrel**

Add to `src/services/index.ts`:
```typescript
export { useInterstitialAd } from './ads';
```

- [ ] **Step 3: Commit**

```bash
git add src/services/ads.ts src/services/index.ts
git commit -m "feat: add useInterstitialAd hook with interaction count gate"
```

---

## Task 4: Premium Components (Paywall + Banner)

**Files:**
- Create: `src/features/premium/components/Paywall.tsx`
- Create: `src/features/premium/components/PremiumBanner.tsx`
- Create: `src/features/premium/components/index.ts`

- [ ] **Step 1: Create Paywall component**

`src/features/premium/components/Paywall.tsx`:

```tsx
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ScreenContainer, Title, Body, Button, Card } from '@shared/components';
import { colors, radius, spacing } from '@shared/theme';
import { usePremium } from '@services/premium';

type PaywallProps = {
  onClose: () => void;
};

const BENEFITS = [
  { key: 'premium.benefit1', icon: '\u2609' },
  { key: 'premium.benefit2', icon: '\u2721' },
  { key: 'premium.benefit3', icon: '\u2728' },
  { key: 'premium.benefit4', icon: '\uD83D\uDCC5' },
  { key: 'premium.benefit5', icon: '\u26D4' },
];

export const Paywall = ({ onClose }: PaywallProps) => {
  const { t } = useTranslation();
  const { offerings, purchase, restore } = usePremium();

  const monthly = offerings?.current?.availablePackages.find(
    (p) => p.identifier === '$rc_monthly'
  );
  const annual = offerings?.current?.availablePackages.find(
    (p) => p.identifier === '$rc_annual'
  );

  const handlePurchase = async (pkg: typeof monthly) => {
    if (!pkg) return;
    const success = await purchase(pkg);
    if (success) onClose();
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Body style={styles.starIcon}>{'\u2B50'}</Body>
        <Title style={styles.title}>{t('premium.title')}</Title>
        <Body style={styles.subtitle}>{t('premium.subtitle')}</Body>

        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b.key} style={styles.benefitRow}>
              <Body style={styles.benefitIcon}>{b.icon}</Body>
              <Body style={styles.benefitText}>{t(b.key)}</Body>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          <Pressable
            onPress={() => handlePurchase(annual)}
            style={styles.planCard}
          >
            <Card variant="gold">
              <View style={styles.planHeader}>
                <Title style={styles.planTitle}>{t('premium.yearly')}</Title>
                <View style={styles.saveBadge}>
                  <Body style={styles.saveText}>{t('premium.yearlySave')}</Body>
                </View>
              </View>
              <Body style={styles.planPrice}>{t('premium.yearlyPrice')}</Body>
            </Card>
          </Pressable>

          <Pressable
            onPress={() => handlePurchase(monthly)}
            style={styles.planCard}
          >
            <Card variant="subtle">
              <Title style={styles.planTitle}>{t('premium.monthly')}</Title>
              <Body style={styles.planPrice}>{t('premium.monthlyPrice')}</Body>
            </Card>
          </Pressable>
        </View>

        <Pressable onPress={restore}>
          <Body style={styles.restoreLink}>{t('premium.restore')}</Body>
        </Pressable>

        <Pressable onPress={onClose}>
          <Body style={styles.closeLink}>{t('premium.close')}</Body>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: { padding: spacing.xl, alignItems: 'center', gap: spacing.lg, paddingBottom: spacing['5xl'] },
  starIcon: { fontSize: 48, marginTop: spacing['3xl'] },
  title: { fontSize: 28, textAlign: 'center' },
  subtitle: { fontSize: 14, opacity: 0.6, textAlign: 'center' },
  benefits: { gap: spacing.md, width: '100%', marginTop: spacing.lg },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  benefitIcon: { fontSize: 20, width: 30, textAlign: 'center' },
  benefitText: { fontSize: 14, flex: 1 },
  plans: { gap: spacing.md, width: '100%', marginTop: spacing.lg },
  planCard: { width: '100%' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planTitle: { fontSize: 16 },
  planPrice: { fontSize: 13, opacity: 0.7, marginTop: spacing.xs },
  saveBadge: { backgroundColor: colors.gold, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  saveText: { fontSize: 10, color: colors.black, fontFamily: 'Inter-SemiBold' },
  restoreLink: { color: colors.gold, fontSize: 13, marginTop: spacing.lg },
  closeLink: { color: colors.whiteDim, fontSize: 13, marginTop: spacing.sm },
});
```

- [ ] **Step 2: Create PremiumBanner**

`src/features/premium/components/PremiumBanner.tsx`:

```tsx
import { StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, Body, Title } from '@shared/components';
import { colors, spacing } from '@shared/theme';

export const PremiumBanner = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push('/paywall')}>
      <Card variant="gold" style={styles.card}>
        <Title style={styles.title}>{'\u2B50'} {t('premium.title')}</Title>
        <Body style={styles.subtitle}>{t('premium.subtitle')}</Body>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.xs },
  title: { fontSize: 16 },
  subtitle: { fontSize: 12, opacity: 0.7 },
});
```

- [ ] **Step 3: Create barrel export**

`src/features/premium/components/index.ts`:

```typescript
export { Paywall } from './Paywall';
export { PremiumBanner } from './PremiumBanner';
```

- [ ] **Step 4: Commit**

```bash
git add src/features/premium/components/
git commit -m "feat: add Paywall screen and PremiumBanner components"
```

---

## Task 5: Paywall Route & Root Layout Update

**Files:**
- Create: `app/paywall.tsx`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Create paywall route**

`app/paywall.tsx`:

```tsx
import { useRouter } from 'expo-router';

import { Paywall } from '@features/premium/components';

export default function PaywallScreen() {
  const router = useRouter();

  return <Paywall onClose={() => router.back()} />;
}
```

- [ ] **Step 2: Update root layout**

In `app/_layout.tsx`, add import:
```typescript
import { initPremium } from '@services/premium';
```

Inside the `useEffect` that runs when `fontsLoaded` is true, add `initPremium()` call BEFORE `SplashScreen.hideAsync()`:

```typescript
useEffect(() => {
  if (fontsLoaded) {
    const completed = storageService.isOnboardingCompleted();
    setOnboardingDone(completed);
    initPremium();
    setIsReady(true);
    SplashScreen.hideAsync();
  }
}, [fontsLoaded]);
```

Also add the paywall Screen in the Stack (after the profile Screen):

```tsx
<Stack.Screen
  name="paywall"
  options={{
    presentation: 'modal',
    headerShown: false,
  }}
/>
```

- [ ] **Step 3: Commit**

```bash
git add app/paywall.tsx app/_layout.tsx
git commit -m "feat: add paywall route and init RevenueCat at boot"
```

---

## Task 6: Premium Gate — All Screens Update

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/tarot.tsx`
- Modify: `app/(tabs)/discover.tsx`
- Modify: `app/profile.tsx`

- [ ] **Step 1: Update Home screen**

In `app/(tabs)/index.tsx`:

Add import:
```typescript
import { usePremium } from '@services/premium';
import { useInterstitialAd } from '@services/ads';
```

Inside `HomeScreen`, add after `const { showAd } = useRewardedAd();`:
```typescript
const { isPremium } = usePremium();
const { maybeShowInterstitial } = useInterstitialAd();
```

Change initial state for stars/sections/affinity — if premium, start unlocked:
```typescript
const [starsUnlocked, setStarsUnlocked] = useState(isPremium || usage.freeHoroscopeRead);
const [unlockedSections, setUnlockedSections] = useState<Record<HoroscopeSection, boolean>>({
  love: isPremium,
  work: isPremium,
  luck: isPremium,
});
const [affinityUnlocked, setAffinityUnlocked] = useState(isPremium);
```

In the JSX, wrap the `BannerAd` with a premium check:
```tsx
{!isPremium && (
  <View style={styles.bannerContainer}>
    <BannerAd unitId={TestIds.ADAPTIVE_BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
  </View>
)}
```

- [ ] **Step 2: Update Tarot screen**

In `app/(tabs)/tarot.tsx`:

Add import:
```typescript
import { usePremium } from '@services/premium';
```

Inside `TarotScreen`, add:
```typescript
const { isPremium } = usePremium();
```

Change `unlockedModes` initial state:
```typescript
const [unlockedModes, setUnlockedModes] = useState<TarotMode[]>(
  isPremium ? ["daily", "three_card", "love"] : ["daily"]
);
```

Update `lockedModes` computation:
```typescript
const lockedModes = isPremium ? [] : (["three_card", "love"] as TarotMode[]).filter(
  (m) => !unlockedModes.includes(m)
);
```

- [ ] **Step 3: Update Discover screen**

In `app/(tabs)/discover.tsx`:

Add import:
```typescript
import { usePremium } from '@services/premium';
```

Inside `DiscoverScreen`, add:
```typescript
const { isPremium } = usePremium();
```

Update `handleSpinPress` — skip ad if premium:
```typescript
const handleSpinPress = async () => {
  if (wheel.hasSpunToday && !isPremium) {
    const rewarded = await showAd();
    if (!rewarded) return;
  }
  wheel.startSpin();
};
```

Update `handleScratchSelect` — skip ad if premium:
```typescript
const handleScratchSelect = async (index: number) => {
  if (scratch.hasScratchedToday && !isPremium) {
    const rewarded = await showAd();
    if (!rewarded) return;
  }
  scratch.selectCard(index);
};
```

- [ ] **Step 4: Update Profile screen**

In `app/profile.tsx`:

Add imports:
```typescript
import { usePremium } from '@services/premium';
import { PremiumBanner } from '@features/premium/components';
```

Inside `ProfileScreen`, add:
```typescript
const { isPremium } = usePremium();
```

Update `ReadingCalendar` maxDaysBack:
```tsx
<ReadingCalendar
  daysWithEntries={daysWithEntries}
  selectedDate={selectedDate}
  onSelectDate={setSelectedDate}
  maxDaysBack={isPremium ? 30 : 7}
/>
```

Replace the `Button` premium placeholder at the bottom with:
```tsx
{!isPremium && <PremiumBanner />}
```

- [ ] **Step 5: Commit**

```bash
git add app/\(tabs\)/index.tsx app/\(tabs\)/tarot.tsx app/\(tabs\)/discover.tsx app/profile.tsx
git commit -m "feat: add premium gates to Home, Tarot, Discover, and Profile screens"
```

---

## Post-Plan Verification

```bash
# Run all tests
npx jest

# Type check
npx tsc --noEmit
```

All must pass. Premium users see all content unlocked with zero ads. Free users see rewarded ad gates and banner/interstitial ads. Paywall is accessible from profile.
