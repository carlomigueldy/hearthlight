import { describe, it, expect, beforeEach } from 'vitest'
import { saveGame, loadGame, clearSave, hasSave, snapshotSave } from './SaveSystem'
import { Inventory } from '../inventory/Inventory'
import { SocketGraph } from '../build/SocketGraph'

// in-memory localStorage shim (node test env has no localStorage)
const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  ;(globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage
})

describe('SaveSystem', () => {
  beforeEach(() => clearSave())

  it('round-trips a save through localStorage', () => {
    const inv = new Inventory(20)
    inv.add('wood', 5)
    const build = new SocketGraph()
    build.add({ itemId: 'foundation', x: 1, y: 0, z: 2, yaw: 0 })
    const data = snapshotSave({
      inventory: inv,
      build,
      stations: [{ itemId: 'campfire', x: 3, y: 0, z: 0 }],
      resources: [{ id: 1, amount: 0, respawnAt: 50 }],
      dayTime: 120,
      player: { x: 1, y: 2, z: 3 },
    })
    saveGame(data)
    expect(hasSave()).toBe(true)
    const loaded = loadGame()
    expect(loaded).not.toBeNull()
    expect(loaded!.version).toBe(1)
    expect(loaded!.dayTime).toBe(120)
    expect(loaded!.inventory[0]).toEqual({ itemId: 'wood', count: 5 })
    expect(loaded!.build[0]!.itemId).toBe('foundation')
    expect(loaded!.stations[0]!.itemId).toBe('campfire')
    expect(loaded!.player).toEqual({ x: 1, y: 2, z: 3 })
  })

  it('loadGame returns null when no save exists', () => {
    expect(loadGame()).toBeNull()
    expect(hasSave()).toBe(false)
  })

  it('clearSave removes the save', () => {
    saveGame(
      snapshotSave({
        inventory: new Inventory(20),
        build: new SocketGraph(),
        stations: [],
        resources: [],
        dayTime: 0,
        player: { x: 0, y: 0, z: 0 },
      }),
    )
    expect(hasSave()).toBe(true)
    clearSave()
    expect(hasSave()).toBe(false)
  })
})
