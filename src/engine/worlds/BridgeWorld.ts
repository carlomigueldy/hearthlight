import { EntityStore } from '../core/EntityStore'
import type { GameWorld } from '../core/Game'

/**
 * Plan 1's trivial world: counts fixed-update frames and reports every 10th
 * to `onTick` (wired to zustand in SceneHost). Proves the engine -> UI bridge.
 * Replaced by the real world in Plan 2.
 */
export function createBridgeWorld(onTick: (frame: number) => void): GameWorld {
  const entities = new EntityStore()
  let frame = 0
  return {
    entities,
    fixedUpdate() {
      frame++
      if (frame % 10 === 0) onTick(frame)
    },
    render() {
      // no-op for now; Plan 2 mutates Object3D refs here
    },
  }
}
