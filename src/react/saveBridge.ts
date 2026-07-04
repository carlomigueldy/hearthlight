import { game } from './gameState'
import { useGameStore } from '@/state/useGameStore'
import {
  snapshotSave,
  saveGame,
  loadGame,
  clearSave,
  hasSave,
  type SaveData,
} from '@/engine/save/SaveSystem'
import { DEFAULT_TERRAIN } from '@/engine/world/Terrain'

/** Persist the current game to localStorage. */
export function saveCurrentGame(): boolean {
  const data = snapshotSave({
    inventory: game.inventory,
    build: game.build,
    stations: game.stations,
    resources: game.resourceNodes.map((r) => ({ id: r.id, amount: r.amount, respawnAt: r.respawnAt })),
    dayTime: useGameStore.getState().dayTime,
    player: { ...game.playerPos },
    terrain: DEFAULT_TERRAIN,
  })
  saveGame(data)
  return true
}

/** Load a save into the live game state. Returns the SaveData or null. */
export function loadIntoGame(): SaveData | null {
  const data = loadGame()
  if (!data) return null
  game.inventory.restore(data.inventory)
  game.build.restore(
    data.build.map((p) => ({ id: p.id, itemId: p.itemId, x: p.x, y: p.y, z: p.z, yaw: p.yaw })),
  )
  game.stations = data.stations.map((s) => ({ ...s }))
  for (const rs of data.resources) {
    const n = game.resourceNodes.find((r) => r.id === rs.id)
    if (n) {
      n.amount = rs.amount
      n.respawnAt = rs.respawnAt
    }
  }
  game.syncToStore()
  useGameStore.getState().setDayTime(data.dayTime)
  return data
}

export function wipeSave(): void {
  clearSave()
}

export function saveExists(): boolean {
  return hasSave()
}
