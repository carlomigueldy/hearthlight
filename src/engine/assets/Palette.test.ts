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
