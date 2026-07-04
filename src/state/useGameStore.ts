import { create } from 'zustand'

export type Screen = 'title' | 'game'

interface GameState {
  screen: Screen
  engineFrame: number
  setScreen: (s: Screen) => void
  startGame: () => void
  setEngineFrame: (n: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'title',
  engineFrame: 0,
  setScreen: (screen) => set({ screen }),
  startGame: () => set({ screen: 'game', engineFrame: 0 }),
  setEngineFrame: (engineFrame) => set({ engineFrame }),
}))
