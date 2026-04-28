import { useCallback, useEffect, useState } from "react";

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
  interpretation?: TarotInterpretation;
};

const loadSavedDraw = (): { cards: DrawnCard[]; drawn: boolean; interpretation: TarotInterpretation | null } => {
  const saved = storage.getString(TODAY_DRAW_KEY);
  if (saved) {
    const parsed = JSON.parse(saved) as SavedDraw;
    if (parsed.date === today()) {
      const card = majorArcana.find((c) => c.id === parsed.cardId);
      if (card) {
        return {
          cards: [{ card, orientation: parsed.orientation }],
          drawn: true,
          interpretation: parsed.interpretation ?? null,
        };
      }
    }
  }
  return { cards: [], drawn: false, interpretation: null };
};

export const useTarot = () => {
  const savedDraw = loadSavedDraw();
  const [mode, setMode] = useState<TarotMode>("daily");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>(savedDraw.cards);
  const [interpretation, setInterpretation] = useState<TarotInterpretation | null>(savedDraw.interpretation);
  const [isDrawn, setIsDrawn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alreadyDrawnToday, setAlreadyDrawnToday] = useState(savedDraw.drawn);

  useEffect(() => {
    if (savedDraw.drawn && savedDraw.cards.length > 0) {
      fetchInterpretation(savedDraw.cards[0].card.id);
    }
  }, []);

  const fetchInterpretation = async (cardId: string) => {
    const profile = storageService.getUserProfile();
    if (!profile) return;

    try {
      const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/tarot_interpretations/${cardId}`;
      const response = await fetch(url);
      const json = await response.json();

      if (json.fields?.contextual?.mapValue?.fields?.[profile.zodiacSign]) {
        const signData = json.fields.contextual.mapValue.fields[profile.zodiacSign].mapValue.fields;
        const interp: TarotInterpretation = {
          love: signData.love?.stringValue ?? "",
          work: signData.work?.stringValue ?? "",
          general: signData.general?.stringValue ?? "",
        };
        setInterpretation(interp);

        const saved = storage.getString(TODAY_DRAW_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as SavedDraw;
          parsed.interpretation = interp;
          storage.set(TODAY_DRAW_KEY, JSON.stringify(parsed));
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
    storageService.addReadingEntry('tarot', drawn[0].card.id);
  }, [mode, alreadyDrawnToday]);

  const reset = () => {
    const saved = loadSavedDraw();
    setDrawnCards(saved.drawn ? saved.cards : []);
    setInterpretation(saved.interpretation);
    setIsDrawn(false);
  };

  return {
    mode, setMode, drawnCards, interpretation, isDrawn, isLoading,
    alreadyDrawnToday, drawCards, reset, getCardCount,
  };
};
