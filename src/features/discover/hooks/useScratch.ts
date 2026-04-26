import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@services/firebase";
import { storage, storageService } from "@services/storage";

const CACHE_KEY_PREFIX = "scratch.cache";
const today = (): string => new Date().toISOString().split("T")[0];

export const useScratch = () => {
  const [contents, setContents] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = today();
  const usage = storageService.getDailyUsage(todayStr);
  const [hasScratchedToday, setHasScratchedToday] = useState(usage.scratchUsed);

  useEffect(() => {
    const fetchContent = async () => {
      const cacheKey = `${CACHE_KEY_PREFIX}.${todayStr}`;
      const cached = storage.getString(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached) as string[];
        setContents(parsed.slice(0, 3));
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "daily_content", todayStr);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const scratch = (data.scratch ?? []) as string[];
          storage.set(cacheKey, JSON.stringify(scratch));
          setContents(scratch.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch scratch content:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [todayStr]);

  const selectCard = (index: number) => { setSelectedIndex(index); };

  const reveal = () => {
    setIsRevealed(true);
    if (!hasScratchedToday) {
      setHasScratchedToday(true);
      const usage = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({ ...usage, scratchUsed: true });
    }
  };

  const reset = () => { setSelectedIndex(null); setIsRevealed(false); };

  return {
    contents, selectedIndex, isRevealed, isLoading, hasScratchedToday,
    selectCard, reveal, reset,
  };
};
