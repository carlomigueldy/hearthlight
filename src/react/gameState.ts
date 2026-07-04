import { Inventory } from '@/engine/inventory/Inventory'
import { useGameStore } from '@/state/useGameStore'

/**
 * Shared runtime game state — the bridge between the framework-free engine
 * (Inventory, day cycle) and the React/zustand UI. Components call
 * `game.syncToStore()` after mutating inventory to refresh the UI.
 */
class GameState {
  readonly inventory = new Inventory(20)
  /** placed station positions keyed by itemId, for "near a station" checks */
  stations: { itemId: string; x: number; y: number; z: number }[] = []
  /** updated by Player each frame; used for station placement */
  playerPos = { x: 0, y: 0, z: 0 }
  playerForward = { x: 0, y: 0, z: 1 }

  /** Mirror inventory + station counts into zustand for the UI. */
  syncToStore() {
    useGameStore.getState().setInventory(this.inventory.snapshot())
  }

  /** Nearest station of `itemId` within `radius` of (x,y,z). */
  stationNear(itemId: string, x: number, y: number, z: number, radius: number): boolean {
    const r2 = radius * radius
    return this.stations.some((s) => {
      if (s.itemId !== itemId) return false
      const dx = s.x - x
      const dy = s.y - y
      const dz = s.z - z
      return dx * dx + dy * dy + dz * dz <= r2
    })
  }
}

export const game = new GameState()
