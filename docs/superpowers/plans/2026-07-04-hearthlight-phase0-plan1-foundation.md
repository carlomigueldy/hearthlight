# Hearthlight Phase 0 — Plan 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the `hearthlight` project — toolchain, framework-free engine core, art-direction contract, and a bootable R3F + Rapier scene wired to the engine — so every later plan builds on a tested foundation.

**Architecture:** Hybrid — R3F `<Canvas>` owns rendering; `@react-three/rapier` owns physics; an imperative, framework-free `src/engine/*` core owns simulation state and mutates R3F objects by ref inside `useFrame` (never via React state per entity). React/zustand mirror only UI-facing slices.

**Tech Stack:** Vite 8 + TypeScript 6 (strict) + pnpm, React 19, `three` 0.185 + `@react-three/fiber` 9 + `@react-three/drei` 10, `@react-three/rapier` 2 (Rapier.js), `typegpu` 0.11 (installed, unused until Plan 2), `simplex-noise` 4, `zustand` 5, Tailwind v4, `motion` 12, Vitest 4, Puppeteer 25 (smoke).

## Global Constraints

- TypeScript **strict**, plus `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`. Use `import type` for type-only imports.
- `src/engine/*` must be **framework-free** — no React/three-fiber imports inside `engine/` (only `three` itself and pure TS).
- Engine core mutates R3F `Object3D` refs inside `useFrame`; `zustand` mirrors **UI-facing slices only**.
- Every TypeGPU path needs a CPU fallback. (TypeGPU is unused in Plan 1; constraint stands for later.)
- All materials are **flat-shaded**; all colors come from the shared `Palette`.
- TDD: write the failing test → run it (see fail) → implement minimal code → run it (see pass) → commit.
- Pinned versions (use caret ranges in `package.json`): `react@19.2.7`, `react-dom@19.2.7`, `three@0.185.1`, `@types/three@0.185.0`, `@react-three/fiber@9.6.1`, `@react-three/drei@10.7.7`, `@react-three/rapier@2.2.0`, `typegpu@0.11.9`, `simplex-noise@4.0.3`, `zustand@5.0.14`, `motion@12.42.2`, `tailwindcss@4.3.2`, `@tailwindcss/vite@4.3.2`, `vite@8.1.3`, `@vitejs/plugin-react@6.0.3`, `typescript@6.0.3`, `vitest@4.1.9`, `eslint@10.6.0`, `@eslint/js@10.0.1`, `typescript-eslint@8.62.1`, `eslint-config-prettier@10.1.8`, `eslint-plugin-react-hooks@7.1.1`, `eslint-plugin-react-refresh@0.5.3`, `globals@17.7.0`, `prettier@3.9.4`, `@types/react@19.2.17`, `@types/react-dom@19.2.3`, `@types/node@26.1.0`, `puppeteer@25.3.0`.
- Repo already exists at `/home/carlomigueldy/game-dev/hearthlight` (git initialized, spec committed at `7ba6fa7`).

---

## File Structure (created/modified by this plan)

```
hearthlight/
  package.json                      # deps + scripts
  .gitignore
  .prettierrc.json
  tsconfig.json                     # references app + node
  tsconfig.app.json                 # strict, @/* alias
  tsconfig.node.json                # vite config
  vite.config.ts                    # react + tailwind + vitest + @ alias
  eslint.config.js                  # flat, mirrors pickle-paradise
  index.html
  src/
    main.tsx                        # React root
    App.tsx                         # screen switch (title <-> game)
    vite-env.d.ts
    styles/index.css                # tailwind v4 + cozy @theme
    state/useGameStore.ts           # zustand UI store (screen, engineFrame)
    react/
      SceneHost.tsx                 # <Canvas> + lights/sky/fog + <Physics> + EngineDriver
      EngineDriver.tsx              # useFrame -> world.fixedUpdate/render (accumulator)
      Scene.tsx                     # the bootable scene (ground + falling box)
    ui/
      TitleScreen.tsx               # Motion title + New Game
      Hud.tsx                       # engine frame counter
    engine/
      types.ts
      core/Clock.ts
      core/Loop.ts
      core/EntityStore.ts
      core/Game.ts
      core/Clock.test.ts
      core/Loop.test.ts
      core/EntityStore.test.ts
      input/InputState.ts
      input/InputState.test.ts
      math/rng.ts
      math/rng.test.ts
      math/noise.ts
      math/noise.test.ts
      assets/Palette.ts
      assets/Materials.ts
      assets/AssetLibrary.ts
      assets/Palette.test.ts
      assets/Materials.test.ts
      worlds/BridgeWorld.ts         # Plan 1 trivial world (frame counter) for the bridge
  scripts/
    smoke.mjs                       # puppeteer smoke: canvas present + no console errors
  docs/
    art-direction.md
  AGENTS.md
  CLAUDE.md
  README.md
```

---

## Task 1: Project scaffold + toolchain + docs

**Files:**
- Create: `package.json`, `.gitignore`, `.prettierrc.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `eslint.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/styles/index.css`, `src/state/useGameStore.ts`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/art-direction.md`

