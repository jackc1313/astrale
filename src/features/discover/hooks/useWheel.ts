import { useEffect, useState, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@services/firebase";
import { storage, storageService } from "@services/storage";
import type { WheelItem } from "../types";

const CACHE_KEY_PREFIX = "wheel.cache";
const today = (): string => new Date().toISOString().split("T")[0];

export const useWheel = () => {
  const [items, setItems] = useState<WheelItem[]>([]);
  const [result, setResult] = useState<WheelItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = today();
  const usage = storageService.getDailyUsage(todayStr);
  const [hasSpunToday, setHasSpunToday] = useState(usage.wheelSpun);

  useEffect(() => {
    const fetchContent = async () => {
      const cacheKey = `${CACHE_KEY_PREFIX}.${todayStr}`;
      const cached = storage.getString(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached) as string[];
        setItems(parsed.slice(0, 8).map((text, i) => ({
          index: i,
          label: text.split(" ").slice(0, 3).join(" "),
          fullText: text,
        })));
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "daily_content", todayStr);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const wheel = (data.wheel ?? []) as string[];
          storage.set(cacheKey, JSON.stringify(wheel));
          setItems(wheel.slice(0, 8).map((text, i) => ({
            index: i,
            label: text.split(" ").slice(0, 3).join(" "),
            fullText: text,
          })));
        }
      } catch (err) {
        console.error("Failed to fetch wheel content:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [todayStr]);

  const selectResult = useCallback((angle: number) => {
    if (items.length === 0) return;
    const segmentAngle = 360 / items.length;
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const index = Math.floor(normalizedAngle / segmentAngle);
    const selected = items[index % items.length];
    setResult(selected);
    setIsSpinning(false);

    if (!hasSpunToday) {
      setHasSpunToday(true);
      const usage = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({ ...usage, wheelSpun: true });
    }
  }, [items, hasSpunToday, todayStr]);

  const startSpin = () => {
    setResult(null);
    setIsSpinning(true);
  };

  return {
    items, result, isSpinning, isLoading, hasSpunToday,
    startSpin, selectResult,
  };
};
