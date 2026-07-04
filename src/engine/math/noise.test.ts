import { describe, it, expect } from 'vitest'
import { createSeededNoise2D } from './noise'

describe('createSeededNoise2D', () => {
  it('is deterministic for the same seed', () => {
    const n1 = createSeededNoise2D(123)
    const n2 = createSeededNoise2D(123)
    const a = n1(0.5, 0.25)
    const b = n2(0.5, 0.25)
    expect(a).toBe(b)
  })

  it('returns values in [-1, 1]', () => {
    const n = createSeededNoise2D(9)
    for (let i = 0; i < 200; i++) {
      const v = n(i * 0.13, i * 0.29)
      expect(v).toBeGreaterThanOrEqual(-1)
      expect(v).toBeLessThanOrEqual(1)
    }
  })
})
