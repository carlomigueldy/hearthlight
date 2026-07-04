export const Palette = {
  water: '#2f8f8a',
  sand: '#e8d6a0',
  grass: '#7aa05a',
  forest: '#4f7a3f',
  rock: '#8a8278',
  amber: '#e6a23c',
  duskPink: '#e58a9a',
  sunWarm: '#ffd9a0',
  sunCool: '#9fb6c8',
  sky: '#bfe3e0',
} as const

export type PaletteColor = keyof typeof Palette
