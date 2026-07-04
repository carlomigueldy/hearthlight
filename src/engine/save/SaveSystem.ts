import type { Inventory } from '../inventory/Inventory'
import type { SocketGraph } from '../build/SocketGraph'
import { DEFAULT_TERRAIN, type TerrainParams } from '../world/Terrain'

export interface SaveData {
  version: 1
  terrain: TerrainParams
  dayTime: number
  inventory: (ItemStack | null)[]
  build: PlacedPieceSerialized[]
  stations: { itemId: string; x: number; y: number; z: number }[]
  /** resource node depletion states (id -> { amount, respawnAt }) */
  resources: { id: number; amount: number; respawnAt: number }[]
  player: { x: number; y: number; z: number }
}

interface ItemStack {
  itemId: string
  count: number
}
interface PlacedPieceSerialized {
  id: number
  itemId: string
  x: number
  y: number
  z: number
  yaw: number
}

const KEY = 'hearthlight.save.v1'

export function saveGame(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // quota or serialization errors — fail silently for Phase 0
  }
}

export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SaveData
    if (data.version !== 1) return null
    return data
  } catch {
    return null
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(KEY) !== null
  } catch {
    return false
  }
}

/** Build a SaveData snapshot from the live game state. */
export function snapshotSave(opts: {
  inventory: Inventory
  build: SocketGraph
  stations: { itemId: string; x: number; y: number; z: number }[]
  resources: { id: number; amount: number; respawnAt: number }[]
  dayTime: number
  player: { x: number; y: number; z: number }
  terrain?: TerrainParams
}): SaveData {
  return {
    version: 1,
    terrain: opts.terrain ?? DEFAULT_TERRAIN,
    dayTime: opts.dayTime,
    inventory: opts.inventory.snapshot(),
    build: opts.build.snapshot().map((p) => ({ id: p.id, itemId: p.itemId, x: p.x, y: p.y, z: p.z, yaw: p.yaw })),
    stations: opts.stations.map((s) => ({ ...s })),
    resources: opts.resources.map((r) => ({ id: r.id, amount: r.amount, respawnAt: r.respawnAt })),
    player: { ...opts.player },
  }
}
