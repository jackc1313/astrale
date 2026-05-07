import { useEffect, useState, useCallback } from "react";

import { storage, storageService } from "@services/storage";
import type { WheelItem } from "../types";

const CACHE_KEY_PREFIX = "wheel.cache.v2";
const today = (): string => new Date().toISOString().split("T")[0];

const CATEGORIES: { category: string; icon: string }[] = [
  { category: "Amore", icon: "heart-outline" },
  { category: "Lavoro", icon: "briefcase-outline" },
  { category: "Fortuna", icon: "clover" },
  { category: "Salute", icon: "spa-outline" },
  { category: "Energia", icon: "lightning-bolt" },
  { category: "Spirito", icon: "meditation" },
  { category: "Relazioni", icon: "account-group-outline" },
  { category: "Crescita", icon: "sprout" },
];

const TIPS: Record<string, string[]> = {
  Amore: ["Scrivi un messaggio a chi ami", "Fai un complimento sincero", "Dedica tempo di qualita'"],
  Lavoro: ["Organizza la scrivania", "Fai una lista di priorita'", "Prendi una pausa rigenerante"],
  Fortuna: ["Gioca il tuo numero fortunato", "Indossa il tuo colore portafortuna", "Fai qualcosa di nuovo"],
  Salute: ["Bevi un bicchiere d'acqua in piu'", "Fai 10 minuti di stretching", "Vai a dormire mezz'ora prima"],
  Energia: ["Medita per 5 minuti", "Fai una passeggiata all'aria aperta", "Ascolta la tua canzone preferita"],
  Spirito: ["Accendi una candela e rifletti", "Scrivi 3 cose per cui sei grato", "Osserva il cielo stasera"],
  Relazioni: ["Chiama qualcuno che non senti da tempo", "Ascolta senza giudicare", "Condividi un ricordo felice"],
  Crescita: ["Leggi 10 pagine di un libro", "Impara una parola nuova", "Scrivi un obiettivo per la settimana"],
};

const MOMENTS: Record<string, string[]> = {
  Amore: ["Sera, dopo cena", "Mattina presto, al risveglio", "Tardo pomeriggio"],
  Lavoro: ["Meta' mattina", "Dopo pranzo", "Prima serata"],
  Fortuna: ["Mezzogiorno in punto", "Ora del tramonto", "11:11"],
  Salute: ["Prima colazione", "Pausa pranzo", "Prima di dormire"],
  Energia: ["Alba", "Meta' pomeriggio", "Ora d'oro"],
  Spirito: ["Mezzanotte", "Alba", "Crepuscolo"],
  Relazioni: ["Ora di pranzo", "Tardo pomeriggio", "Sera"],
  Crescita: ["Prima mattina", "Dopo il caffe'", "Sera tardi"],
};

const MESSAGES: Record<string, string[]> = {
  Amore: [
    "Un gesto inaspettato scaldera' il tuo cuore oggi. Lascia spazio alla dolcezza.",
    "L'amore bussa in modi che non ti aspetti. Tieni gli occhi e il cuore aperti.",
    "Una connessione profonda si rafforza. Coltivala con attenzione e presenza.",
  ],
  Lavoro: [
    "Un'opportunita' si nasconde dietro una sfida. Affronta oggi cio' che hai rimandato.",
    "La tua creativita' e' al massimo. Proponi quell'idea che hai in mente da tempo.",
    "La collaborazione porta frutti inattesi. Non temere di chiedere aiuto.",
  ],
  Fortuna: [
    "Le stelle si allineano a tuo favore. Osa un po' piu' del solito oggi.",
    "Un numero, un colore, un incontro: presta attenzione ai segnali del destino.",
    "La fortuna premia chi agisce. Fai quel passo che rimandi da giorni.",
  ],
  Salute: [
    "Il tuo corpo chiede ascolto. Concediti un momento di cura e riposo.",
    "L'energia vitale scorre forte. Sfrutta questa giornata per muoverti e rigenerarti.",
    "Un piccolo cambiamento nelle abitudini porta grandi benefici. Inizia oggi.",
  ],
  Energia: [
    "Una carica cosmica ti attraversa. Usa questa energia per realizzare i tuoi sogni.",
    "L'universo ti ricarica. Sentiti libero di dire si' a nuove avventure.",
    "La tua aura brilla piu' forte del solito. Gli altri lo noteranno.",
  ],
  Spirito: [
    "Il silenzio interiore nasconde risposte. Dedica un momento alla meditazione.",
    "La tua intuizione e' particolarmente acuta oggi. Fidati del sesto senso.",
    "Un sogno recente contiene un messaggio importante. Rifletti sul suo significato.",
  ],
  Relazioni: [
    "Un chiarimento porta serenita'. Esprimi cio' che senti con sincerita'.",
    "Qualcuno del tuo passato potrebbe riapparire. Accogli senza giudicare.",
    "La generosita' torna indietro moltiplicata. Fai qualcosa di speciale per chi ami.",
  ],
  Crescita: [
    "Sei piu' vicino ai tuoi obiettivi di quanto pensi. Non mollare proprio ora.",
    "Una lezione importante si presenta oggi. Abbracciala come un dono.",
    "Il cambiamento che temi e' la porta verso la versione migliore di te.",
  ],
};

const generateWheelItems = (dateStr: string): WheelItem[] => {
  const seed = dateStr.split("-").reduce((a, b) => a + parseInt(b), 0);

  return CATEGORIES.map((cat, i) => {
    const msgs = MESSAGES[cat.category] ?? MESSAGES.Fortuna;
    const msgIndex = (seed + i * 7) % msgs.length;

    const tips = TIPS[cat.category] ?? TIPS.Fortuna;
    const moments = MOMENTS[cat.category] ?? MOMENTS.Fortuna;
    const tipIndex = (seed + i * 3) % tips.length;
    const momentIndex = (seed + i * 5) % moments.length;

    return {
      index: i,
      category: cat.category,
      icon: cat.icon,
      label: cat.category,
      fullText: msgs[msgIndex],
      tip: tips[tipIndex],
      bestMoment: moments[momentIndex],
    };
  });
};

export const useWheel = () => {
  const todayStr = today();
  const [items, setItems] = useState<WheelItem[]>([]);
  const [result, setResult] = useState<WheelItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const usage = storageService.getDailyUsage(todayStr);
  const [hasSpunToday, setHasSpunToday] = useState(usage.wheelSpun);

  useEffect(() => {
    const cacheKey = `${CACHE_KEY_PREFIX}.${todayStr}`;
    const cached = storage.getString(cacheKey);

    if (cached) {
      setItems(JSON.parse(cached) as WheelItem[]);
    } else {
      const generated = generateWheelItems(todayStr);
      storage.set(cacheKey, JSON.stringify(generated));
      setItems(generated);
    }

    setIsLoading(false);
  }, [todayStr]);

  const selectResult = useCallback((angle: number) => {
    if (items.length === 0) return;
    const segmentAngle = 360 / items.length;
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const index = Math.floor(normalizedAngle / segmentAngle);
    const selected = items[index % items.length];
    setResult(selected);
    storageService.addReadingEntry('wheel', `${selected.category}: ${selected.fullText.slice(0, 60)}`);
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

  const reset = () => {
    setResult(null);
  };

  return {
    items, result, isSpinning, isLoading, hasSpunToday,
    startSpin, selectResult, reset,
  };
};
