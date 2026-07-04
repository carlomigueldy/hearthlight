import { useGameStore } from '@/state/useGameStore'
import { getItem } from '@/engine/items/Items'

export function Reticle() {
  const prompt = useGameStore((s) => s.prompt)
  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-2 w-2 rounded-full bg-white/80 shadow" />
      </div>
      {prompt && (
        <div className="pointer-events-none absolute left-1/2 top-[calc(50%+18px)] -translate-x-1/2 rounded-md bg-hearth-ink/80 px-3 py-1 text-sm text-white shadow">
          {prompt}
        </div>
      )}
    </>
  )
}

export function Hotbar() {
  const inv = useGameStore((s) => s.inventory)
  const first5 = inv.slice(0, 5)
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      {first5.map((s, i) => {
        const def = s ? getItem(s.itemId) : null
        return (
          <div
            key={i}
            className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-hearth-ink/60 text-white shadow"
          >
            {def ? (
              <>
                <div
                  className="mb-0.5 h-5 w-5 rounded-sm"
                  style={{ background: def.color }}
                  title={def.name}
                />
                <span className="text-xs">{s!.count}</span>
              </>
            ) : (
              <span className="text-xs text-white/40">{i + 1}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
