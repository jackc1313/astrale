const MAJOR_ARCANA = [
  "the_fool", "the_magician", "the_high_priestess", "the_empress",
  "the_emperor", "the_hierophant", "the_lovers", "the_chariot",
  "strength", "the_hermit", "wheel_of_fortune", "justice",
  "the_hanged_man", "death", "temperance", "the_devil",
  "the_tower", "the_star", "the_moon", "the_sun",
  "judgement", "the_world",
] as const;

const CARD_NAMES_IT: Record<string, string> = {
  the_fool: "Il Matto", the_magician: "Il Mago",
  the_high_priestess: "La Papessa", the_empress: "L'Imperatrice",
  the_emperor: "L'Imperatore", the_hierophant: "Il Papa",
  the_lovers: "Gli Amanti", the_chariot: "Il Carro",
  strength: "La Forza", the_hermit: "L'Eremita",
  wheel_of_fortune: "La Ruota della Fortuna", justice: "La Giustizia",
  the_hanged_man: "L'Appeso", death: "La Morte",
  temperance: "La Temperanza", the_devil: "Il Diavolo",
  the_tower: "La Torre", the_star: "La Stella",
  the_moon: "La Luna", the_sun: "Il Sole",
  judgement: "Il Giudizio", the_world: "Il Mondo",
};

const SIGN_NAMES_IT: Record<string, string> = {
  aries: "Ariete", taurus: "Toro", gemini: "Gemelli", cancer: "Cancro",
  leo: "Leone", virgo: "Vergine", libra: "Bilancia", scorpio: "Scorpione",
  sagittarius: "Sagittario", capricorn: "Capricorno", aquarius: "Acquario", pisces: "Pesci",
};

export const buildTarotPrompt = (cardId: string, sign: string): string => {
  const cardName = CARD_NAMES_IT[cardId] ?? cardId;
  const signName = SIGN_NAMES_IT[sign] ?? sign;

  return `Sei un esperto di tarocchi. Genera le interpretazioni della carta "${cardName}" per il segno ${signName}.

REGOLE:
- Scrivi in italiano
- Tono: mistico ma accessibile, mai catastrofico
- Ogni interpretazione deve essere 40-60 parole
- Le interpretazioni devono essere personalizzate per il segno

Rispondi SOLO con questo JSON:
{
  "love": "interpretazione per amore",
  "work": "interpretazione per lavoro",
  "general": "interpretazione generale"
}`;
};

export const buildTarotBasePrompt = (cardId: string): string => {
  const cardName = CARD_NAMES_IT[cardId] ?? cardId;

  return `Sei un esperto di tarocchi. Genera il significato della carta "${cardName}".

REGOLE:
- Scrivi in italiano
- Tono: mistico ma accessibile
- Significato dritto: 30-50 parole, positivo/costruttivo
- Significato rovesciato: 30-50 parole, sfida/attenzione (mai catastrofico)

Rispondi SOLO con questo JSON:
{
  "name": "${cardName}",
  "upright": "significato dritto",
  "reversed": "significato rovesciato"
}`;
};

export { MAJOR_ARCANA, CARD_NAMES_IT };
