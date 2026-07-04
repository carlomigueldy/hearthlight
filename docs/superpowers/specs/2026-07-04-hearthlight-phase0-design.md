# Hearthlight — Phase 0 Design Spec

- **Date:** 2026-07-04
- **Status:** Draft — pending user review
- **Owner:** Carlo Miguel Dy
- **Working slug:** `hearthlight` (changeable)
- **Phase:** 0 (Foundation vertical slice)

## 1. Vision

A cozy, "AAA-inspired," award-winning-stylized, faceted low-poly, flat-shaded, open-world survival-craft cozy-fantasy game with a building system. This is decomposed into a multi-phase roadmap (Section 12). **Phase 0** delivers a tight, playable vertical slice that nails the *aesthetic* and the *core loop* on a single healing island: explore → gather → craft → build → rest. Near-zero threat. No combat.

**Core fantasy:** You arrive on a faded, abandoned island, gather its resources, craft tools, and rebuild a homestead — gradually restoring the land. Survival is gentle resource/time management, not danger. Tone references: *Spiritfarer* × *Animal Crossing* × *Stardew Valley*, rendered in the faceted low-poly look of *A Short Hike* / *The Long Dark*.

## 2. Goals & Non-Goals

### Goals (Phase 0)
- A beautiful, cohesive faceted flat-shaded cozy aesthetic across procedural, Quaternius, and Blender-`bpy` assets.
- A responsive third-person character on a procedural faceted island at golden hour.
- The full core loop: gather 4 resources → craft tools/stations/materials → socket-snap build → day/night → save/load.
- 60 fps on a midrange desktop in Chrome.
- A framework-free, testable simulation core that scales into later phases.

### Non-Goals (explicitly deferred)
- Combat, hostile creatures, AI — Phase 2.
- Survival stats beyond minimal/hidden (hunger/stamina/health) — Phase 1.
- Multiple biomes, weather, seasons — Phase 2.
- NPCs, quests, farming, cooking, decorating — Phase 3.
- Co-op multiplayer — Phase 5.
- Mobile/touch — Phase 4.
- Audio and post-FX polish (bloom/color grade) — Phase 4. Phase 0 keeps minimal SFX/ambient only if cheap; no post-processing.

## 3. Stack

| Concern | Choice |
|---|---|
| Language | TypeScript (strict) |
| Build / dev server | Vite |
| Package manager | pnpm |
| UI framework | React 19 |
| 3D rendering | `three` + `@react-three/fiber` (R3F) + `@react-three/drei` |
| Physics | `@react-three/rapier` (Rapier.js WASM) |
| GPU compute | TypeGPU (WebGPU), with CPU fallback |
| UI state | `zustand` |
| UI styling | Tailwind v4 |
| UI animation | `motion` |
| Noise | `simplex-noise` (CPU fallback / shared params) |
| Testing | `vitest` + `puppeteer` (browser smoke) |
| Asset tooling | Blender `bpy` scripts + Quaternius pack import scripts |

**WebGPU caveat:** TypeGPU requires WebGPU (Chrome/Edge solid; Firefox/Safari lagging). Every TypeGPU code path must have a CPU fallback so the slice runs without WebGPU. Phase 0 keeps the compute surface small (terrain meshing + grass/wind) precisely to bound this risk.

## 4. Architecture

### 4.1 Engine/UI boundary (hybrid)
- **`src/engine/*`** — framework-free TypeScript (no React imports). Owns all *simulation state and logic*: inventory, crafting, the build SocketGraph, save, day cycle, gather nodes, terrain params. It mutates R3F `Object3D`s **by ref inside `useFrame`** — never via React state per entity, so dynamic objects never trigger React re-renders.
- **`src/react/SceneHost.tsx`** — owns the R3F `<Canvas>`, lights/sky/fog, asset loading, and the Rapier `<Physics>` world. Boots the engine core in a `useEffect`, forwards resize + input. No declarative per-entity world objects (entities are driven imperatively from the core).
- **`src/ui/*` + `src/state/*`** — React DOM overlay (HUD, menus, build UI). Subscribes to engine via a typed event/store bridge; `zustand` mirrors **only UI-facing slices** (hotbar, inventory contents for the open screen, clock, build-mode state).

