import { useGameStore } from '@/state/useGameStore'
import { DAY_LENGTH_SECONDS } from '@/engine/world/World'

function clockLabel(t: number): string {
  const dayFrac = (t % DAY_LENGTH_SECONDS) / DAY_LENGTH_SECONDS
  const hours24 = dayFrac * 24
  const h = Math.floor(hours24)
  const m = Math.floor((hours24 - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function Hud() {
  const frame = useGameStore((s) => s.engineFrame)
  const dayTime = useGameStore((s) => s.dayTime)
  return (
    <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1">
      <div className="rounded-lg bg-hearth-ink/70 px-3 py-1 text-sm text-white">
        {clockLabel(dayTime)}
      </div>
      <div className="rounded-lg bg-hearth-ink/40 px-2 py-0.5 text-xs text-white/70">
        frame {frame}
      </div>
      <div className="mt-1 max-w-[220px] rounded-lg bg-hearth-ink/40 px-2 py-1 text-xs text-white/80">
        WASD move · Shift sprint · Space jump · click to look
      </div>
    </div>
  )
}
