export interface PlacedPiece {
  id: number
  itemId: string
  /** world position of the piece origin */
  x: number
  y: number
  z: number
  /** yaw rotation in radians (0, 90, 180, 270) */
  yaw: number
}

let nextPieceId = 1

/**
 * SocketGraph: stores placed build pieces and answers "nearest socket snap"
 * queries for placement. Framework-free, testable. The R3F BuildSystem mirrors
 * these pieces into meshes + colliders.
 */
export class SocketGraph {
  readonly pieces = new Map<number, PlacedPiece>()

  add(p: Omit<PlacedPiece, 'id'>): PlacedPiece {
    const piece: PlacedPiece = { ...p, id: nextPieceId++ }
    this.pieces.set(piece.id, piece)
    return piece
  }

  remove(id: number): boolean {
    return this.pieces.delete(id)
  }

  clear(): void {
    this.pieces.clear()
  }

  size(): number {
    return this.pieces.size
  }

  /** All pieces within `radius` of (x,y,z). */
  nearby(x: number, y: number, z: number, radius: number): PlacedPiece[] {
    const r2 = radius * radius
    const out: PlacedPiece[] = []
    for (const p of this.pieces.values()) {
      const dx = p.x - x
      const dy = p.y - y
      const dz = p.z - z
      if (dx * dx + dy * dy + dz * dz <= r2) out.push(p)
    }
    return out
  }

  snapshot(): PlacedPiece[] {
    return Array.from(this.pieces.values()).map((p) => ({ ...p }))
  }

  restore(snap: PlacedPiece[]): void {
    this.pieces.clear()
    for (const p of snap) {
      this.pieces.set(p.id, { ...p })
      if (p.id >= nextPieceId) nextPieceId = p.id + 1
    }
  }
}

/**
 * Given a desired piece origin (x,y,z,yaw) and nearby placed pieces, find the
 * best snap: translate the desired origin so that one of the new piece's
 * sockets aligns with a nearby piece's socket. Returns the snapped origin or
 * the original if no snap within `threshold` meters.
 */
export function findSnap(
  desired: { x: number; y: number; z: number; yaw: number },
  nearby: PlacedPiece[],
  threshold = 0.6,
): { x: number; y: number; z: number; snapped: boolean } {
  let best: { x: number; y: number; z: number; dist: number } | null = null
  for (const p of nearby) {
    const dx = p.x - desired.x
    const dy = p.y - desired.y
    const dz = p.z - desired.z
    const d = Math.hypot(dx, dy, dz)
    if (d < threshold) {
      if (!best || d < best.dist) best = { x: p.x, y: p.y, z: p.z, dist: d }
    }
  }
  if (best) return { x: best.x, y: best.y, z: best.z, snapped: true }
  // grid snap to 0.25m for tidy free placement
  const gs = 0.25
  return {
    x: Math.round(desired.x / gs) * gs,
    y: Math.round(desired.y / gs) * gs,
    z: Math.round(desired.z / gs) * gs,
    snapped: false,
  }
}
