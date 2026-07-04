import { useEffect } from 'react'
import { useGameStore } from '@/state/useGameStore'
import { SceneHost } from '@/react/SceneHost'
import { Hud } from '@/ui/Hud'
import { TitleScreen } from '@/ui/TitleScreen'
import { Hotbar, Reticle } from '@/ui/Hotbar'
import { InventoryScreen } from '@/ui/InventoryScreen'
import { CraftingScreen } from '@/ui/CraftingScreen'

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const startGame = useGameStore((s) => s.startGame)
  const panel = useGameStore((s) => s.panel)
  const setPanel = useGameStore((s) => s.setPanel)

  // global key handling for panel toggles
  useEffect(() => {
    if (screen !== 'game') return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault()
        setPanel(panel === 'inventory' ? 'none' : 'inventory')
      } else if (e.code === 'KeyI') {
        setPanel(panel === 'inventory' ? 'none' : 'inventory')
      } else if (e.code === 'Escape') {
        setPanel('none')
      } else if (e.code === 'KeyE' && panel === 'crafting') {
        setPanel('none')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, panel, setPanel])

  if (screen !== 'game') return <TitleScreen onStart={startGame} />

  return (
    <div className="relative h-full w-full">
      <SceneHost />
      <Hud />
      <Reticle />
      <Hotbar />
      {panel === 'inventory' && <InventoryScreen />}
      {panel === 'crafting' && <CraftingScreen />}
    </div>
  )
}
