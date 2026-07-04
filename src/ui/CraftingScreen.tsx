import { useGameStore } from '@/state/useGameStore'
import { getItem } from '@/engine/items/Items'
import { recipesForStation } from '@/engine/craft/Recipes'
import { craft, canCraft } from '@/engine/craft/CraftingSystem'
import { game } from '@/react/gameState'
import { motion } from 'motion/react'

const STATION_ITEMS = new Set(['campfire', 'workbench'])

/** Place a station 1.5m in front of the player on the ground. */
function placeStation(itemId: string) {
  const p = game.playerPos
  const f = game.playerForward
  const fx = f.x || 0
  const fz = f.z || 1
  const len = Math.hypot(fx, fz) || 1
  const x = p.x + (fx / len) * 1.8
  const z = p.z + (fz / len) * 1.8
  const y = p.y - 0.9 // roughly ground
  game.stations.push({ itemId, x, y, z })
}

export function CraftingScreen() {
  const station = useGameStore((s) => s.nearbyStation)
  const inv = useGameStore((s) => s.inventory)
  const setPanel = useGameStore((s) => s.setPanel)

  const recipes = recipesForStation(station)
  // rebuild a temporary inventory view for canCraft checks (use the live game inventory)
  const list = recipes.map((r) => {
    const ok = canCraft(r, game.inventory, station)
    const outDef = getItem(r.output.itemId)
    return { r, ok, outDef }
  })

  function doCraft(recipeId: string) {
    const r = recipes.find((x) => x.id === recipeId)
    if (!r) return
    const res = craft(r, game.inventory, station)
    if (!res.ok) return
    if (STATION_ITEMS.has(r.output.itemId)) {
      // place one station per craft (consume the produced item)
      placeStation(r.output.itemId)
      game.inventory.remove(r.output.itemId, 1)
    }
    game.syncToStore()
    // inv is read via useGameStore; force a refresh by toggling through setInventory
    void inv
  }

  const title = station ? `Crafting — ${getItem(station)?.name ?? station}` : 'Crafting (hand)'

  return (
    <motion.div
      className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-hearth-ink/90 p-5 text-white shadow-2xl"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18 }}
    >
      <div className="mb-3 flex items-center justify-between gap-8">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          className="rounded-md bg-white/15 px-3 py-1 text-sm hover:bg-white/25"
          onClick={() => setPanel('none')}
        >
          Close (E)
        </button>
      </div>
      <div className="flex max-h-[60vh] w-[360px] flex-col gap-2 overflow-y-auto">
        {list.map(({ r, ok, outDef }) => (
          <button
            key={r.id}
            disabled={!ok}
            onClick={() => doCraft(r.id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
              ok ? 'bg-white/10 hover:bg-white/20' : 'cursor-not-allowed bg-white/5 opacity-50'
            }`}
          >
            <div
              className="h-8 w-8 flex-shrink-0 rounded-sm"
              style={{ background: outDef?.color ?? '#888' }}
            />
            <div className="flex-1">
              <div className="font-semibold">
                {outDef?.name} <span className="text-white/60">×{r.output.count}</span>
              </div>
              <div className="text-xs text-white/60">
                {Object.entries(r.inputs)
                  .map(([id, n]) => `${getItem(id)?.name ?? id} ${n}`)
                  .join(' · ')}
                {r.station ? ` · needs ${getItem(r.station)?.name}` : ''}
              </div>
            </div>
          </button>
        ))}
        {list.length === 0 && <p className="text-white/60">No recipes available.</p>}
      </div>
    </motion.div>
  )
}
