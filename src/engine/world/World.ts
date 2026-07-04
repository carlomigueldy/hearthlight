import { EntityStore } from '../core/EntityStore'
import type { GameWorld } from '../core/Game'

export const DAY_LENGTH_SECONDS = 600 // ~10 min day (tunable)

export interface WorldState {
  /** Time of day in seconds, [0, DAY_LENGTH_SECONDS). */
  dayTime: number
}

export interface WorldCallbacks {
  onDayTimeChange?: (dayTime: number) => void
}

/**
 * The real Hearthlight world. Framework-free simulation state:
 *  - day/night time (advanced in fixedUpdate)
 *  - entity store (foliage, resources, build pieces — populated by later plans)
 *
 * Player/physics live in R3F/@react-three/rapier and read InputState directly;
 * this World owns pure state that the UI mirrors via callbacks/zustand.
 */
export function createWorld(callbacks: WorldCallbacks = {}): GameWorld & {
  state: WorldState
  setState: (s: Partial<WorldState>) => void
} {
  const entities = new EntityStore()
  const state: WorldState = { dayTime: DAY_LENGTH_SECONDS * 0.32 } // start mid-morning
  let lastReported = -1

  return {
    entities,
    state,
    setState(s) {
      Object.assign(state, s)
    },
    fixedUpdate(dt) {
      state.dayTime = (state.dayTime + dt) % DAY_LENGTH_SECONDS
      // report ~once per second to avoid spamming zustand
      const whole = Math.floor(state.dayTime)
      if (whole !== lastReported) {
        lastReported = whole
        callbacks.onDayTimeChange?.(state.dayTime)
      }
    },
    render() {
      // Plan 2: player/terrain are driven from R3F useFrame, not here.
    },
  }
}
