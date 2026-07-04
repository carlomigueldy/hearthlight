import { create } from 'zustand'
import type { ItemStack } from '@/engine/inventory/Inventory'

export type Screen = 'title' | 'game'
export type Panel = 'none' | 'inventory' | 'crafting' | 'build'

interface GameState {
  screen: Screen
  panel: Panel
  engineFrame: number
  dayTime: number
  inventory: (ItemStack | null)[]
  /** currently nearby station itemId (or null) — drives the crafting panel */
  nearbyStation: string | null
  /** reticle prompt text, e.g. "E: Gather Wood" or "" */
  prompt: string
  setScreen: (s: Screen) => void
  startGame: () => void
  setPanel: (p: Panel) => void
  setEngineFrame: (n: number) => void
  setDayTime: (t: number) => void
  setInventory: (inv: (ItemStack | null)[]) => void
  setNearbyStation: (s: string | null) => void
  setPrompt: (p: string) => void
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'title',
  panel: 'none',
  engineFrame: 0,
  dayTime: 0,
  inventory: new Array(20).fill(null),
  nearbyStation: null,
  prompt: '',
  setScreen: (screen) => set({ screen }),
  startGame: () => set({ screen: 'game', engineFrame: 0, panel: 'none' }),
  setPanel: (panel) => set({ panel }),
  setEngineFrame: (engineFrame) => set({ engineFrame }),
  setDayTime: (dayTime) => set({ dayTime }),
  setInventory: (inventory) => set({ inventory }),
  setNearbyStation: (nearbyStation) => set({ nearbyStation }),
  setPrompt: (prompt) => set({ prompt }),
}))
