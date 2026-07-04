export interface ItemDef {
  id: string
  name: string
  maxStack: number
  /** color swatch for UI icon (palette hex) */
  color: string
  category: 'resource' | 'tool' | 'material' | 'station' | 'build' | 'food'
}

export const Items = {
  wood: { id: 'wood', name: 'Wood', maxStack: 99, color: '#6b4f2a', category: 'resource' },
  stone: { id: 'stone', name: 'Stone', maxStack: 99, color: '#8a8278', category: 'resource' },
  food: { id: 'food', name: 'Berries', maxStack: 99, color: '#c0392b', category: 'food' },
  fiber: { id: 'fiber', name: 'Fiber', maxStack: 99, color: '#b5a253', category: 'resource' },
  axe: { id: 'axe', name: 'Axe', maxStack: 1, color: '#e6a23c', category: 'tool' },
  plank: { id: 'plank', name: 'Plank', maxStack: 99, color: '#c9a86a', category: 'material' },
  campfire: { id: 'campfire', name: 'Campfire', maxStack: 99, color: '#e6a23c', category: 'station' },
  workbench: { id: 'workbench', name: 'Workbench', maxStack: 99, color: '#8a8278', category: 'station' },
  foundation: { id: 'foundation', name: 'Foundation', maxStack: 99, color: '#8a8278', category: 'build' },
  floor: { id: 'floor', name: 'Floor', maxStack: 99, color: '#c9a86a', category: 'build' },
  wall: { id: 'wall', name: 'Wall', maxStack: 99, color: '#c9a86a', category: 'build' },
  roof: { id: 'roof', name: 'Roof', maxStack: 99, color: '#6b4f2a', category: 'build' },
  door: { id: 'door', name: 'Door', maxStack: 99, color: '#6b4f2a', category: 'build' },
} as const satisfies Record<string, ItemDef>

export type ItemId = keyof typeof Items

export function getItem(id: string): ItemDef | undefined {
  return (Items as Record<string, ItemDef>)[id]
}
