import { describe, it, expect } from 'vitest'
import { createWorld, DAY_LENGTH_SECONDS } from './World'

describe('createWorld', () => {
  it('advances day time in fixedUpdate and wraps', () => {
    let reported = -1
    const w = createWorld({ onDayTimeChange: (t) => (reported = t) })
    const before = w.state.dayTime
    w.fixedUpdate(2)
    expect(w.state.dayTime).toBe(before + 2)
    // a report should have fired (whole second changed)
    expect(reported).toBeGreaterThan(-1)
  })

  it('wraps day time modulo DAY_LENGTH_SECONDS', () => {
    const w = createWorld()
    w.state.dayTime = DAY_LENGTH_SECONDS - 0.5
    w.fixedUpdate(1)
    expect(w.state.dayTime).toBeCloseTo(0.5, 5)
  })

  it('setState merges partial state', () => {
    const w = createWorld()
    w.setState({ dayTime: 123 })
    expect(w.state.dayTime).toBe(123)
  })
})
