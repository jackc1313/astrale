import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@services/firebase";
import { storage, storageService } from "@services/storage";
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
