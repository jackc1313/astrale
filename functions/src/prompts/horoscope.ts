const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer",
  "leo", "virgo", "libra", "scorpio",
  "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

const SIGN_NAMES_IT: Record<string, string> = {
  aries: "Ariete", taurus: "Toro", gemini: "Gemelli", cancer: "Cancro",
  leo: "Leone", virgo: "Vergine", libra: "Bilancia", scorpio: "Scorpione",
  sagittarius: "Sagittario", capricorn: "Capricorno", aquarius: "Acquario", pisces: "Pesci",
};

export const buildHoroscopePrompt = (sign: string, date: string): string => {
  const signName = SIGN_NAMES_IT[sign] ?? sign;

  return `Sei un astrologo esperto. Genera l'oroscopo giornaliero per il segno ${signName} per il giorno ${date}.

REGOLE:
- Scrivi in italiano
- Tono: positivo ma non banale, specifico, mai catastrofico
- Ogni sezione deve essere 50-80 parole
- Le stelle vanno da 1 a 5
- Il numero fortunato e' tra 1 e 99
- Il colore fortunato e' un colore in italiano
- La compatibilita' e' un segno zodiacale (in inglese lowercase: aries, taurus, etc.)

Rispondi SOLO con questo JSON:
{
  "general": "testo oroscopo generale",
  "love": "testo oroscopo amore",
  "work": "testo oroscopo lavoro",
  "luck": "testo oroscopo fortuna",
  "stars": { "love": 4, "work": 3, "luck": 5 },
  "luckyNumber": 7,
  "luckyColor": "blu",
  "compatibility": "scorpio"
}`;
};

export { ZODIAC_SIGNS };
