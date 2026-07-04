import { describe, it, expect } from 'vitest'
import { EntityStore } from './EntityStore'

describe('EntityStore', () => {
  it('creates entities with unique ids and stores components', () => {
    const s = new EntityStore()
    const a = s.create({ position: { x: 1 } })
    const b = s.create({ position: { x: 2 } })
    expect(a.id).not.toBe(b.id)
    expect(s.get(a.id)?.components['position']).toEqual({ x: 1 })
    expect(s.size()).toBe(2)
  })

  it('queries entities that have a component', () => {
    const s = new EntityStore()
    s.create({ position: { x: 1 } })
    s.create({ position: { x: 2 }, velocity: { v: 1 } })
    s.create({ velocity: { v: 2 } })
    expect(s.query('velocity').length).toBe(2)
    expect(s.query('position').length).toBe(2)
  })

  it('removes entities', () => {
    const s = new EntityStore()
    const e = s.create({ foo: 1 })
    s.remove(e.id)
    expect(s.get(e.id)).toBeUndefined()
    expect(s.size()).toBe(0)
  })

  it('clears all entities', () => {
    const s = new EntityStore()
    s.create({ foo: 1 })
    s.create({ bar: 2 })
    s.clear()
    expect(s.size()).toBe(0)
  })
})