**Interfaces:**
- Produces: a bootable Vite app with `pnpm dev`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm format`, `pnpm smoke` scripts. Later tasks rely on the `@/*` alias and the strict TS config.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "hearthlight",
  "description": "A cozy faceted low-poly open-world survival-craft fantasy with a building system — Phase 0.",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "author": "Carlo Miguel Dy <carlomigueldy@yahoo.com> (https://carlomigueldy.dev)",
  "license": "MIT",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "smoke": "node scripts/smoke.mjs"
  },
  "dependencies": {
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.6.1",
    "@react-three/rapier": "^2.2.0",
    "motion": "^12.42.2",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "simplex-noise": "^4.0.3",
    "three": "^0.185.1",
    "typegpu": "^0.11.9",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@tailwindcss/vite": "^4.3.2",
    "@types/node": "^26.1.0",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@types/three": "^0.185.0",
    "@vitejs/plugin-react": "^6.0.3",
    "eslint": "^10.6.0",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.3",
    "globals": "^17.7.0",
    "prettier": "^3.9.4",
    "puppeteer": "^25.3.0",
    "tailwindcss": "^4.3.2",
    "typescript": "^6.0.3",
    "typescript-eslint": "^8.62.1",
    "vite": "^8.1.2",
    "vitest": "^4.1.9"
  }
}
```

- [ ] **Step 2: Write config files**

`.gitignore`:
```
node_modules
dist
dev-dist
coverage
*.tsbuildinfo
.vite
```

`.prettierrc.json`:
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

`tsconfig.json`:
```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
```

`tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "noUncheckedIndexedAccess": true,
    "paths": { "@/*": ["./src/*"] },
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "scripts/**/*", "tools/**/*"]
}
```

`vite.config.ts`:
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
```

`eslint.config.js`:
```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'coverage', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['scripts/**/*.{js,mjs}', 'tools/**/*.{js,mjs}'],
    languageOptions: { globals: globals.node },
  },
  prettier,
)
```

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#2f8f8a" />
    <title>Hearthlight — Cozy Survival-Craft</title>
    <meta
      name="description"
      content="Hearthlight is a cozy faceted low-poly open-world survival-craft fantasy game with a building system. Phase 0."
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Write `src/styles/index.css` (Tailwind v4 + cozy theme)**

```css
@import 'tailwindcss';

@theme {
  --color-hearth-water: #2f8f8a;
  --color-hearth-sand: #e8d6a0;
  --color-hearth-grass: #7aa05a;
  --color-hearth-forest: #4f7a3f;
  --color-hearth-rock: #8a8278;
  --color-hearth-amber: #e6a23c;
  --color-hearth-dusk: #e58a9a;
  --color-hearth-sun: #ffd9a0;
  --color-hearth-sky: #bfe3e0;
  --color-hearth-ink: #2b3a36;
}

html,
body,
#root {
  height: 100%;
  margin: 0;
  background: var(--color-hearth-sky);
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: var(--color-hearth-ink);
}

canvas {
  display: block;
  touch-action: none;
}
```

- [ ] **Step 4: Write `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/state/useGameStore.ts`**

`src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />
```

`src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App'
import '@/styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/state/useGameStore.ts`:
```ts
import { create } from 'zustand'

export type Screen = 'title' | 'game'

interface GameState {
  screen: Screen
  engineFrame: number
  setScreen: (s: Screen) => void
  startGame: () => void
  setEngineFrame: (n: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'title',
  engineFrame: 0,
  setScreen: (screen) => set({ screen }),
  startGame: () => set({ screen: 'game', engineFrame: 0 }),
  setEngineFrame: (engineFrame) => set({ engineFrame }),
}))
```

`src/App.tsx` (placeholder; real screens land in Task 7, but a minimal switch lets the app boot now):
```tsx
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
```

- [ ] **Step 5: Write `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/art-direction.md`**

