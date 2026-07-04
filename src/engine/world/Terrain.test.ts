import { describe, it, expect } from 'vitest'
import { generateTerrain, DEFAULT_TERRAIN, rapierHeightfield } from './Terrain'

describe('generateTerrain', () => {
  it('is deterministic for the same seed', () => {
    const a = generateTerrain(DEFAULT_TERRAIN)
    const b = generateTerrain(DEFAULT_TERRAIN)
    expect(Array.from(a.heights)).toEqual(Array.from(b.heights))
  })

  it('heights array length is (resolution+1)^2', () => {
    const t = generateTerrain(DEFAULT_TERRAIN)
    expect(t.heights.length).toBe((DEFAULT_TERRAIN.resolution + 1) ** 2)
  })

  it('heightAt matches grid corners exactly', () => {
    const t = generateTerrain({ ...DEFAULT_TERRAIN, resolution: 8, size: 16 })
    const half = 8
    const cell = 16 / 8
    // corner (0,0) -> first height
    expect(t.heightAt(-half, -half)).toBeCloseTo(t.heights[0]!, 5)
    // center corner of cell (1,1)
    const r = 1
    const c = 1
    expect(t.heightAt(-half + c * cell, -half + r * cell)).toBeCloseTo(
      t.heights[r * (8 + 1) + c]!,
      5,
    )
  })

  it('sinks edges below water (island falloff)', () => {
    const t = generateTerrain(DEFAULT_TERRAIN)
    const edge = t.heightAt(0, DEFAULT_TERRAIN.size * 0.48)
    const center = t.heightAt(0, 0)
    expect(edge).toBeLessThan(DEFAULT_TERRAIN.waterLevel)
    expect(center).toBeGreaterThan(DEFAULT_TERRAIN.waterLevel)
  })

  it('heightAt clamps outside the island to below water', () => {
    const t = generateTerrain(DEFAULT_TERRAIN)
    expect(t.heightAt(DEFAULT_TERRAIN.size, 0)).toBeLessThan(DEFAULT_TERRAIN.waterLevel)
  })
})

describe('rapierHeightfield', () => {
  it('exposes nrows/ncols/heights/scale matching the terrain', () => {
    const t = generateTerrain(DEFAULT_TERRAIN)
    const h = rapierHeightfield(t)
    expect(h.nrows).toBe(DEFAULT_TERRAIN.resolution)
    expect(h.ncols).toBe(DEFAULT_TERRAIN.resolution)
    expect(h.heights.length).toBe(t.heights.length)
    const cell = DEFAULT_TERRAIN.size / DEFAULT_TERRAIN.resolution
    expect(h.scale).toEqual({ x: cell, y: 1, z: cell })
  })
})
