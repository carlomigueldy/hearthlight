import { useGameStore } from '@/state/useGameStore'

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const startGame = useGameStore((s) => s.startGame)
  return (
    <div className="h-full w-full">
      {screen === 'title' ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-6">
          <h1 className="text-5xl font-bold tracking-tight text-hearth-ink">Hearthlight</h1>
          <button
            className="rounded-2xl bg-hearth-amber px-8 py-3 text-lg font-semibold text-hearth-ink shadow-lg transition hover:scale-105"
            onClick={startGame}
          >
            New Game
          </button>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-hearth-ink">
          <p className="text-xl">Scene loads in Plan 1, Task 6.</p>
        </div>
      )}
    </div>
  )
}
