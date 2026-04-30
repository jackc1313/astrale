export type DiscoverTab = "wheel" | "scratch";

export type WheelItem = {
  index: number;
  category: string;
  icon: string;
  label: string;
  fullText: string;
  tip: string;
  bestMoment: string;
};

export type StoneReading = {
  name: string;
  icon: string;
  properties: string;
  message: string;
};
