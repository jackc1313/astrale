export type DiscoverTab = "wheel" | "scratch";

export type WheelItem = {
  index: number;
  label: string;
  fullText: string;
};

export type StoneReading = {
  name: string;
  emoji: string;
  properties: string;
  message: string;
};
