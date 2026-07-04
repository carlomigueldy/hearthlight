import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { GameWorld } from '@/engine/core/Game'

const FIXED_DT = 1 / 60

/** Drives a framework-free `GameWorld` from R3F's render loop via an accumulator. */
export function EngineDriver({ world }: { world: GameWorld }) {
  const acc = useRef(0)
  useFrame((_, delta) => {
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