### 4.2 Folder layout
```
hearthlight/
  src/
    main.tsx                # React root
    App.tsx                 # top-level: SceneHost + UI overlay + bootstrap
    engine/
      core/                 # Game, World, EntityStore (ECS-lite), Clock, Loop
      world/                # TerrainGenerator (TypeGPU + CPU fallback), Chunk, Biome, FoliageScatter
      player/               # PlayerController (Rapier kinematic), CameraRig, Interaction
      build/                # BuildSystem, SocketGraph, PieceDef, Placement
      inventory/            # Inventory, ItemStack
      craft/                # CraftingSystem, recipes (data)
      gather/               # ResourceNode, Gatherable
      daycycle/             # DayNightCycle
      save/                 # SaveSystem (serialize/deserialize)
      assets/               # AssetManifest, GLB loaders, Palette, Materials
      input/                # InputState (kbd/mouse)
      math/                 # noise, rng, geom helpers
      types.ts
    react/
      SceneHost.tsx
      bridges/              # engine -> zustand mirrors
    ui/
      hud/ menus/ build/
    state/                  # zustand stores (UI-facing only)
    styles/ utils/
  tools/
    blender/                # bpy scripts (consistent art direction)
    quaternius/             # pack fetch/import + palette remap scripts
  docs/
    superpowers/specs/      # this doc + later phase specs
    art-direction.md
  AGENTS.md CLAUDE.md
  package.json pnpm-workspace.yaml tsconfig.json vite.config.ts eslint.config.js
  # Tailwind v4: configured via CSS @import in src/styles, no tailwind.config.*
```

### 4.3 Data flow
```
Input (kbd/mouse) ──> engine InputState ──> engine core (fixed-timestep update)
                                              │
            ┌─────────────────────────────────┼──────────────────────┐
            ▼                                 ▼                      ▼
      Rapier physics step            SocketGraph / Inventory    DayNightCycle
            │                                 │                      │
            ▼                                 ▼                      ▼
   mutate R3F Object3D refs (useFrame) ───────┘                      │
            │                                                        │
            └──── scene rendered by R3F <Canvas> <───────────────────┘
            │
            └── typed event/store bridge ──> zustand (UI-facing) ──> React DOM overlay
```

## 5. Art Direction

- **Faceted low-poly, flat-shaded** (`material.flatShading = true`). Environment is untextured (solid color). Quaternius assets are recolored on import to the shared palette.
- **Cozy healing-island palette**: soft teal water, warm sand, sage greens, dusk-pink + amber accents, low saturation. Authored in a single `Palette`/`Materials` module so procedural + Quaternius + Blender-`bpy` pieces all read cohesive.
- **Lighting**: a directional "sun" driven by the day/night cycle (warm dawn/dusk, cool night), hemisphere fill, soft fog for depth/coziness. `renderer.toneMapping = ACESFilmic`. Bloom/grade deferred to Phase 4.
- **Asset sources**:
  - **Quaternius (CC0)** packs: Characters (player), Wooden Cabin / Medieval (build pieces), Nature (foliage/rocks/trees).
  - **Blender `bpy`** fills any gaps with flat-shaded, palette-colored pieces (no baking; flat colors only).
  - **Procedural** geometry for terrain and scatter primitives.
- A `docs/art-direction.md` companion will codify palette swatches, facet density targets, and material rules.

## 6. World & Terrain

- Single island ~256 m across, surrounded by a water plane to the horizon. Seed + noise params are hand-tunable.
- **Generation (TypeGPU compute, CPU fallback)**: simplex heightfield → meshed into a faceted low-poly mesh (decimated to visible facets) → flat-shaded. Elevation bands: beach → grass → forest → rock.
- **Chunking**: 8×8 chunk structure exists now for future streaming; Phase 0 loads the whole island (small enough).
- **Colliders**: a Rapier **fixed heightfield collider** for player grounding; cuboid colliders per build piece.
- **Foliage/rocks/trees**: instanced via Poisson-disk scatter; grass/vegetation wind driven by a TypeGPU compute pass (CPU fallback).
- No caves, no pre-placed structures beyond the player's own builds. 1–2 optional "ruin" props for restoring-island flavor.

## 7. Player & Camera

- Third-person, visible Quaternius humanoid.
- **Controller**: Rapier **kinematic character controller** — walk, sprint, jump, with slope/step handling. Grounded via the Rapier controller (not hand-rolled raycasts).
- **Camera rig** (R3F): orbit-follow with terrain-collision (no clipping), wheel zoom, shoulder offset.
- **Interaction**: screen-center reticle raycast → highlight interactable (resource node / build piece / station) → `E`. Build mode changes reticle behavior.
- Input: desktop keyboard + mouse for Phase 0. No stamina yet (survival stats arrive in Phase 1).

## 8. Core Loop Systems

### 8.1 Gather
- ResourceNodes scattered: trees → wood, rocks → stone, berry bushes → food, reeds → fiber (~4 types).
- Interact to deplete (hits/uses); drops into inventory. Generous respawn timer (cozy). Instanced where possible.

### 8.2 Inventory
- Grid (20 slots), `ItemStack { itemId, count, maxStack }`.
- Engine owns data; React mirrors via zustand. Drag-drop UI, tooltips.

### 8.3 Craft
- Data-driven recipes: `{ id, inputs[], output, station? }`.
- Phase 0 recipes: campfire, workbench, axe (improves gather), plank (build material), and the build pieces themselves.
- Some recipes hand-craft; others require a placed station (interact to open the craft menu).

