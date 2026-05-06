export type TarotCard = {
  id: string;
  number: number;
  nameKey: string;
  uprightKey: string;
  reversedKey: string;
  icon: string;
};

export type TarotMode = "daily" | "three_card" | "love";

export type CardOrientation = "upright" | "reversed";

export type DrawnCard = {
  card: TarotCard;
  orientation: CardOrientation;
};

export type TarotInterpretation = {
  love: string;
  work: string;
  general: string;
};

export type ThreeCardLabels = {
  daily: never;
  three_card: ["tarot.past", "tarot.present", "tarot.future"];
  love: ["tarot.you", "tarot.partner", "tarot.relationship"];
};
