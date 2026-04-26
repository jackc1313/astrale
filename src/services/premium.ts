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
