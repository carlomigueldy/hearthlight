import { useGameStore } from '@/state/useGameStore'
import { saveCurrentGame, loadIntoGame, wipeSave, saveExists } from '@/react/saveBridge'
import { game } from '@/react/gameState'
import { motion } from 'motion/react'
import { useState } from 'react'

export function PauseMenu() {
  const setPaused = useGameStore((s) => s.setPaused)
  const setScreen = useGameStore((s) => s.setScreen)
  const [msg, setMsg] = useState('')

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-hearth-ink/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="w-72 rounded-2xl bg-hearth-ink/95 p-6 text-white shadow-2xl"
        initial={{ scale: 0.95, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="mb-4 text-2xl font-bold">Paused</h2>
        <div className="flex flex-col gap-2">
          <button
            className="rounded-lg bg-hearth-amber px-4 py-2 font-semibold text-hearth-ink hover:scale-[1.02]"
            onClick={() => setPaused(false)}
          >
            Resume (Esc)
          </button>
          <button
            className="rounded-lg bg-white/15 px-4 py-2 hover:bg-white/25"
            onClick={() => {
              saveCurrentGame()
              setMsg('Game saved.')
            }}
          >
            Save
          </button>
          <button
            className="rounded-lg bg-white/15 px-4 py-2 hover:bg-white/25 disabled:opacity-40"
            disabled={!saveExists()}
            onClick={() => {
              const ok = loadIntoGame()
              setMsg(ok ? 'Game loaded.' : 'No save found.')
            }}
          >
            Load Save
          </button>
          <button
            className="rounded-lg bg-white/15 px-4 py-2 hover:bg-white/25"
            onClick={() => {
              if (confirm('Delete your save?')) {
                wipeSave()
                setMsg('Save deleted.')
              }
            }}
          >
            Delete Save
          </button>
          <button
            className="rounded-lg bg-red-500/70 px-4 py-2 hover:bg-red-500"
            onClick={() => {
              setPaused(false)
              setScreen('title')
              game.inventory.clear()
              game.build.clear()
              game.stations = []
              game.syncToStore()
            }}
          >
            Quit to Title
          </button>
        </div>
        {msg && <p className="mt-3 text-center text-sm text-white/70">{msg}</p>}
        <p className="mt-4 text-center text-xs text-white/40">Esc to resume</p>
      </motion.div>
    </motion.div>
  )
}
