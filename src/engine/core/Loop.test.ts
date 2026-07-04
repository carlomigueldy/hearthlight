import { describe, it, expect } from 'vitest'
import { Loop } from './Loop'
import { Clock } from './Clock'

describe('Loop', () => {
  it('calls fixedUpdate the correct number of times for accumulated time', () => {
    let now = 0
    const clock = new Clock(() => now)
    const fixedCalls: number[] = []
    const renderCalls: number[] = []
    let scheduled: (() => void) | null = null
    const schedule = (cb: () => void) => {
      scheduled = cb
      return 1
    }
    const loop = new Loop(
      1 / 60,
      (dt) => fixedCalls.push(dt),
      (alpha) => renderCalls.push(alpha),
      schedule,
      () => {},
      clock,
    )
    loop.start()
    expect(scheduled).not.toBeNull()
    // advance 1/60 s
    now = 1000 / 60
    scheduled!()
    expect(fixedCalls.length).toBe(1)
    expect(renderCalls.length).toBe(1)
  })

  it('stops calling after stop()', () => {
    let now = 0
    const clock = new Clock(() => now)
    let calls = 0
    let scheduled: (() => void) | null = null
    const loop = new Loop(
      1 / 60,
      () => {
        calls++
      },
      () => {},
      (cb) => {
        scheduled = cb
        return 1
      },
      () => {},
      clock,
    )
    loop.start()
    loop.stop()
    now = 1
    scheduled!()
    expect(calls).toBe(0)
  })
})
