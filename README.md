# Hearthlight

A cozy, faceted low-poly, flat-shaded, open-world survival-craft cozy-fantasy game with a building system.

**Status:** Phase 0 vertical slice — **complete and live** at https://hearthlight-sepia.vercel.app

## Play
- **Live:** https://hearthlight-sepia.vercel.app
- **Local:** `pnpm install && pnpm dev`

## Controls
| Key | Action |
|---|---|
| WASD | Move |
| Shift | Sprint |
| Space | Jump |
| Mouse | Look (click to lock pointer) |
| E | Gather / open crafting |
| Tab / I | Inventory |
| B | Build mode |
| R | Rotate piece (in build mode) |
| Click | Place piece (in build mode) |
| Esc | Pause / exit build / close panel |

## Core loop
Gather wood, stone, berries, and fiber → craft an axe, planks, a campfire, and a workbench → build a home with the socket-snap building system (foundation, floor, wall, roof, door) → watch the day cycle into a cozy glowing night → save and continue later.

## Stack
React 19 · Vite · TypeScript (strict) · three.js · @react-three/fiber · @react-three/rapier · TypeGPU (Phase 1+) · zustand · Tailwind v4 · Motion · Vitest

## Architecture
Hybrid: R3F `<Canvas>` owns rendering; @react-three/rapier owns physics; a framework-free `src/engine/*` core owns simulation state (inventory, crafting, SocketGraph, save, day cycle) and mutates R3F objects by ref inside `useFrame`. React/zustand mirror only UI-facing slices.

## Project layout
- `src/engine/*` — framework-free, unit-tested simulation core
- `src/react/*` — R3F scene, player, camera, build system, bridges
- `src/ui/*` — React DOM overlay (HUD, menus, build, inventory, crafting)
- `docs/superpowers/specs/` — design spec
- `docs/superpowers/plans/` — implementation plans

## Automation
- Conventional commits → **release-please** auto-versions + changelog
- Push to `main` → **Vercel** auto-deploys to production
- CI runs typecheck/lint/test/build on every push

## Roadmap
Phase 0 (this) — foundation vertical slice. Phases 1–5: survival depth, world & creatures, cozy systems, polish, co-op multiplayer. See `docs/superpowers/specs/2026-07-04-hearthlight-phase0-design.md`.
