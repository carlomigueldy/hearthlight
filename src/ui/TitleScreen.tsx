import { motion } from 'motion/react'
import { useState } from 'react'
import { saveExists, loadIntoGame } from '@/react/saveBridge'
import { useGameStore } from '@/state/useGameStore'

export function TitleScreen({ onStart }: { onStart: () => void }) {
  const [hasSave, setHasSave] = useState(saveExists())
  const startGame = useGameStore((s) => s.startGame)

  function continueGame() {
    const ok = loadIntoGame()
    if (ok) startGame()
  }

  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center gap-8"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.h1
        className="text-6xl font-bold tracking-tight text-hearth-ink"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        Hearthlight
      </motion.h1>
      <motion.p
        className="text-lg text-hearth-ink/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        Restore the island. Build your hearth.
      </motion.p>
      <div className="flex flex-col items-center gap-3">
        <motion.button
          className="rounded-2xl bg-hearth-amber px-10 py-3 text-lg font-semibold text-hearth-ink shadow-xl"
          onClick={onStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          New Game
        </motion.button>
        {hasSave && (
          <motion.button
            className="rounded-2xl bg-white/60 px-8 py-2 text-base font-medium text-hearth-ink shadow"
            onClick={continueGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Continue
          </motion.button>
        )}
      </div>
      {hasSave && (
        <button
          className="text-xs text-hearth-ink/50 underline"
          onClick={() => {
            if (confirm('Delete your save and start fresh?')) {
              import('@/react/saveBridge').then((m) => m.wipeSave())
              setHasSave(false)
            }
          }}
        >
          delete save
        </button>
      )}
    </motion.div>
  )
}
