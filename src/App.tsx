import { useEffect } from 'react'
import { useGameStore } from '@/state/useGameStore'
import { SceneHost } from '@/react/SceneHost'
import { Hud } from '@/ui/Hud'
import { TitleScreen } from '@/ui/TitleScreen'
import { Hotbar, Reticle } from '@/ui/Hotbar'
import { InventoryScreen } from '@/ui/InventoryScreen'
import { CraftingScreen } from '@/ui/CraftingScreen'
import { BuildHud } from '@/ui/BuildHud'
import { PauseMenu } from '@/ui/PauseMenu'
import { saveCurrentGame } from '@/react/saveBridge'

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const startGame = useGameStore((s) => s.startGame)
  const panel = useGameStore((s) => s.panel)
  const setPanel = useGameStore((s) => s.setPanel)
  const paused = useGameStore((s) => s.paused)
  const setPaused = useGameStore((s) => s.setPaused)
  const buildMode = useGameStore((s) => s.buildMode)
  const setBuildMode = useGameStore((s) => s.setBuildMode)
  const setBuildRotation = useGameStore((s) => s.setBuildRotation)
  const buildPiece = useGameStore((s) => s.buildPiece)
  const setBuildPiece = useGameStore((s) => s.setBuildPiece)
  const setBuildDemolish = useGameStore((s) => s.setBuildDemolish)

  useEffect(() => {
    if (screen !== 'game') return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (panel !== 'none') {
          setPanel('none')
        } else if (buildMode) {
          setBuildMode(false)
        } else {
          setPaused(!paused)
        }
        return
      }
      if (paused) return
      if (e.code === 'Tab' || e.code === 'KeyI') {
        e.preventDefault()
        setPanel(panel === 'inventory' ? 'none' : 'inventory')
      } else if (e.code === 'KeyE' && panel === 'crafting') {
        setPanel('none')
      } else if (e.code === 'KeyB') {
        const next = !buildMode
        setBuildMode(next)
        if (next && !buildPiece) setBuildPiece('foundation')
        setBuildDemolish(false)
      } else if (e.code === 'KeyR' && buildMode) {
        setBuildRotation((useGameStore.getState().buildRotation + 1) % 4)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, panel, buildMode, paused, buildPiece, setPanel, setBuildMode, setBuildPiece, setBuildDemolish, setBuildRotation, setPaused])

  // autosave every 30s while playing
  useEffect(() => {
    if (screen !== 'game') return
    const id = setInterval(() => {
      if (!useGameStore.getState().paused) saveCurrentGame()
    }, 30_000)
    return () => clearInterval(id)
  }, [screen])

  if (screen !== 'game') return <TitleScreen onStart={startGame} />

  return (
    <div className="relative h-full w-full">
      <SceneHost />
      <Hud />
      <Reticle />
      <Hotbar />
      <BuildHud />
      {panel === 'inventory' && <InventoryScreen />}
      {panel === 'crafting' && <CraftingScreen />}
      {paused && <PauseMenu />}
    </div>
  )
}
