import { describe, it, expect } from 'vitest'
import { getItem, Items } from './Items'

describe('Items registry', () => {
  it('defines all Phase 0 items with valid fields', () => {
    const required = ['wood', 'stone', 'food', 'fiber', 'axe', 'plank', 'campfire', 'workbench', 'foundation', 'floor', 'wall', 'roof', 'door']
    for (const id of required) {
      const it = getItem(id)
      expect(it).toBeDefined()
      expect(it!.maxStack).toBeGreaterThan(0)
      expect(it!.color).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it('getItem returns undefined for unknown ids', () => {
    expect(getItem('nope')).toBeUndefined()
  })

  it('axe is a non-stackable tool', () => {
    expect(Items.axe.maxStack).toBe(1)
    expect(Items.axe.category).toBe('tool')
  })
})
