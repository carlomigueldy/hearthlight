import { Inventory } from '@/engine/inventory/Inventory'
import { SocketGraph } from '@/engine/build/SocketGraph'
import { useGameStore } from '@/state/useGameStore'
import type { ResourceNode } from '@/engine/gather/ResourceNodes'

/**
 * Shared runtime game state — the bridge between the framework-free engine
 * (Inventory, day cycle, build graph) and the React/zustand UI. Components call
 * `game.syncToStore()` after mutating inventory/builds to refresh the UI.
 */
class GameState {
  readonly inventory = new Inventory(20)
  readonly build = new SocketGraph()
  stations: { itemId: string; x: number; y: number; z: number }[] = []
  /** live resource nodes (written by ResourceNodes component; read by save) */
  resourceNodes: ResourceNode[] = []
  playerPos = { x: 0, y: 0, z: 0 }
  playerForward = { x: 0, y: 0, z: 1 }

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
