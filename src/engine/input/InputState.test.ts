import { describe, it, expect } from 'vitest'
import { InputState } from './InputState'

describe('InputState', () => {
  it('tracks held keys', () => {
    const i = new InputState()
    i.onKeyDown('KeyW')
    expect(i.isDown('KeyW')).toBe(true)
    i.onKeyUp('KeyW')
    expect(i.isDown('KeyW')).toBe(false)
  })

  it('tracks just-pressed until endFrame', () => {
    const i = new InputState()
    i.onKeyDown('Space')
    expect(i.isJustPressed('Space')).toBe(true)
    i.endFrame()
    expect(i.isJustPressed('Space')).toBe(false)
    expect(i.isDown('Space')).toBe(true)
  })

  it('accumulates and consumes mouse delta', () => {
    const i = new InputState()
    i.addMouseDelta(10, -5)
    i.addMouseDelta(2, 3)
    expect(i.consumeMouseDelta()).toEqual({ x: 12, y: -2 })
    expect(i.consumeMouseDelta()).toEqual({ x: 0, y: 0 })
  })
})
