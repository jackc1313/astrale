import type { TarotCard } from "../types";

export const majorArcana: TarotCard[] = [
  { id: "the_fool", number: 0, nameKey: "tarot.cards.the_fool", uprightKey: "tarot.meanings.the_fool_upright", reversedKey: "tarot.meanings.the_fool_reversed", symbol: "\u2606" },
  { id: "the_magician", number: 1, nameKey: "tarot.cards.the_magician", uprightKey: "tarot.meanings.the_magician_upright", reversedKey: "tarot.meanings.the_magician_reversed", symbol: "\u2605" },
  { id: "the_high_priestess", number: 2, nameKey: "tarot.cards.the_high_priestess", uprightKey: "tarot.meanings.the_high_priestess_upright", reversedKey: "tarot.meanings.the_high_priestess_reversed", symbol: "\u263D" },
  { id: "the_empress", number: 3, nameKey: "tarot.cards.the_empress", uprightKey: "tarot.meanings.the_empress_upright", reversedKey: "tarot.meanings.the_empress_reversed", symbol: "\u2640" },
  { id: "the_emperor", number: 4, nameKey: "tarot.cards.the_emperor", uprightKey: "tarot.meanings.the_emperor_upright", reversedKey: "tarot.meanings.the_emperor_reversed", symbol: "\u2642" },
  { id: "the_hierophant", number: 5, nameKey: "tarot.cards.the_hierophant", uprightKey: "tarot.meanings.the_hierophant_upright", reversedKey: "tarot.meanings.the_hierophant_reversed", symbol: "\u2648" },
  { id: "the_lovers", number: 6, nameKey: "tarot.cards.the_lovers", uprightKey: "tarot.meanings.the_lovers_upright", reversedKey: "tarot.meanings.the_lovers_reversed", symbol: "\u2665" },
  { id: "the_chariot", number: 7, nameKey: "tarot.cards.the_chariot", uprightKey: "tarot.meanings.the_chariot_upright", reversedKey: "tarot.meanings.the_chariot_reversed", symbol: "\u2604" },
  { id: "strength", number: 8, nameKey: "tarot.cards.strength", uprightKey: "tarot.meanings.strength_upright", reversedKey: "tarot.meanings.strength_reversed", symbol: "\u2654" },
  { id: "the_hermit", number: 9, nameKey: "tarot.cards.the_hermit", uprightKey: "tarot.meanings.the_hermit_upright", reversedKey: "tarot.meanings.the_hermit_reversed", symbol: "\u2618" },
  { id: "wheel_of_fortune", number: 10, nameKey: "tarot.cards.wheel_of_fortune", uprightKey: "tarot.meanings.wheel_of_fortune_upright", reversedKey: "tarot.meanings.wheel_of_fortune_reversed", symbol: "\u2609" },
  { id: "justice", number: 11, nameKey: "tarot.cards.justice", uprightKey: "tarot.meanings.justice_upright", reversedKey: "tarot.meanings.justice_reversed", symbol: "\u2696" },
  { id: "the_hanged_man", number: 12, nameKey: "tarot.cards.the_hanged_man", uprightKey: "tarot.meanings.the_hanged_man_upright", reversedKey: "tarot.meanings.the_hanged_man_reversed", symbol: "\u2629" },
  { id: "death", number: 13, nameKey: "tarot.cards.death", uprightKey: "tarot.meanings.death_upright", reversedKey: "tarot.meanings.death_reversed", symbol: "\u2620" },
  { id: "temperance", number: 14, nameKey: "tarot.cards.temperance", uprightKey: "tarot.meanings.temperance_upright", reversedKey: "tarot.meanings.temperance_reversed", symbol: "\u2652" },
  { id: "the_devil", number: 15, nameKey: "tarot.cards.the_devil", uprightKey: "tarot.meanings.the_devil_upright", reversedKey: "tarot.meanings.the_devil_reversed", symbol: "\u2625" },
  { id: "the_tower", number: 16, nameKey: "tarot.cards.the_tower", uprightKey: "tarot.meanings.the_tower_upright", reversedKey: "tarot.meanings.the_tower_reversed", symbol: "\u26A1" },
  { id: "the_star", number: 17, nameKey: "tarot.cards.the_star", uprightKey: "tarot.meanings.the_star_upright", reversedKey: "tarot.meanings.the_star_reversed", symbol: "\u2B50" },
  { id: "the_moon", number: 18, nameKey: "tarot.cards.the_moon", uprightKey: "tarot.meanings.the_moon_upright", reversedKey: "tarot.meanings.the_moon_reversed", symbol: "\u263E" },
  { id: "the_sun", number: 19, nameKey: "tarot.cards.the_sun", uprightKey: "tarot.meanings.the_sun_upright", reversedKey: "tarot.meanings.the_sun_reversed", symbol: "\u2600" },
  { id: "judgement", number: 20, nameKey: "tarot.cards.judgement", uprightKey: "tarot.meanings.judgement_upright", reversedKey: "tarot.meanings.judgement_reversed", symbol: "\u2721" },
  { id: "the_world", number: 21, nameKey: "tarot.cards.the_world", uprightKey: "tarot.meanings.the_world_upright", reversedKey: "tarot.meanings.the_world_reversed", symbol: "\u2295" },
];

const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

export const getRomanNumeral = (n: number): string => ROMAN[n] ?? String(n);
