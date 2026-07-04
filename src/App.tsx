import { useGameStore } from '@/state/useGameStore'
import { SceneHost } from '@/react/SceneHost'
import { Hud } from '@/ui/Hud'
import { TitleScreen } from '@/ui/TitleScreen'

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
  return <TitleScreen onStart={startGame} />
}
