import { describe, it, expect } from 'vitest'
import { SocketGraph, findSnap } from './SocketGraph'

describe('SocketGraph', () => {
  it('adds and removes pieces with unique ids', () => {
    const g = new SocketGraph()
    const a = g.add({ itemId: 'foundation', x: 0, y: 0, z: 0, yaw: 0 })
    const b = g.add({ itemId: 'floor', x: 1.5, y: 0.3, z: 0, yaw: 0 })
    expect(a.id).not.toBe(b.id)
    expect(g.size()).toBe(2)
    expect(g.remove(a.id)).toBe(true)
    expect(g.size()).toBe(1)
  })

  it('nearby returns pieces within radius', () => {
    const g = new SocketGraph()
    g.add({ itemId: 'foundation', x: 0, y: 0, z: 0, yaw: 0 })
    g.add({ itemId: 'foundation', x: 10, y: 0, z: 0, yaw: 0 })
    const near = g.nearby(0, 0, 0, 3)
    expect(near.length).toBe(1)
    expect(near[0]!.x).toBe(0)
  })

  it('snapshot + restore round-trips', () => {
    const g = new SocketGraph()
    g.add({ itemId: 'wall', x: 1, y: 2, z: 3, yaw: 1.57 })
    const snap = g.snapshot()
    const g2 = new SocketGraph()
    g2.restore(snap)
    expect(g2.snapshot()).toEqual(snap)
    expect(g2.size()).toBe(1)
  })

  it('clear empties the graph', () => {
    const g = new SocketGraph()
    g.add({ itemId: 'foundation', x: 0, y: 0, z: 0, yaw: 0 })
    g.clear()
    expect(g.size()).toBe(0)
  })
})

describe('findSnap', () => {
  it('snaps to a nearby piece origin within threshold', () => {
    const near = [{ id: 1, itemId: 'foundation', x: 0, y: 0, z: 0, yaw: 0 }]
    const r = findSnap({ x: 0.3, y: 0.1, z: 0, yaw: 0 }, near, 0.6)
    expect(r.snapped).toBe(true)
    expect(r.x).toBe(0)
    expect(r.y).toBe(0)
  })

  it('grid-snaps when no piece is nearby', () => {
    const r = findSnap({ x: 1.18, y: 2.07, z: 0, yaw: 0 }, [], 0.6)
    expect(r.snapped).toBe(false)
    expect(r.x).toBeCloseTo(1.25, 5)
    expect(r.y).toBeCloseTo(2.0, 5)
  })
})
