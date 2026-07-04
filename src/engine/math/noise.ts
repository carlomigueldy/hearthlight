import { createNoise2D } from 'simplex-noise'
import { mulberry32 } from './rng'

export type Noise2D = (x: number, y: number) => number

/** Simplex noise seeded by `seed` via mulberry32. Deterministic. */
export function createSeededNoise2D(seed: number): Noise2D {
  return createNoise2D(mulberry32(seed))
}
