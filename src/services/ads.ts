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
