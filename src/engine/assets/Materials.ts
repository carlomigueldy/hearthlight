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
