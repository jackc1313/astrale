import { useEffect, useState } from "react";

import { storage, storageService } from "@services/storage";
import type { StoneReading } from "../types";

const CACHE_KEY_PREFIX = "scratch.cache.v2";
const today = (): string => new Date().toISOString().split("T")[0];

const STONES: StoneReading[] = [
  { name: "Ametista", icon: "diamond-stone", properties: "protezione, intuizione, calma", message: "" },
  { name: "Quarzo Rosa", icon: "heart-outline", properties: "amore, guarigione, armonia", message: "" },
  { name: "Ossidiana", icon: "shield-outline", properties: "forza, verita', trasformazione", message: "" },
  { name: "Lapislazzuli", icon: "eye-outline", properties: "saggezza, consapevolezza, chiarezza", message: "" },
  { name: "Citrino", icon: "white-balance-sunny", properties: "abbondanza, gioia, energia", message: "" },
  { name: "Turchese", icon: "water-outline", properties: "comunicazione, protezione, serenita'", message: "" },
  { name: "Agata", icon: "circle-outline", properties: "equilibrio, stabilita', radicamento", message: "" },
  { name: "Corniola", icon: "fire", properties: "coraggio, passione, vitalita'", message: "" },
  { name: "Giada", icon: "leaf", properties: "fortuna, prosperita', armonia", message: "" },
  { name: "Pietra di Luna", icon: "moon-waning-crescent", properties: "intuizione, femminilita', cicli", message: "" },
  { name: "Opale", icon: "creation", properties: "creativita', ispirazione, magia", message: "" },
  { name: "Rubino", icon: "heart", properties: "passione, coraggio, amore ardente", message: "" },
  { name: "Smeraldo", icon: "rhombus", properties: "rinascita, amore, visione", message: "" },
  { name: "Ambra", icon: "flare", properties: "calore, purificazione, luce interiore", message: "" },
  { name: "Tormalina Nera", icon: "shield", properties: "protezione, schermatura, forza", message: "" },
  { name: "Acquamarina", icon: "waves", properties: "calma, coraggio, comunicazione", message: "" },
  { name: "Occhio di Tigre", icon: "eye", properties: "determinazione, focus, protezione", message: "" },
  { name: "Fluorite", icon: "hexagon-outline", properties: "chiarezza mentale, ordine, concentrazione", message: "" },
  { name: "Selenite", icon: "star-outline", properties: "purificazione, pace, luce divina", message: "" },
  { name: "Malachite", icon: "spa", properties: "trasformazione, guarigione, crescita", message: "" },
];

const getStoneMessage = (stone: StoneReading, sign: string): string => {
  const messages: Record<string, string[]> = {
    aries: ["La tua energia ardente trova equilibrio", "Il fuoco interiore si amplifica", "Una nuova forza ti attraversa"],
    taurus: ["La stabilita' diventa il tuo superpotere", "Radici profonde portano frutti", "La pazienza viene premiata"],
    gemini: ["La dualita' trova armonia", "Le parole giuste arrivano al momento giusto", "La curiosita' ti guida"],
    cancer: ["Le emozioni si trasformano in saggezza", "La tua sensibilita' e' un dono", "L'intuito ti protegge"],
    leo: ["La tua luce interiore brilla piu' forte", "Il coraggio apre nuove porte", "Sei nato per risplendere"],
    virgo: ["L'ordine nasce dal caos", "La precisione e' la tua forza", "Ogni dettaglio ha un significato"],
    libra: ["L'equilibrio porta bellezza", "L'armonia ti circonda", "La giustizia e' dalla tua parte"],
    scorpio: ["La trasformazione e' il tuo potere", "Il mistero si svela", "La profondita' ti arricchisce"],
    sagittarius: ["L'avventura chiama il tuo nome", "La verita' ti libera", "L'orizzonte si espande"],
    capricorn: ["La disciplina porta risultati", "La vetta e' piu' vicina", "Il tempo e' il tuo alleato"],
    aquarius: ["L'innovazione nasce da te", "Il futuro ti sorride", "La liberta' e' la tua strada"],
    pisces: ["I sogni diventano realta'", "L'empatia e' la tua forza", "Le correnti ti guidano"],
  };
  const signMessages = messages[sign] ?? messages.aries;
  const idx = stone.name.length % signMessages.length;
  return `${signMessages[idx]} con ${stone.name}. ${stone.properties.split(", ")[0].charAt(0).toUpperCase() + stone.properties.split(", ")[0].slice(1)} e ${stone.properties.split(", ")[1]} accompagnano la tua giornata.`;
};

export const useScratch = () => {
  const [selectedStone, setSelectedStone] = useState<StoneReading | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const todayStr = today();
  const usage = storageService.getDailyUsage(todayStr);
  const [hasScratchedToday, setHasScratchedToday] = useState(usage.scratchUsed);

  const pickRandomStone = (): StoneReading => {
    const profile = storageService.getUserProfile();
    const sign = profile?.zodiacSign ?? "aries";
    const randomIndex = Math.floor(Math.random() * STONES.length);
    const stone = STONES[randomIndex];
    return {
      ...stone,
      message: getStoneMessage(stone, sign),
    };
  };

  const selectCard = (index: number) => {
    setSelectedIndex(index);
    setSelectedStone(pickRandomStone());
  };

  const reveal = () => {
    setIsRevealed(true);
    if (selectedStone) {
      storageService.addReadingEntry('scratch', `${selectedStone.name} — ${selectedStone.properties}`);
    }
    if (!hasScratchedToday) {
      setHasScratchedToday(true);
      const usage = storageService.getDailyUsage(todayStr);
      storageService.setDailyUsage({ ...usage, scratchUsed: true });
    }
  };

  const reset = () => {
    setSelectedIndex(null);
    setSelectedStone(null);
    setIsRevealed(false);
  };

  return {
    selectedStone, selectedIndex, isRevealed, isLoading: false, hasScratchedToday,
    selectCard, reveal, reset,
  };
};
