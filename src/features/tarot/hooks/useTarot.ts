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

const DRAW_KEY_PREFIX = "tarot.draw";
const today = (): string => new Date().toISOString().split("T")[0];

type SavedDraw = {
  date: string;
  cards: { cardId: string; orientation: CardOrientation }[];
  interpretation?: TarotInterpretation;
};

const drawKey = (mode: TarotMode): string => `${DRAW_KEY_PREFIX}.${mode}`;

export const loadSavedDraw = (mode: TarotMode): { cards: DrawnCard[]; drawn: boolean; interpretation: TarotInterpretation | null } => {
  const saved = storage.getString(drawKey(mode));
  if (saved) {
    const parsed = JSON.parse(saved) as SavedDraw;
    if (parsed.date === today()) {
      const cards: DrawnCard[] = [];
      for (const entry of parsed.cards) {
        const card = majorArcana.find((c) => c.id === entry.cardId);
        if (card) cards.push({ card, orientation: entry.orientation });
      }
      if (cards.length > 0) {
        return { cards, drawn: true, interpretation: parsed.interpretation ?? null };
      }
    }
  }
  return { cards: [], drawn: false, interpretation: null };
};

export const useTarot = () => {
  const [mode, setMode] = useState<TarotMode>("daily");
  const initialDraw = loadSavedDraw("daily");
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>(initialDraw.cards);
  const [interpretation, setInterpretation] = useState<TarotInterpretation | null>(initialDraw.interpretation);
  const [isDrawn, setIsDrawn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alreadyDrawnToday, setAlreadyDrawnToday] = useState(initialDraw.drawn);

  useEffect(() => {
    const saved = loadSavedDraw(mode);
    setDrawnCards(saved.cards);
    setInterpretation(saved.interpretation);
    setIsDrawn(false);
    setAlreadyDrawnToday(saved.drawn);

    if (saved.drawn && saved.cards.length > 0) {
      fetchInterpretation(saved.cards[0].card.id);
    }
  }, [mode]);

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

        const saved = storage.getString(drawKey(mode));
        if (saved) {
          const parsed = JSON.parse(saved) as SavedDraw;
          parsed.interpretation = interp;
          storage.set(drawKey(mode), JSON.stringify(parsed));
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
    if (alreadyDrawnToday) return;

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

    const savedDraw: SavedDraw = {
      date: today(),
      cards: drawn.map((d) => ({ cardId: d.card.id, orientation: d.orientation })),
    };
    storage.set(drawKey(mode), JSON.stringify(savedDraw));

    const todayStr = today();
    const usage = storageService.getDailyUsage(todayStr);
    storageService.setDailyUsage({ ...usage, tarotCardDrawn: true });

    setAlreadyDrawnToday(true);

    drawn.forEach((d) => {
      storageService.addCollectedCard(d.card.id);
    });

    fetchInterpretation(drawn[0].card.id);
    storageService.addReadingEntry('tarot', drawn[0].card.id);
  }, [mode, alreadyDrawnToday]);

  const reset = () => {
    const saved = loadSavedDraw(mode);
    setDrawnCards(saved.drawn ? saved.cards : []);
    setInterpretation(saved.interpretation);
    setAlreadyDrawnToday(saved.drawn);
    setIsDrawn(false);
  };

  return {
    mode, setMode, drawnCards, interpretation, isDrawn, isLoading,
    alreadyDrawnToday, drawCards, reset, getCardCount,
  };
};