### 8.4 Build (socket-snap, Valheim-style)
- `B` toggles build mode. HUD shows piece palette + material cost.
- Phase 0 piece set: **foundation, floor, wall, roof, door** (Quaternius/`bpy` meshes with declared socket points).
- Ghost preview follows the reticle; snaps to nearby sockets within range + angle (90° increments); valid/invalid via Rapier **shape-cast** against terrain + existing pieces.
- `SocketGraph` + spatial hash for neighbor queries. Demolish → partial material refund.
- Grid-free placement, 90° snap angles for tidy building.

### 8.5 Day/Night
- Drives sun angle, light color, sky/fog. ~10-min day (tunable).
- Night is dim but **safe** (no threats). Campfires and placed light sources glow.
- Bed-skip deferred to Phase 1.

### 8.6 Save
- Serializes: world seed + params, placed build pieces (SocketGraph), inventory, player pose, day time, resource-node depletion/respawn state.
- **localStorage** for Phase 0 (compact slice). Autosave on interval + on quit; manual save at menu.
- Load on boot; round-trip must be exact (testable).

## 9. UI / HUD

React DOM + Tailwind, cozy aesthetic (rounded corners, soft shadows, palette colors, Motion transitions).

- **HUD**: hotbar (1–5), clock/day indicator, reticle. (Health/energy stubs hidden in Phase 0.)
- **Menus**: title, settings (volume, sensitivity, save/load), pause.
- **Inventory screen**: grid + drag-drop + tooltips.
- **Crafting screen**: station-interact opens recipe list with craft buttons.
- **Build HUD**: piece palette, rotation, material counts, demolish toggle, snap-toggle.

## 10. Testing

- **Vitest unit tests** for all engine-core systems (pure TS, no DOM):
  - inventory stacking / slot math
  - recipe resolution (inputs consumed, output produced)
  - SocketGraph add/remove/snap-query correctness
  - save serialize → deserialize round-trip equality
  - day-cycle math (time of day, sun angle)
  - terrain param determinism (same seed → same heights on the CPU path)
- **Browser smoke tests** (puppeteer, matching `pickle-paradise`) for the R3F/Rapier/TypeGPU layers: render a frame, step physics, run a compute pass. Kept minimal.

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| TypeGPU/WebGPU immaturity + browser support | CPU fallback for every compute path; small compute surface (terrain + grass only). |
| Rapier kinematic controller tuning on procedural terrain | Budget time; explicit slope/step thresholds; iterate early. |
| Socket-snap UX feel | Prototype the placement/ghost preview first; concretely define socket points + angle rules per piece. |
| Quaternius asset palette cohesion | Remap materials on import via `Palette`/`Materials`; enforce in the `tools/quaternius` import script. |
| Per-entity React re-render overhead | Core mutates R3F refs in `useFrame`; zustand mirrors UI-facing slices only. |

## 12. Definition of Done (Phase 0)

- [ ] Boot to title → New Game → spawn on the faceted island at golden hour.
- [ ] Walk/sprint/jump with a responsive 3rd-person camera (Rapier controller).
- [ ] Gather wood/stone/food/fiber into inventory.
- [ ] Craft campfire + workbench + axe + planks; place stations in world.
- [ ] Enter build mode (`B`), place foundation/floor/wall/roof/door with socket-snap; demolish for partial refund.
- [ ] Day → night cycle over ~10 min; campfires/buildings glow at night.
- [ ] Save (auto + manual) and reload restores world, builds, inventory, player, time.
- [ ] 60 fps on a midrange desktop in Chrome.
- [ ] Cohesive flat-shaded cozy aesthetic across procedural + Quaternius + `bpy` assets.
- [ ] All engine-core systems have passing Vitest unit tests.

## 13. Roadmap (future phases, separate specs)

- **Phase 1 — Survival & crafting depth**: full survival stats, more resources/recipes/stations, build-system polish (categories, more sockets, demolish UX).
- **Phase 2 — World & life**: more biomes/POIs, creatures (passive + hostile), combat/taming, weather/seasons.
- **Phase 3 — Cozy systems**: NPC villagers/quests, farming, cooking, decorating, progression meta.
- **Phase 4 — Polish & "AAA feel"**: audio, VFX/juice, UI polish, perf, post-processing, PWA/mobile.
- **Phase 5 — Co-op multiplayer**: `peerjs` (reuse `pickle-paradise` / `voxel-warlock` experience).

## 14. Open Questions (to resolve during implementation planning)

- Final project name / repo name.
- Exact Quaternius pack list + which specific models map to which build pieces.
- Pointer-lock vs. drag-look for the camera (decide during input prototyping).
- Hotbar binding semantics for build pieces vs. tools.
- localStorage quota headroom for the Phase 0 save size (validate with a real round-trip early).
