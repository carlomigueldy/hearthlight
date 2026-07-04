import { useGameStore } from '@/state/useGameStore'
import { SceneHost } from '@/react/SceneHost'
import { Hud } from '@/ui/Hud'

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const startGame = useGameStore((s) => s.startGame)
  if (screen === 'game') {
    return (
      <div className="relative h-full w-full">
        <SceneHost />
        <Hud />
      </div>
    )
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold tracking-tight text-hearth-ink">Hearthlight</h1>
      <button
        className="rounded-2xl bg-hearth-amber px-8 py-3 text-lg font-semibold text-hearth-ink shadow-lg transition hover:scale-105"
        onClick={startGame}
      >
        New Game
      </button>
    </div>
  )
}
