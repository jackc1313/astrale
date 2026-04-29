import { useEffect, useState } from "react";

import { storage, storageService } from "@services/storage";
import type { Horoscope } from "../types";

const today = (): string => new Date().toISOString().split("T")[0];

const CACHE_KEY_PREFIX = "horoscope.cache";

const getCacheKey = (date: string, sign: string): string =>
  `${CACHE_KEY_PREFIX}.${date}.${sign}`;

const parseFirestoreValue = (val: any): any => {
  if (val?.stringValue !== undefined) return val.stringValue;
  if (val?.integerValue !== undefined) return parseInt(val.integerValue);
  if (val?.doubleValue !== undefined) return val.doubleValue;
  if (val?.mapValue?.fields) {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields)) {
      result[k] = parseFirestoreValue(v);
    }
    return result;
  }
  return null;
};

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
        const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/horoscopes/${date}/signs/${sign}`;
        const response = await fetch(url);
        const json = await response.json();

        if (json.fields) {
          const data: Horoscope = {
            general: parseFirestoreValue(json.fields.general) ?? "",
            love: parseFirestoreValue(json.fields.love) ?? "",
            work: parseFirestoreValue(json.fields.work) ?? "",
            luck: parseFirestoreValue(json.fields.luck) ?? "",
            stars: parseFirestoreValue(json.fields.stars) ?? { love: 3, work: 3, luck: 3 },
            luckyNumber: parseFirestoreValue(json.fields.luckyNumber) ?? 7,
            luckyColor: parseFirestoreValue(json.fields.luckyColor) ?? "",
            compatibility: parseFirestoreValue(json.fields.compatibility) ?? "aries",
          };
          storage.set(cacheKey, JSON.stringify(data));
          setHoroscope(data);
          storageService.addReadingEntry('horoscope', data.general.slice(0, 80));
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
