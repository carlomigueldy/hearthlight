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
- TDD for all engine code: failing test -> implement -> pass -> commit.

## Commit style
Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
