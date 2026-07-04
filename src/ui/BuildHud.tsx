import { useGameStore } from '@/state/useGameStore'
import { getItem } from '@/engine/items/Items'
import { BUILDABLE_PIECES } from '@/engine/build/PieceDefs'
import { game } from '@/react/gameState'
import { motion } from 'motion/react'

export function BuildHud() {
  const buildMode = useGameStore((s) => s.buildMode)
  const buildPiece = useGameStore((s) => s.buildPiece)
  const buildRotation = useGameStore((s) => s.buildRotation)
  const buildDemolish = useGameStore((s) => s.buildDemolish)
  const setBuildPiece = useGameStore((s) => s.setBuildPiece)
  const setBuildRotation = useGameStore((s) => s.setBuildRotation)
  const setBuildDemolish = useGameStore((s) => s.setBuildDemolish)
  const inv = useGameStore((s) => s.inventory)

  if (!buildMode) return null

  return (
    <motion.div
      className="pointer-events-auto absolute bottom-20 left-1/2 -translate-x-1/2 rounded-2xl bg-hearth-ink/90 p-3 text-white shadow-2xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold">Build</span>
        <div className="flex items-center gap-2 text-xs">
          <button
            className={`rounded-md px-2 py-1 ${buildDemolish ? 'bg-red-500/80' : 'bg-white/15'}`}
            onClick={() => setBuildDemolish(!buildDemolish)}
          >
            Demolish
          </button>
          <button
            className="rounded-md bg-white/15 px-2 py-1"
            onClick={() => setBuildRotation((buildRotation + 1) % 4)}
          >
            Rotate (R)
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        {BUILDABLE_PIECES.map((id) => {
          const def = getItem(id)
          const count = game.inventory.countOf(id)
          const active = buildPiece === id && !buildDemolish
          return (
            <button
              key={id}
              disabled={count <= 0}
              onClick={() => {
                setBuildDemolish(false)
                setBuildPiece(id)
              }}
              className={`flex h-16 w-16 flex-col items-center justify-center rounded-lg transition ${
                active ? 'bg-hearth-amber text-hearth-ink' : count > 0 ? 'bg-white/10 hover:bg-white/20' : 'cursor-not-allowed bg-white/5 opacity-40'
              }`}
              title={def?.name}
            >
              <div className="mb-1 h-5 w-5 rounded-sm" style={{ background: def?.color }} />
              <span className="text-xs">{count}</span>
            </button>
          )
        })}
      </div>
      <div className="mt-2 text-center text-xs text-white/60">
        Click to place · R rotate · B exit · {inv.length ? '' : ''}
      </div>
    </motion.div>
  )
}
