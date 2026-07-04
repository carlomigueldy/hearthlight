import { create } from 'zustand'
import type { ItemStack } from '@/engine/inventory/Inventory'

export type Screen = 'title' | 'game'
export type Panel = 'none' | 'inventory' | 'crafting' | 'build'

interface GameState {
  screen: Screen
  panel: Panel
  paused: boolean
  engineFrame: number
  dayTime: number
  inventory: (ItemStack | null)[]
  nearbyStation: string | null
  prompt: string
  buildMode: boolean
  buildPiece: string | null
  buildRotation: number
  buildDemolish: boolean
  setScreen: (s: Screen) => void
  startGame: () => void
  setPanel: (p: Panel) => void
  setPaused: (p: boolean) => void
  setEngineFrame: (n: number) => void
  setDayTime: (t: number) => void
  setInventory: (inv: (ItemStack | null)[]) => void
  setNearbyStation: (s: string | null) => void
  setPrompt: (p: string) => void
  setBuildMode: (b: boolean) => void
  setBuildPiece: (p: string | null) => void
  setBuildRotation: (r: number) => void
  setBuildDemolish: (b: boolean) => void
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'title',
  panel: 'none',
  paused: false,
  engineFrame: 0,
  dayTime: 0,
  inventory: new Array(20).fill(null),
  nearbyStation: null,
  prompt: '',
  buildMode: false,
  buildPiece: null,
  buildRotation: 0,
  buildDemolish: false,
  setScreen: (screen) => set({ screen }),
  startGame: () => set({ screen: 'game', engineFrame: 0, panel: 'none', paused: false }),
  setPanel: (panel) => set({ panel }),
  setPaused: (paused) => set({ paused }),
  setEngineFrame: (engineFrame) => set({ engineFrame }),
  setDayTime: (dayTime) => set({ dayTime }),
  setInventory: (inventory) => set({ inventory }),
  setNearbyStation: (nearbyStation) => set({ nearbyStation }),
  setPrompt: (prompt) => set({ prompt }),
  setBuildMode: (buildMode) => set({ buildMode }),
  setBuildPiece: (buildPiece) => set({ buildPiece }),
  setBuildRotation: (buildRotation) => set({ buildRotation }),
  setBuildDemolish: (buildDemolish) => set({ buildDemolish }),
}))
