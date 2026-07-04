import { useFrame } from '@react-three/fiber'
import { input } from './inputSingleton'

/** Runs last each frame to clear per-frame input flags. Render this LAST in the scene. */
export function EndFrame() {
  useFrame(() => input.endFrame())
  return null
}
