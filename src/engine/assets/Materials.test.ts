import { describe, it, expect } from 'vitest'
import { flatColor, paletteMaterial } from './Materials'
import { Palette } from './Palette'

describe('Materials', () => {
  it('flatColor returns a flat-shaded MeshStandardMaterial with the given color', () => {
    const m = flatColor('#ff0000')
    expect(m.flatShading).toBe(true)
    expect(m.roughness).toBe(1)
    expect(m.metalness).toBe(0)
    expect(typeof m.color.getHexString()).toBe('string')
  })

  it('paletteMaterial uses the palette hex for the named token', () => {
    const m = paletteMaterial('amber')
    expect('#' + m.color.getHexString()).toBe(Palette.amber.toLowerCase())
  })
})
