import { useGameStore } from '@/state/useGameStore'

export function Hud() {
  const frame = useGameStore((s) => s.engineFrame)
  return (
    <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-hearth-ink/70 px-3 py-1 text-sm text-white">
      frame {frame}
    </div>
  )
}
