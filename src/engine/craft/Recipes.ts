export interface Recipe {
  id: string
  inputs: Record<string, number>
  output: { itemId: string; count: number }
  /** if set, requires a placed station of this itemId nearby to craft */
  station?: string
}

export const Recipes = {
  axe: {
    id: 'axe',
    inputs: { wood: 3, fiber: 2 },
    output: { itemId: 'axe', count: 1 },
  },
  plank: {
    id: 'plank',
    inputs: { wood: 1 },
    output: { itemId: 'plank', count: 2 },
  },
  campfire: {
    id: 'campfire',
    inputs: { stone: 5, wood: 3 },
    output: { itemId: 'campfire', count: 1 },
  },
  workbench: {
    id: 'workbench',
    inputs: { wood: 8, plank: 4 },
    output: { itemId: 'workbench', count: 1 },
  },
  foundation: {
    id: 'foundation',
    inputs: { stone: 4 },
    output: { itemId: 'foundation', count: 1 },
    station: 'workbench',
  },
  floor: {
    id: 'floor',
    inputs: { plank: 4 },
    output: { itemId: 'floor', count: 1 },
    station: 'workbench',
  },
  wall: {
    id: 'wall',
    inputs: { plank: 4, wood: 2 },
    output: { itemId: 'wall', count: 1 },
    station: 'workbench',
  },
  roof: {
    id: 'roof',
    inputs: { wood: 4, plank: 2 },
    output: { itemId: 'roof', count: 1 },
    station: 'workbench',
  },
  door: {
    id: 'door',
    inputs: { plank: 6 },
    output: { itemId: 'door', count: 1 },
    station: 'workbench',
  },
} as const satisfies Record<string, Recipe>

export type RecipeId = keyof typeof Recipes

export function recipesForStation(stationItemId: string | null): Recipe[] {
  const all = Object.values(Recipes) as Recipe[]
  if (stationItemId === null) return all.filter((r) => !r.station)
  return all.filter((r) => r.station === stationItemId)
}
