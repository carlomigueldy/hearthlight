import { describe, it, expect } from 'vitest'
import { Clock } from './Clock'

describe('Clock', () => {
  it('returns elapsed seconds since last tick, capped by maxDelta', () => {
    let t = 1000
    const clock = new Clock(() => t)
    t = 1016 // 16ms later
    expect(clock.tick()).toBeCloseTo(0.016, 5)
  })

  it('caps large deltas to avoid spiral-of-death', () => {
    let t = 0
    const clock = new Clock(() => t)
    t = 5_000 // 5s gap
    expect(clock.tick(0.1)).toBe(0.1)
  })

  it('never returns negative time', () => {
    let t = 10
    const clock = new Clock(() => t)
    t = 5 // clock went backwards
    expect(clock.tick()).toBe(0)
  })
})
