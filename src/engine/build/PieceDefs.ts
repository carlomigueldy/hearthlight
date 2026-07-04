import type { ItemId } from '../items/Items'

/** A socket point on a piece, in local coordinates relative to the piece origin. */
export interface SocketPoint {
  /** local position on the piece */
  x: number
  y: number
  z: number
  /** which faces/axes this socket can connect on */
  dir: 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right'
}

export interface PieceShape {
  /** half-extents for the placement collider (cuboid) */
  hx: number
  hy: number
  hz: number
  /** procedural geometry builder args; simple box for Phase 0 */
  kind: 'box' | 'wedge'
}

export interface PieceDef {
  itemId: ItemId
  name: string
  color: string
  shape: PieceShape
  sockets: SocketPoint[]
}

const S = 1.5 // build grid unit (meters)

/** The Phase 0 piece set: foundation, floor, wall, roof, door. */
export const PieceDefs: Record<string, PieceDef> = {
  foundation: {
    itemId: 'foundation',
    name: 'Foundation',
    color: '#8a8278',
    shape: { hx: S, hy: 0.25, hz: S, kind: 'box' },
    sockets: [
      { x: 0, y: 0.25, z: 0, dir: 'top' },
      { x: 0, y: -0.25, z: 0, dir: 'bottom' },
    ],
  },
  floor: {
    itemId: 'floor',
    name: 'Floor',
    color: '#c9a86a',
    shape: { hx: S, hy: 0.15, hz: S, kind: 'box' },
    sockets: [
      { x: 0, y: 0.15, z: 0, dir: 'top' },
      { x: 0, y: -0.15, z: 0, dir: 'bottom' },
      { x: S, y: 0, z: 0, dir: 'right' },
      { x: -S, y: 0, z: 0, dir: 'left' },
      { x: 0, y: 0, z: S, dir: 'back' },
      { x: 0, y: 0, z: -S, dir: 'front' },
    ],
  },
  wall: {
    itemId: 'wall',
    name: 'Wall',
    color: '#c9a86a',
    shape: { hx: S, hy: S, hz: 0.15, kind: 'box' },
    sockets: [
      { x: 0, y: S, z: 0, dir: 'top' },
      { x: 0, y: -S, z: 0, dir: 'bottom' },
      { x: S, y: 0, z: 0, dir: 'right' },
      { x: -S, y: 0, z: 0, dir: 'left' },
      { x: 0, y: 0, z: 0.15, dir: 'back' },
      { x: 0, y: 0, z: -0.15, dir: 'front' },
    ],
  },
  roof: {
    itemId: 'roof',
    name: 'Roof',
    color: '#6b4f2a',
    shape: { hx: S, hy: 0.4, hz: S, kind: 'wedge' },
    sockets: [
      { x: 0, y: -0.4, z: 0, dir: 'bottom' },
      { x: S, y: 0, z: 0, dir: 'right' },
      { x: -S, y: 0, z: 0, dir: 'left' },
    ],
  },
  door: {
    itemId: 'door',
    name: 'Door',
    color: '#6b4f2a',
    shape: { hx: S * 0.5, hy: S, hz: 0.15, kind: 'box' },
    sockets: [
      { x: 0, y: S, z: 0, dir: 'top' },
      { x: 0, y: -S, z: 0, dir: 'bottom' },
    ],
  },
}

export const BUILDABLE_PIECES: ItemId[] = ['foundation', 'floor', 'wall', 'roof', 'door']

export function getPieceDef(itemId: string): PieceDef | undefined {
  return PieceDefs[itemId]
}

/** Opposite of a socket direction (top<->bottom, front<->back, left<->right). */
export function oppositeDir(dir: SocketPoint['dir']): SocketPoint['dir'] {
  switch (dir) {
    case 'top':
      return 'bottom'
    case 'bottom':
      return 'top'
    case 'front':
      return 'back'
    case 'back':
      return 'front'
    case 'left':
      return 'right'
    case 'right':
      return 'left'
  }
}
