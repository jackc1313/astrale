import { useCallback, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "@services/firebase";
import { storage, storageService } from "@services/storage";
import type {
  TarotCard,
  TarotMode,
  DrawnCard,
  CardOrientation,
  TarotInterpretation,
} from "../types";
import { majorArcana } from "../data/majorArcana";

const TODAY_DRAW_KEY = "tarot.todayDraw";
const today = (): string => new Date().toISOString().split("T")[0];

type SavedDraw = {
  date: string;
  cardId: string;
  orientation: CardOrientation;
};

export const useTarot = () => {
  const [mode, setMode] = useState<TarotMode>("daily");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState<TarotInterpretation | null>(null);
  const [isDrawn, setIsDrawn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alreadyDrawnToday, setAlreadyDrawnToday] = useState(false);

  useEffect(() => {
    const saved = storage.getString(TODAY_DRAW_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as SavedDraw;
      if (parsed.date === today()) {
        const card = majorArcana.find((c) => c.id === parsed.cardId);
        if (card) {
          setDrawnCards([{ card, orientation: parsed.orientation }]);
          setAlreadyDrawnToday(true);
          fetchInterpretation(card.id);
        }
      }
    }
  }, []);

  const fetchInterpretation = async (cardId: string) => {
    const profile = storageService.getUserProfile();
    if (!profile) return;

    try {
      const docRef = doc(db, "tarot_interpretations", cardId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const contextual = data.contextual?.[profile.zodiacSign];
        if (contextual) {
          setInterpretation(contextual as TarotInterpretation);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tarot interpretation:", err);
    }
  };

  const getCardCount = (): number => {
    return mode === "daily" ? 1 : 3;
  };

  const drawCards = useCallback(() => {
    if (mode === "daily" && alreadyDrawnToday) return;

    setIsLoading(true);
    const count = mode === "daily" ? 1 : 3;
    const shuffled = [...majorArcana].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const drawn: DrawnCard[] = selected.map((card) => ({
      card,
      orientation: (Math.random() > 0.5 ? "upright" : "reversed") as CardOrientation,
    }));

    setDrawnCards(drawn);
    setIsDrawn(true);
    setIsLoading(false);

    if (mode === "daily") {
      const first = drawn[0];
      const savedDraw: SavedDraw = {
        date: today(),
        cardId: first.card.id,
        orientation: first.orientation,
      };
      storage.set(TODAY_DRAW_KEY, JSON.stringify(savedDraw));

      const todayStr = today();
      const usage = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({ ...usage, tarotCardDrawn: true });

      setAlreadyDrawnToday(true);
    }

    drawn.forEach((d) => {
      storageService.addCollectedCard(d.card.id);
    });

    fetchInterpretation(drawn[0].card.id);
  }, [mode, alreadyDrawnToday]);

  const reset = () => {
    setDrawnCards([]);
    setInterpretation(null);
    setIsDrawn(false);
  };

  return {
    mode, setMode, drawnCards, interpretation, isDrawn, isLoading,
    alreadyDrawnToday, drawCards, reset, getCardCount,
  };
};
