import { describe, it, expect } from 'vitest'
import { Inventory } from '../inventory/Inventory'
import { craft, canCraft, recipeById } from './CraftingSystem'
import { Recipes } from './Recipes'

describe('CraftingSystem', () => {
  it('crafts axe when inputs are present (no station required)', () => {
    const inv = new Inventory(8)
    inv.add('wood', 3)
    inv.add('fiber', 2)
    const r = craft(Recipes.axe, inv, null)
    expect(r.ok).toBe(true)
    expect(r.produced?.itemId).toBe('axe')
    expect(inv.countOf('axe')).toBe(1)
    expect(inv.countOf('wood')).toBe(0)
    expect(inv.countOf('fiber')).toBe(0)
  })

  it('fails to craft when inputs missing', () => {
    const inv = new Inventory(8)
    inv.add('wood', 1)
    const r = craft(Recipes.axe, inv, null)
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('missing_inputs')
  })

  it('plank recipe converts 1 wood -> 2 planks', () => {
    const inv = new Inventory(8)
    inv.add('wood', 1)
    const r = craft(Recipes.plank, inv, null)
    expect(r.ok).toBe(true)
    expect(inv.countOf('plank')).toBe(2)
    expect(inv.countOf('wood')).toBe(0)
  })

  it('station recipes require the matching station', () => {
    const inv = new Inventory(16)
    inv.add('stone', 4)
    // foundation needs a workbench
    expect(canCraft(Recipes.foundation, inv, null)).toBe(false)
    expect(canCraft(Recipes.foundation, inv, 'workbench')).toBe(true)
    const r = craft(Recipes.foundation, inv, null)
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('missing_station')
  })

  it('recipeById returns defined recipes', () => {
    expect(recipeById('axe')?.id).toBe('axe')
    expect(recipeById('nope')).toBeUndefined()
  })
})
