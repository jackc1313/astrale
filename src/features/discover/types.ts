export type DiscoverTab = "wheel" | "scratch";

export type WheelItem = {
  index: number;
  category: string;
  emoji: string;
  label: string;
  fullText: string;
  tip: string;
  bestMoment: string;
};

export type StoneReading = {
  name: string;
  emoji: string;
  properties: string;
  message: string;
};
