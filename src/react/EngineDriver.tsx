import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { GameWorld } from '@/engine/core/Game'
import { useGameStore } from '@/state/useGameStore'

const FIXED_DT = 1 / 60

/** Drives a framework-free `GameWorld` from R3F's render loop via an accumulator. Pauses when the store says so. */
export function EngineDriver({ world }: { world: GameWorld }) {
  const acc = useRef(0)
  useFrame((_, delta) => {
    if (useGameStore.getState().paused) return
    acc.current += delta
    let steps = 0
    while (acc.current >= FIXED_DT && steps < 5) {
      world.fixedUpdate(FIXED_DT)
      acc.current -= FIXED_DT
      steps++
    }
    world.render(acc.current / FIXED_DT)
  })
  return null
}
