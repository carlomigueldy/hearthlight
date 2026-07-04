import { mulberry32 } from '@/engine/math/rng'
import type { Terrain } from '@/engine/world/Terrain'

export interface ResourceNode {
  id: number
  itemId: string
  x: number
  y: number
  z: number
  scale: number
  /** current remaining hits; 0 = depleted (hidden until respawn) */
  amount: number
  max: number
  /** world time (seconds) when it respawns; 0 = ready/alive */
  respawnAt: number
}

export type ResourceKind = 'tree' | 'rock' | 'bush' | 'reed'

export const ResourceKinds: Record<
  ResourceKind,
  { itemId: string; max: number; respawnSeconds: number }
> = {
  tree: { itemId: 'wood', max: 3, respawnSeconds: 45 },
  rock: { itemId: 'stone', max: 3, respawnSeconds: 60 },
  bush: { itemId: 'food', max: 2, respawnSeconds: 30 },
  reed: { itemId: 'fiber', max: 2, respawnSeconds: 30 },
}

let nextNodeId = 1

/** Scatter resource nodes across the island above the waterline. */
export function scatterResourceNodes(terrain: Terrain, seed: number): ResourceNode[] {
  const rng = mulberry32(seed)
  const half = terrain.params.size * 0.5
  const out: ResourceNode[] = []
  const kinds: ResourceKind[] = ['tree', 'tree', 'tree', 'rock', 'rock', 'bush', 'reed']
  const target = 90
  let tries = 0
  while (out.length < target && tries < target * 25) {
    tries++
    const kind = kinds[Math.floor(rng() * kinds.length)]!
    const x = (rng() * 2 - 1) * half * 0.9
    const z = (rng() * 2 - 1) * half * 0.9
    const y = terrain.heightAt(x, z)
    if (y < terrain.params.waterLevel + 0.6) continue
    const def = ResourceKinds[kind]
    out.push({
      id: nextNodeId++,
      itemId: def.itemId,
      x,
      y,
      z,
      scale: 0.7 + rng() * 0.6,
      amount: def.max,
      max: def.max,
      respawnAt: 0,
    })
  }
  return out
}
