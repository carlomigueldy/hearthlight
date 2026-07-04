import { create } from 'zustand'

export type Screen = 'title' | 'game'

interface GameState {
  screen: Screen
  engineFrame: number
  dayTime: number
  setScreen: (s: Screen) => void
  startGame: () => void
  setEngineFrame: (n: number) => void
  setDayTime: (t: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'title',
  engineFrame: 0,
  dayTime: 0,
  setScreen: (screen) => set({ screen }),
  startGame: () => set({ screen: 'game', engineFrame: 0 }),
  setEngineFrame: (engineFrame) => set({ engineFrame }),
  setDayTime: (dayTime) => set({ dayTime }),
}))
