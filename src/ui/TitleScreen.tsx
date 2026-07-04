import { motion } from 'motion/react'

export function TitleScreen({ onStart }: { onStart: () => void }) {
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
      <motion.button
        className="rounded-2xl bg-hearth-amber px-10 py-3 text-lg font-semibold text-hearth-ink shadow-xl"
        onClick={onStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        New Game
      </motion.button>
    </motion.div>
  )
}
