import type { Inventory } from '../inventory/Inventory'
import { Recipes, type Recipe } from './Recipes'

export interface CraftResult {
  ok: boolean
  reason?: 'missing_inputs' | 'missing_station'
  produced?: { itemId: string; count: number }
}

/** Pure helper: checks if a recipe can be crafted given inventory + station. */
export function canCraft(recipe: Recipe, inv: Inventory, station: string | null): boolean {
  if (recipe.station && recipe.station !== station) return false
  return inv.has(recipe.inputs)
}

/** Consume inputs and add output. Returns failure if not craftable. */
export function craft(recipe: Recipe, inv: Inventory, station: string | null): CraftResult {
  if (recipe.station && recipe.station !== station) {
    return { ok: false, reason: 'missing_station' }
  }
  if (!inv.has(recipe.inputs)) return { ok: false, reason: 'missing_inputs' }
  for (const [id, n] of Object.entries(recipe.inputs)) {
    inv.remove(id, n)
  }
  const r = inv.add(recipe.output.itemId, recipe.output.count)
  return { ok: true, produced: { itemId: recipe.output.itemId, count: r.added } }
}

export function recipeById(id: string): Recipe | undefined {
  return (Recipes as Record<string, Recipe>)[id]
}
