import * as THREE from 'three'
import { createSeededNoise2D, type Noise2D } from '../math/noise'

export interface TerrainParams {
  seed: number
  size: number // world units across (square)
  resolution: number // grid cells per side
  amplitude: number // max height
  waterLevel: number // y of sea; heights below become underwater
}

export const DEFAULT_TERRAIN: TerrainParams = {
  seed: 1337,
  size: 256,
  resolution: 96,
  amplitude: 18,
  waterLevel: -1.5,
}

export interface Terrain {
  params: TerrainParams
  /** heights[row * resolution + col], row/col in [0..resolution]. length = (resolution+1)^2 */
  heights: Float32Array
  /** Sample interpolated terrain height at world (x, z). Returns waterLevel-ish outside. */
  heightAt(x: number, z: number): number
}

function islandFalloff(x: number, z: number, size: number): number {
  // normalized distance from center, 0 at center -> 1 at edge
  const nx = x / (size * 0.5)
  const nz = z / (size * 0.5)
  const d = Math.min(1, Math.sqrt(nx * nx + nz * nz))
  // smooth radial falloff: keep center near 1, drop to -0.35 past edge so shores sink
  return Math.cos(Math.min(d, 1) * Math.PI * 0.5) * 1.1 - 0.35 * d * d
}

/** Build a faceted island heightfield from `params`. Deterministic for a given seed. */
export function generateTerrain(params: TerrainParams = DEFAULT_TERRAIN): Terrain {
  const { seed, size, resolution, amplitude, waterLevel } = params
  const noise2: Noise2D = createSeededNoise2D(seed)
  const noiseDetail: Noise2D = createSeededNoise2D(seed + 1)
  const cell = size / resolution
  const half = size * 0.5
  const n = resolution + 1
  const heights = new Float32Array(n * n)

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = c * cell - half
      const z = r * cell - half
      // large rolling hills + finer detail
      const big = noise2(x * 0.012, z * 0.012)
      const med = noise2(x * 0.03, z * 0.03) * 0.4
      const fine = noiseDetail(x * 0.09, z * 0.09) * 0.12
      const h = (big + med + fine) * amplitude * islandFalloff(x, z, size)
      // floor anything just below water so beaches are clean
      heights[r * n + c] = h
    }
  }

  const heightAt = (x: number, z: number): number => {
    // map to grid coords
    const gx = x / cell + resolution * 0.5
    const gz = z / cell + resolution * 0.5
    if (gx < 0 || gx > resolution || gz < 0 || gz > resolution) return waterLevel - 2
    const c0 = Math.floor(gx)
    const r0 = Math.floor(gz)
    const c1 = Math.min(c0 + 1, resolution)
    const r1 = Math.min(r0 + 1, resolution)
    const tx = gx - c0
    const tz = gz - r0
    const h00 = heights[r0 * n + c0]!
    const h10 = heights[r0 * n + c1]!
    const h01 = heights[r1 * n + c0]!
    const h11 = heights[r1 * n + c1]!
    const ha = h00 * (1 - tx) + h10 * tx
    const hb = h01 * (1 - tx) + h11 * tx
    return ha * (1 - tz) + hb * tz
  }

  return { params, heights, heightAt }
}

/**
 * Build a flat-shaded BufferGeometry from a Terrain. Vertex colors are assigned
 * by elevation band (sand / grass / forest / rock) for the cozy painted look.
 */
export function terrainGeometry(terrain: Terrain): {
  geometry: THREE.BufferGeometry
} & Pick<Terrain, 'heightAt'> {
  const { params, heights } = terrain
  const { resolution, size, waterLevel } = params
  const cell = size / resolution
  const half = size * 0.5
  const n = resolution + 1

  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []

  const sand = new THREE.Color('#e8d6a0')
  const grass = new THREE.Color('#7aa05a')
  const forest = new THREE.Color('#4f7a3f')
  const rock = new THREE.Color('#8a8278')
  const underwater = new THREE.Color('#2f8f8a')

  const colorFor = (h: number): THREE.Color => {
    if (h < waterLevel) return underwater
    const above = h - waterLevel
    if (above < 0.8) return sand
    if (above < 5) return grass
    if (above < 9) return forest
    return rock
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = c * cell - half
      const z = r * cell - half
      const h = heights[r * n + c]!
      positions.push(x, h, z)
      const col = colorFor(h)
      colors.push(col.r, col.g, col.b)
    }
  }

  for (let r = 0; r < resolution; r++) {
    for (let c = 0; c < resolution; c++) {
      const a = r * n + c
      const b = r * n + c + 1
      const cc = (r + 1) * n + c
      const d = (r + 1) * n + c + 1
      // two triangles per cell
      indices.push(a, cc, b)
      indices.push(b, cc, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return { geometry, heightAt: terrain.heightAt }
}

/** Rapier heightfield heights are row-major of (nrows+1)*(ncols+1). */
export function rapierHeightfield(terrain: Terrain): {
  nrows: number
  ncols: number
  heights: number[]
  scale: { x: number; y: number; z: number }
} {
  const { resolution, size } = terrain.params
  const cell = size / resolution
  return {
    nrows: resolution,
    ncols: resolution,
    heights: Array.from(terrain.heights),
    scale: { x: cell, y: 1, z: cell },
  }
}
