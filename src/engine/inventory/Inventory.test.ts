import { describe, it, expect } from 'vitest'
import { Inventory } from './Inventory'

describe('Inventory', () => {
  it('adds to empty slots', () => {
    const inv = new Inventory(4)
    const r = inv.add('wood', 5)
    expect(r.added).toBe(5)
    expect(r.leftover).toBe(0)
    expect(inv.countOf('wood')).toBe(5)
  })

  it('stacks onto existing same-item slots up to maxStack', () => {
    const inv = new Inventory(4)
    inv.add('wood', 95) // maxStack 99
    expect(inv.countOf('wood')).toBe(95)
    const r = inv.add('wood', 10)
    expect(r.added).toBe(10)
    expect(inv.countOf('wood')).toBe(105)
    expect(inv.slots[0]?.count).toBe(99)
    expect(inv.slots[1]?.count).toBe(6)
  })

  it('reports leftover when full', () => {
    const inv = new Inventory(2)
    const r = inv.add('wood', 250)
    expect(inv.countOf('wood')).toBe(198)
    expect(r.leftover).toBe(250 - 198)
  })

  it('removes items, clearing empty slots', () => {
    const inv = new Inventory(4)
    inv.add('stone', 10)
    const removed = inv.remove('stone', 4)
    expect(removed).toBe(4)
    expect(inv.countOf('stone')).toBe(6)
    inv.remove('stone', 6)
    expect(inv.slots[0]).toBeNull()
  })

  it('has() checks multiple inputs', () => {
    const inv = new Inventory(8)
    inv.add('wood', 5)
    inv.add('stone', 3)
    expect(inv.has({ wood: 5, stone: 3 })).toBe(true)
    expect(inv.has({ wood: 6 })).toBe(false)
  })

  it('snapshot + restore round-trips', () => {
    const inv = new Inventory(8)
    inv.add('wood', 10)
    inv.add('axe', 1)
    const snap = inv.snapshot()
    const inv2 = new Inventory(8)
    inv2.restore(snap)
    expect(inv2.snapshot()).toEqual(snap)
    expect(inv2.countOf('wood')).toBe(10)
    expect(inv2.countOf('axe')).toBe(1)
  })

  it('refuses unknown items', () => {
    const inv = new Inventory(4)
    const r = inv.add('unknown', 5)
    expect(r.added).toBe(0)
    expect(r.leftover).toBe(5)
  })
})
