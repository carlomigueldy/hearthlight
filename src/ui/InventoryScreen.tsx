import { useGameStore } from '@/state/useGameStore'
import { getItem } from '@/engine/items/Items'
import { motion } from 'motion/react'

export function InventoryScreen() {
  const inv = useGameStore((s) => s.inventory)
  const setPanel = useGameStore((s) => s.setPanel)

  return (
    <motion.div
      className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-hearth-ink/90 p-5 text-white shadow-2xl"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18 }}
    >
      <div className="mb-3 flex items-center justify-between gap-8">
        <h2 className="text-xl font-bold">Inventory</h2>
        <button
          className="rounded-md bg-white/15 px-3 py-1 text-sm hover:bg-white/25"
          onClick={() => setPanel('none')}
        >
          Close (Tab)
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {inv.map((s, i) => {
          const def = s ? getItem(s.itemId) : null
          return (
            <div
              key={i}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-white/10"
              title={def?.name}
            >
              {def ? (
                <>
                  <div className="mb-1 h-6 w-6 rounded-sm" style={{ background: def.color }} />
                  <span className="text-xs">{s!.count}</span>
                </>
              ) : null}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
