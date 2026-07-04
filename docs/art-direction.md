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
