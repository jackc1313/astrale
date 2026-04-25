export const colors = {
  black: '#0d0d0d',
  deepPurple: '#1a1028',
  gold: '#d4af37',
  pearlWhite: '#f5f0e8',
  goldMuted: 'rgba(212, 175, 55, 0.15)',
  goldBorder: 'rgba(212, 175, 55, 0.3)',
  whiteOverlay: 'rgba(245, 240, 232, 0.08)',
  whiteBorder: 'rgba(245, 240, 232, 0.1)',
  whiteSubtle: 'rgba(245, 240, 232, 0.6)',
  whiteDim: 'rgba(245, 240, 232, 0.5)',
  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;