`AGENTS.md`:
```markdown
# Agents — Hearthlight

## Commands
- `pnpm dev` — start Vite dev server
- `pnpm typecheck` — `tsc -b` (must pass before commit)
- `pnpm lint` — eslint
- `pnpm test` — vitest run (unit tests in `src/**/*.test.ts`)
- `pnpm build` — typecheck + production build
- `pnpm smoke` — puppeteer smoke test against a running dev server

## Architecture rules
- `src/engine/*` is framework-free: no React or @react-three/* imports. Only `three` and pure TS.
- Engine mutates R3F refs inside `useFrame`; `zustand` mirrors UI-facing slices only.
- All materials flat-shaded; colors from `src/engine/assets/Palette.ts` only.
- TDD for all engine code: failing test → implement → pass → commit.

## Commit style
Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
```

`CLAUDE.md`:
```markdown
# CLAUDE — Hearthlight

Read AGENTS.md first. This project uses the hybrid R3F + imperative engine architecture.
Always run `pnpm typecheck && pnpm test` before considering work complete.
```

`README.md`:
```markdown
# Hearthlight

A cozy, faceted low-poly, flat-shaded, open-world survival-craft cozy-fantasy game with a building system.

**Status:** Phase 0 vertical slice in progress.

## Getting started
\`\`\`bash
pnpm install
pnpm dev
\`\`\`

See `docs/superpowers/specs/2026-07-04-hearthlight-phase0-design.md` for the design and `docs/superpowers/plans/` for implementation plans.
```

`docs/art-direction.md`:
```markdown
# Art Direction — Hearthlight

## Look
Faceted low-poly, **flat-shaded**. Environment untextured (solid color). Visible polygon facets on terrain.

## Palette (source of truth: `src/engine/assets/Palette.ts`)
| Token | Hex | Use |
|---|---|---|
| water | #2f8f8a | sea |
| sand | #e8d6a0 | beaches |
| grass | #7aa05a | low grass |
| forest | #4f7a3f | tree/grass dark |
| rock | #8a8278 | cliffs |
| amber | #e6a23c | accents, warm light |
| dusk | #e58a9a | dawn/dusk |
| sun | #ffd9a0 | warm sunlight |
| sky | #bfe3e0 | sky/fog |
| ink | #2b3a36 | text/dark |

## Lighting
Directional sun (golden hour default), hemisphere fill, soft fog. `renderer.toneMapping = ACESFilmic`. Bloom/grade in Phase 4.

## Rules
- Quaternius assets are recolored to palette on import (Plan 2 tooling).
- Blender `bpy` pieces: flat-shaded, palette materials, no baking.
- No textures in Phase 0; color only.
```

- [ ] **Step 6: Install dependencies**

Run: `pnpm install`
Expected: installs without errors; `node_modules` created.

- [ ] **Step 7: Verify the toolchain**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: all pass (no tests yet → vitest reports "no test files found" and exits 0; if vitest exits non-zero on no tests, add a placeholder test `src/app/_smoke.test.ts` containing `test('placeholder', () => { expect(true).toBe(true) })`).

Run: `pnpm dev` (then Ctrl-C after it prints the local URL)
Expected: dev server starts, no errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold hearthlight project (Vite + TS + R3F + Rapier + Tailwind v4)"
```

---

## Task 2: Engine core — Clock, Loop, EntityStore, Game

**Files:**
- Create: `src/engine/types.ts`, `src/engine/core/Clock.ts`, `src/engine/core/Loop.ts`, `src/engine/core/EntityStore.ts`, `src/engine/core/Game.ts`
- Test: `src/engine/core/Clock.test.ts`, `src/engine/core/Loop.test.ts`, `src/engine/core/EntityStore.test.ts`

**Interfaces:**
- Produces:
  - `class Clock` with `tick(maxDelta?: number): number`
  - `class Loop` with `constructor(fixedDt, fixedUpdate, render, schedule?, cancel?, clock?)`, `start()`, `stop()`
  - `class EntityStore` with `create(components?)`, `get(id)`, `remove(id)`, `query(componentName)`, `clear()`, `size()`
  - `interface GameWorld { entities: EntityStore; fixedUpdate(dt: number): void; render(alpha: number): void }`
  - `class Game` with `constructor(world, fixedDt?)`, `start()`, `stop()`

- [ ] **Step 1: Write failing tests for `Clock`**

`src/engine/core/Clock.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { Clock } from './Clock'

describe('Clock', () => {
  it('returns elapsed seconds since last tick, capped by maxDelta', () => {
    let t = 1000
    const clock = new Clock(() => t)
    t = 1016 // 16ms later
    expect(clock.tick()).toBeCloseTo(0.016, 5)
  })

  it('caps large deltas to avoid spiral-of-death', () => {
    let t = 0
    const clock = new Clock(() => t)
    t = 5_000 // 5s gap
    expect(clock.tick(0.1)).toBe(0.1)
  })

  it('never returns negative time', () => {
    let t = 10
    const clock = new Clock(() => t)
    t = 5 // clock went backwards
    expect(clock.tick()).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/engine/core/Clock.test.ts`
Expected: FAIL — `Cannot find module './Clock'` or `Clock is not defined`.

- [ ] **Step 3: Implement `Clock`**

`src/engine/core/Clock.ts`:
```ts
export class Clock {
  private last: number
  constructor(private readonly now: () => number = () => performance.now()) {
    this.last = now()
  }

  /** Seconds since the last tick, capped to `maxDelta` and floored at 0. */
  tick(maxDelta = 0.1): number {
    const t = this.now()
    let dt = (t - this.last) / 1000
    this.last = t
    if (dt > maxDelta) dt = maxDelta
    if (dt < 0) dt = 0
    return dt
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/engine/core/Clock.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write failing tests for `Loop`**

`src/engine/core/Loop.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { Loop } from './Loop'
import { Clock } from './Clock'

describe('Loop', () => {
  it('calls fixedUpdate the correct number of times for accumulated time', () => {
    let now = 0
    const clock = new Clock(() => now)
    const fixedCalls: number[] = []
    const renderCalls: number[] = []
    let scheduled: (() => void) | null = null
    const schedule = (cb: () => void) => {
      scheduled = cb
      return 1
    }
    const loop = new Loop(
      1 / 60,
      (dt) => fixedCalls.push(dt),
      (alpha) => renderCalls.push(alpha),
      schedule,
      () => {},
      clock,
    )
    loop.start()
    expect(scheduled).not.toBeNull()
    // advance 1/60 s
    now = 1000 / 60
    scheduled!()
    expect(fixedCalls.length).toBe(1)
    expect(renderCalls.length).toBe(1)
  })

  it('stops calling after stop()', () => {
    let now = 0
    const clock = new Clock(() => now)
    let calls = 0
    let scheduled: (() => void) | null = null
    const loop = new Loop(
      1 / 60,
      () => {
        calls++
      },
      () => {},
      (cb) => {
        scheduled = cb
        return 1
      },
      () => {},
      clock,
    )
    loop.start()
    loop.stop()
    now = 1
    scheduled!()
    expect(calls).toBe(0)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `pnpm test src/engine/core/Loop.test.ts`
Expected: FAIL — `Cannot find module './Loop'`.

- [ ] **Step 7: Implement `Loop`**

`src/engine/core/Loop.ts`:
```ts
import { Clock } from './Clock'

export type FixedUpdateFn = (dt: number) => void
export type RenderFn = (alpha: number) => void
export type ScheduleFrame = (cb: () => void) => number
export type CancelFrame = (id: number) => void

/**
 * Fixed-timestep loop with an accumulator. In the browser, R3F's `useFrame`
 * usually drives the world instead; this class is for headless tests and any
 * non-R3F host. `schedule`/`cancel` are injectable so tests don't need RAF.
 */
export class Loop {
  private acc = 0
  private running = false
  private rafId = 0
  constructor(
    private readonly fixedDt: number,
    private readonly fixedUpdate: FixedUpdateFn,
    private readonly render: RenderFn,
    private readonly schedule: ScheduleFrame = (cb) => requestAnimationFrame(cb),
    private readonly cancel: CancelFrame = (id) => cancelAnimationFrame(id),
    private readonly clock: Clock = new Clock(),
  ) {}

  start() {
    if (this.running) return
    this.running = true
    const tick = () => {
      if (!this.running) return
      const frame = this.clock.tick()
      this.acc += frame
      let steps = 0
      while (this.acc >= this.fixedDt && steps < 5) {
        this.fixedUpdate(this.fixedDt)
        this.acc -= this.fixedDt
        steps++
      }
      this.render(this.acc / this.fixedDt)
      this.rafId = this.schedule(tick)
    }
    this.rafId = this.schedule(tick)
  }

  stop() {
    this.running = false
    this.cancel(this.rafId)
  }
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `pnpm test src/engine/core/Loop.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 9: Write failing tests for `EntityStore`**

`src/engine/core/EntityStore.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { EntityStore } from './EntityStore'

describe('EntityStore', () => {
  it('creates entities with unique ids and stores components', () => {
    const s = new EntityStore()
    const a = s.create({ position: { x: 1 } })
    const b = s.create({ position: { x: 2 } })
    expect(a.id).not.toBe(b.id)
    expect(s.get(a.id)?.components['position']).toEqual({ x: 1 })
    expect(s.size()).toBe(2)
  })

  it('queries entities that have a component', () => {
    const s = new EntityStore()
    s.create({ position: { x: 1 } })
    s.create({ position: { x: 2 }, velocity: { v: 1 } })
    s.create({ velocity: { v: 2 } })
    expect(s.query('velocity').length).toBe(2)
    expect(s.query('position').length).toBe(2)
  })

  it('removes entities', () => {
    const s = new EntityStore()
    const e = s.create({ foo: 1 })
    s.remove(e.id)
    expect(s.get(e.id)).toBeUndefined()
    expect(s.size()).toBe(0)
  })

  it('clears all entities', () => {
    const s = new EntityStore()
    s.create({ foo: 1 })
    s.create({ bar: 2 })
    s.clear()
    expect(s.size()).toBe(0)
  })
})
```

- [ ] **Step 10: Run test to verify it fails**

Run: `pnpm test src/engine/core/EntityStore.test.ts`
Expected: FAIL — `Cannot find module './EntityStore'`.

- [ ] **Step 11: Implement `EntityStore` + `types.ts` + `Game`**

`src/engine/types.ts`:
```ts
export type ComponentMap = Record<string, unknown>

export interface Entity {
  id: number
  components: ComponentMap
}
```

`src/engine/core/EntityStore.ts`:
```ts
import type { ComponentMap, Entity } from '../types'

let nextId = 1

/** Minimal ECS-style store. Framework-free. */
export class EntityStore {
  private readonly entities = new Map<number, Entity>()

  create(components: ComponentMap = {}): Entity {
    const e: Entity = { id: nextId++, components }
    this.entities.set(e.id, e)
    return e
  }

  get(id: number): Entity | undefined {
    return this.entities.get(id)
  }

  remove(id: number): void {
    this.entities.delete(id)
  }

  /** All entities that possess the named component. */
  query(componentName: string): Entity[] {
    const out: Entity[] = []
    for (const e of this.entities.values()) {
      if (componentName in e.components) out.push(e)
    }
    return out
  }

  clear(): void {
    this.entities.clear()
  }

  size(): number {
    return this.entities.size
  }
}
```

`src/engine/core/Game.ts`:
```ts
import { Loop } from './Loop'
import type { EntityStore } from './EntityStore'

export interface GameWorld {
  entities: EntityStore
  fixedUpdate(dt: number): void
  render(alpha: number): void
}

/** Owns the fixed-timestep loop driving a `GameWorld`. */
export class Game {
  private readonly loop: Loop
  constructor(
    private readonly world: GameWorld,
    fixedDt = 1 / 60,
  ) {
    this.loop = new Loop(fixedDt, (dt) => world.fixedUpdate(dt), (alpha) => world.render(alpha))
  }

  start(): void {
    this.loop.start()
  }

  stop(): void {
    this.loop.stop()
  }
}
```

- [ ] **Step 12: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS — Clock (3), Loop (2), EntityStore (4) tests green.

- [ ] **Step 13: Commit**

```bash
git add src/engine
git commit -m "feat(engine): Clock, Loop, EntityStore, Game core"
```

---

## Task 3: Engine input — InputState

**Files:**
- Create: `src/engine/input/InputState.ts`, `src/engine/input/InputState.test.ts`

**Interfaces:**
- Produces: `class InputState` with `onKeyDown(code)`, `onKeyUp(code)`, `isDown(code)`, `isJustPressed(code)`, `addMouseDelta(x,y)`, `consumeMouseDelta()`, `endFrame()`.

- [ ] **Step 1: Write failing test**

`src/engine/input/InputState.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { InputState } from './InputState'

describe('InputState', () => {
  it('tracks held keys', () => {
    const i = new InputState()
    i.onKeyDown('KeyW')
    expect(i.isDown('KeyW')).toBe(true)
    i.onKeyUp('KeyW')
    expect(i.isDown('KeyW')).toBe(false)
  })

  it('tracks just-pressed until endFrame', () => {
    const i = new InputState()
    i.onKeyDown('Space')
    expect(i.isJustPressed('Space')).toBe(true)
    i.endFrame()
    expect(i.isJustPressed('Space')).toBe(false)
    expect(i.isDown('Space')).toBe(true)
  })

  it('accumulates and consumes mouse delta', () => {
    const i = new InputState()
    i.addMouseDelta(10, -5)
    i.addMouseDelta(2, 3)
    expect(i.consumeMouseDelta()).toEqual({ x: 12, y: -2 })
    expect(i.consumeMouseDelta()).toEqual({ x: 0, y: 0 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/engine/input/InputState.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `InputState`**

`src/engine/input/InputState.ts`:
```ts
export interface Vec2 {
  x: number
  y: number
}

/** Per-frame keyboard/mouse state. `endFrame()` clears per-frame flags. */
export class InputState {
  private readonly keys = new Set<string>()
  private readonly justPressed = new Set<string>()
  private mouseDelta: Vec2 = { x: 0, y: 0 }

  onKeyDown(code: string): void {
    this.keys.add(code)
    this.justPressed.add(code)
  }

  onKeyUp(code: string): void {
    this.keys.delete(code)
  }

  isDown(code: string): boolean {
    return this.keys.has(code)
  }

  isJustPressed(code: string): boolean {
    return this.justPressed.has(code)
  }

  addMouseDelta(x: number, y: number): void {
    this.mouseDelta.x += x
    this.mouseDelta.y += y
  }

  consumeMouseDelta(): Vec2 {
    const d = { ...this.mouseDelta }
    this.mouseDelta = { x: 0, y: 0 }
    return d
  }

  /** Call at the end of each frame. */
  endFrame(): void {
    this.justPressed.clear()
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/engine/input/InputState.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/engine/input
git commit -m "feat(engine): InputState (keyboard + mouse delta)"
```

---

## Task 4: Engine math — seeded RNG + noise

**Files:**
- Create: `src/engine/math/rng.ts`, `src/engine/math/rng.test.ts`, `src/engine/math/noise.ts`, `src/engine/math/noise.test.ts`

**Interfaces:**
- Produces: `function mulberry32(seed: number): () => number` and `function createSeededNoise2D(seed: number): Noise2D` where `Noise2D = (x: number, y: number) => number`.

- [ ] **Step 1: Write failing test for RNG**

`src/engine/math/rng.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mulberry32 } from './rng'

describe('mulberry32', () => {
  it('is deterministic for the same seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const seqA = Array.from({ length: 5 }, () => a())
    const seqB = Array.from({ length: 5 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('produces values in [0, 1)', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('differs for different seeds', () => {
    const a = mulberry32(1)()
    const b = mulberry32(2)()
    expect(a).not.toBe(b)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/engine/math/rng.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `rng`**

`src/engine/math/rng.ts`:
```ts
/** Seeded PRNG (mulberry32). Deterministic across runs for a given seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/engine/math/rng.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write failing test for noise**

`src/engine/math/noise.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { createSeededNoise2D } from './noise'

describe('createSeededNoise2D', () => {
  it('is deterministic for the same seed', () => {
    const n1 = createSeededNoise2D(123)
    const n2 = createSeededNoise2D(123)
    const a = n1(0.5, 0.25)
    const b = n2(0.5, 0.25)
    expect(a).toBe(b)
  })

  it('returns values in [-1, 1]', () => {
    const n = createSeededNoise2D(9)
    for (let i = 0; i < 200; i++) {
      const v = n(i * 0.13, i * 0.29)
      expect(v).toBeGreaterThanOrEqual(-1)
      expect(v).toBeLessThanOrEqual(1)
    }
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `pnpm test src/engine/math/noise.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement `noise`**

`src/engine/math/noise.ts`:
```ts
import { createNoise2D } from 'simplex-noise'
import { mulberry32 } from './rng'

export type Noise2D = (x: number, y: number) => number

/** Simplex noise seeded by `seed` via mulberry32. Deterministic. */
export function createSeededNoise2D(seed: number): Noise2D {
  return createNoise2D(mulberry32(seed))
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `pnpm test src/engine/math/noise.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add src/engine/math
git commit -m "feat(engine): seeded mulberry32 RNG + seeded simplex noise"
```

---

## Task 5: Engine assets — Palette, Materials, AssetLibrary

**Files:**
- Create: `src/engine/assets/Palette.ts`, `src/engine/assets/Materials.ts`, `src/engine/assets/AssetLibrary.ts`, `src/engine/assets/Palette.test.ts`, `src/engine/assets/Materials.test.ts`

**Interfaces:**
- Produces:
  - `const Palette` (record of token → hex) and `type PaletteColor = keyof typeof Palette`
  - `function flatColor(color: string): THREE.MeshStandardMaterial`
  - `function paletteMaterial(name: PaletteColor): THREE.MeshStandardMaterial`
  - `interface AssetEntry { id: string; url: string }`
  - `class AssetLibrary` with `load(entries): Promise<void>`, `get(id): THREE.GLTF | undefined`

- [ ] **Step 1: Write failing test for `Palette`**

`src/engine/assets/Palette.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { Palette } from './Palette'

describe('Palette', () => {
  it('contains all required cozy tokens with hex values', () => {
    const required = ['water', 'sand', 'grass', 'forest', 'rock', 'amber', 'duskPink', 'sunWarm', 'sunCool', 'sky']
    for (const k of required) {
      expect(Palette[k as keyof typeof Palette]).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/engine/assets/Palette.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `Palette`**

`src/engine/assets/Palette.ts`:
```ts
export const Palette = {
  water: '#2f8f8a',
  sand: '#e8d6a0',
  grass: '#7aa05a',
  forest: '#4f7a3f',
  rock: '#8a8278',
  amber: '#e6a23c',
  duskPink: '#e58a9a',
  sunWarm: '#ffd9a0',
  sunCool: '#9fb6c8',
  sky: '#bfe3e0',
} as const

export type PaletteColor = keyof typeof Palette
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/engine/assets/Palette.test.ts`
Expected: PASS.

- [ ] **Step 5: Write failing test for `Materials`**

`src/engine/materials/Materials.test.ts` is wrong path — use `src/engine/assets/Materials.test.ts`:

`src/engine/assets/Materials.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { flatColor, paletteMaterial } from './Materials'
import { Palette } from './Palette'

describe('Materials', () => {
  it('flatColor returns a flat-shaded MeshStandardMaterial with the given color', () => {
    const m = flatColor('#ff0000')
    expect(m.flatShading).toBe(true)
    expect(m.roughness).toBe(1)
    expect(m.metalness).toBe(0)
    // color stored as linear; just check it's a THREE.Color-ish object
    expect(typeof m.color.getHexString()).toBe('string')
  })

  it('paletteMaterial uses the palette hex for the named token', () => {
    const m = paletteMaterial('amber')
    expect('#' + m.color.getHexString()).toBe(Palette.amber.toLowerCase())
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `pnpm test src/engine/assets/Materials.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 7: Implement `Materials`**

`src/engine/assets/Materials.ts`:
```ts
import * as THREE from 'three'
import { Palette, type PaletteColor } from './Palette'

/** A flat-shaded, unlit-ish standard material in a solid color. */
export function flatColor(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 1,
    metalness: 0,
  })
}

/** Flat-shaded material pulled from the shared palette by token. */
export function paletteMaterial(name: PaletteColor): THREE.MeshStandardMaterial {
  return flatColor(Palette[name])
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `pnpm test src/engine/assets/Materials.test.ts`
Expected: PASS.

- [ ] **Step 9: Implement `AssetLibrary` (no unit test — it wraps `GLTFLoader`; covered by smoke in Task 6)**

`src/engine/assets/AssetLibrary.ts`:
```ts
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export interface AssetEntry {
  id: string
  url: string
}

/** Loads and caches GLB/GLTF assets. Framework-free (uses three directly). */
export class AssetLibrary {
  private readonly loader = new GLTFLoader()
  private readonly cache = new Map<string, GLTF>()

  async load(entries: AssetEntry[]): Promise<void> {
    await Promise.all(
      entries.map(async (e) => {
        const gltf = await this.loader.loadAsync(e.url)
        this.cache.set(e.id, gltf)
      }),
    )
  }

  get(id: string): GLTF | undefined {
    return this.cache.get(id)
  }
}
```

- [ ] **Step 10: Run all tests + typecheck**

Run: `pnpm test && pnpm typecheck`
Expected: all PASS, no type errors.

- [ ] **Step 11: Commit**

```bash
git add src/engine/assets
git commit -m "feat(engine): Palette, flat-shaded Materials, AssetLibrary (GLB loader)"
```

---

## Task 6: React SceneHost + engine bridge + bootable scene

**Files:**
- Create: `src/engine/worlds/BridgeWorld.ts`, `src/react/SceneHost.tsx`, `src/react/EngineDriver.tsx`, `src/react/Scene.tsx`, `scripts/smoke.mjs`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `GameWorld` (from `engine/core/Game`), `EntityStore`, `Palette`, `paletteMaterial`, `useGameStore`.
- Produces: `<SceneHost />` (R3F `<Canvas>` + lights/sky/fog + Rapier `<Physics>` + `<EngineDriver>` + `<Scene>`), `<EngineDriver world={...} />` (useFrame accumulator), `createBridgeWorld(onTick)` (Plan 1 trivial world).

- [ ] **Step 1: Implement `BridgeWorld` (engine → bridge → zustand)**

`src/engine/worlds/BridgeWorld.ts`:
```ts
import { EntityStore, type GameWorld } from '../core/Game'

/**
 * Plan 1's trivial world: counts fixed-update frames and reports every 10th
 * to `onTick` (wired to zustand in SceneHost). Proves the engine -> UI bridge.
 * Replaced by the real world in Plan 2.
 */
export function createBridgeWorld(onTick: (frame: number) => void): GameWorld {
  const entities = new EntityStore()
  let frame = 0
  return {
    entities,
    fixedUpdate() {
      frame++
      if (frame % 10 === 0) onTick(frame)
    },
    render() {
      // no-op for now; Plan 2 mutates Object3D refs here
    },
  }
}
```

- [ ] **Step 2: Implement `EngineDriver` (useFrame → world.fixedUpdate/render)**

`src/react/EngineDriver.tsx`:
```tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { GameWorld } from '@/engine/core/Game'

const FIXED_DT = 1 / 60

/** Drives a framework-free `GameWorld` from R3F's render loop via an accumulator. */
export function EngineDriver({ world }: { world: GameWorld }) {
  const acc = useRef(0)
  useFrame((_, delta) => {
    acc.current += delta
    let steps = 0
    while (acc.current >= FIXED_DT && steps < 5) {
      world.fixedUpdate(FIXED_DT)
      acc.current -= FIXED_DT
      steps++
    }
    world.render(acc.current / FIXED_DT)
  })
  return null
}
```

- [ ] **Step 3: Implement `Scene` (lit ground + falling box, proving R3F + Rapier + palette)**

`src/react/Scene.tsx`:
```tsx
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { paletteMaterial } from '@/engine/assets/Materials'

export function Scene() {
  return (
    <Physics>
      {/* Ground */}
      <RigidBody type="fixed">
        <CuboidCollider args={[20, 0.5, 20]} position={[0, -0.5, 0]} />
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[40, 1, 40]} />
          <primitive object={paletteMaterial('sand')} attach="material" />
        </mesh>
      </RigidBody>

      {/* Falling box */}
      <RigidBody position={[0, 6, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <primitive object={paletteMaterial('amber')} attach="material" />
        </mesh>
      </RigidBody>
    </Physics>
  )
}
```

- [ ] **Step 4: Implement `SceneHost` (Canvas + lights/sky/fog + driver + scene)**

`src/react/SceneHost.tsx`:
```tsx
import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import { EngineDriver } from './EngineDriver'
import { Scene } from './Scene'
import { createBridgeWorld } from '@/engine/worlds/BridgeWorld'
import { useGameStore } from '@/state/useGameStore'

export function SceneHost() {
  const setEngineFrame = useGameStore((s) => s.setEngineFrame)
  const world = useMemo(() => createBridgeWorld(setEngineFrame), [setEngineFrame])

  return (
    <Canvas
      shadows
      camera={{ fov: 55, position: [6, 5, 9], near: 0.1, far: 200 }}
      gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={(state) => {
        state.scene.fog = new THREE.Fog('#bfe3e0', 30, 120)
        state.scene.background = new THREE.Color('#bfe3e0')
      }}
    >
      <hemisphereLight args={['#ffd9a0', '#4f7a3f', 0.6]} />
      <directionalLight
        position={[10, 14, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <ambientLight intensity={0.15} />
      <Sky sunPosition={[10, 14, 6]} turbidity={6} rayleigh={1.5} />
      <EngineDriver world={world} />
      <Scene />
    </Canvas>
  )
}
```

- [ ] **Step 5: Wire `App.tsx` to render `SceneHost` + a minimal HUD**

`src/App.tsx` (replace the placeholder):
```tsx
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
```

- [ ] **Step 6: Create `src/ui/Hud.tsx` (engine frame counter — proves the bridge)**

`src/ui/Hud.tsx`:
```tsx
import { useGameStore } from '@/state/useGameStore'

export function Hud() {
  const frame = useGameStore((s) => s.engineFrame)
  return (
    <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-hearth-ink/70 px-3 py-1 text-sm text-white">
      frame {frame}
    </div>
  )
}
```

- [ ] **Step 7: Typecheck**

Run: `pnpm typecheck`
Expected: PASS — no type errors. (The `GLTF` type is imported from `three/examples/jsm/loaders/GLTFLoader.js` in `AssetLibrary.ts`.)

- [ ] **Step 8: Manual verify**

Run: `pnpm dev`, open the printed URL in Chrome.
Expected:
- Title screen renders with "Hearthlight" + "New Game".
- Click "New Game" → a 3D scene appears: a sand-colored ground, an amber box that **falls and lands** on the ground (Rapier physics working), golden-hour sky, soft fog.
- The HUD "frame N" counter **increments** (engine → zustand → React bridge working).
- No console errors.

- [ ] **Step 9: Write the puppeteer smoke script**

`scripts/smoke.mjs`:
```js
import puppeteer from 'puppeteer'

const url = process.env.SMOKE_URL ?? 'http://localhost:5173'
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
page.on('pageerror', (err) => errors.push(String(err)))

await page.goto(url, { waitUntil: 'networkidle0' })
// click New Game
await page.waitForSelector('button')
await page.click('button')
await page.waitForSelector('canvas', { timeout: 10_000 })
await new Promise((r) => setTimeout(r, 1500)) // let physics settle

const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'))
const frameText = await page.evaluate(() => document.body.innerText)

await browser.close()

if (!hasCanvas) {
  console.error('FAIL: no <canvas> after New Game')
  process.exit(1)
}
if (errors.length) {
  console.error('FAIL: console errors:\n' + errors.join('\n'))
  process.exit(1)
}
if (!/frame\s+\d+/.test(frameText) || /frame\s+0(?!\d)/.test(frameText)) {
  console.error('FAIL: engine frame counter not incrementing')
  process.exit(1)
}
console.log('SMOKE OK')
```

- [ ] **Step 10: Run smoke test**

In one terminal: `pnpm dev`
In another: `SMOKE_URL=http://localhost:5173 pnpm smoke`
Expected: prints `SMOKE OK`, exit code 0.

- [ ] **Step 11: Commit**

```bash
git add src/react src/engine/worlds src/ui scripts/smoke.mjs src/App.tsx
git commit -m "feat: bootable R3F + Rapier scene wired to engine core (Plan 1 vertical slice)"
```

---

## Task 7: UI shell — Title screen polish + Motion

**Files:**
- Create: `src/ui/TitleScreen.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `<TitleScreen onStart={...} />` using `motion` for a cozy fade/scale entrance.

- [ ] **Step 1: Implement `TitleScreen` with Motion**

`src/ui/TitleScreen.tsx`:
```tsx
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
```

- [ ] **Step 2: Use `TitleScreen` in `App.tsx`**

Replace the title block in `src/App.tsx` with:
```tsx
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
```

- [ ] **Step 3: Typecheck + manual verify**

Run: `pnpm typecheck`
Expected: PASS.

Run: `pnpm dev`
Expected: title screen fades in with Motion; "New Game" hovers/taps; clicking enters the scene as before.

- [ ] **Step 4: Re-run smoke**

`SMOKE_URL=http://localhost:5173 pnpm smoke` (with `pnpm dev` running)
Expected: `SMOKE OK`.

- [ ] **Step 5: Commit**

```bash
git add src/ui/TitleScreen.tsx src/App.tsx
git commit -m "feat(ui): Motion-animated title screen"
```

---

## Self-Review (run after all tasks)

- [ ] **Spec coverage:** Phase 0 spec §3 stack → Task 1. §4 architecture (engine/UI boundary, folder layout) → Tasks 1–2, 6. §5 art direction (Palette/Materials, flat shading) → Task 5 + `docs/art-direction.md`. §6 world/terrain → **deferred to Plan 2** (TypeGPU island). §7 player/camera → **Plan 2**. §8 systems (gather/inventory/craft/build/day-night/save) → **Plans 2–5**. §9 UI/HUD → minimal title + HUD in Tasks 6–7; full HUD in Plan 5. §10 testing → Vitest unit tests in every engine task + puppeteer smoke in Task 6. §11 risks → Rapier/TypeGPU/socket-snap risks belong to Plans 2–4. **No gaps for Plan 1's stated scope.**
- [ ] **Placeholder scan:** no TBD/TODO/vague steps; every code step has complete code; every test step has real assertions.
- [ ] **Type consistency:** `GameWorld` interface used identically in `Game.ts` (Task 2) and `BridgeWorld.ts` (Task 6) and `EngineDriver.tsx` (Task 6). `PaletteColor`/`Palette` consistent between `Palette.ts` and `Materials.ts`. `EntityStore` API (`create`/`get`/`remove`/`query`/`clear`/`size`) matches tests. `InputState` method names match test. `mulberry32`/`createSeededNoise2D` signatures match tests.

## Notes for later plans

- **Plan 2** replaces `BridgeWorld` with a real world that owns terrain (TypeGPU compute + CPU fallback) and a Rapier kinematic character controller; introduces `tools/quaternius` (fetch + palette-remap) for the player character.
- **Plan 3** adds gather/inventory/craft + the first R3F-driven entity updates from the engine.
- **Plan 4** adds the socket-snap build system on top of the inventory.
- **Plan 5** adds day/night, save/load, and full HUD/menu polish to complete the Phase 0 DoD.
