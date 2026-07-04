import { getItem } from '../items/Items'

export interface ItemStack {
  itemId: string
  count: number
}

export interface AddResult {
  /** how many were added */
  added: number
  /** how many could not fit (overflow) */
  leftover: number
}

/**
 * A fixed-size inventory grid. Framework-free, testable. The source of truth
 * for player carry state; React mirrors it via a bridge.
 */
export class Inventory {
  readonly slots: (ItemStack | null)[]

  constructor(readonly size = 20) {
    this.slots = new Array(size).fill(null)
  }

  /** Add `count` of `itemId`, stacking onto existing slots first. */
  add(itemId: string, count: number): AddResult {
    const def = getItem(itemId)
    if (!def) return { added: 0, leftover: count }
    let remaining = count
    // first, top up existing stacks
    for (let i = 0; i < this.slots.length && remaining > 0; i++) {
      const s = this.slots[i]
      if (s && s.itemId === itemId && s.count < def.maxStack) {
        const room = def.maxStack - s.count
        const add = Math.min(room, remaining)
        s.count += add
        remaining -= add
      }
    }
    // then, fill empty slots
    for (let i = 0; i < this.slots.length && remaining > 0; i++) {
      if (!this.slots[i]) {
        const add = Math.min(def.maxStack, remaining)
        this.slots[i] = { itemId, count: add }
        remaining -= add
      }
    }
    return { added: count - remaining, leftover: remaining }
  }

  /** Total count of `itemId` across all slots. */
  countOf(itemId: string): number {
    let n = 0
    for (const s of this.slots) if (s && s.itemId === itemId) n += s.count
    return n
  }

  /** Remove up to `count` of `itemId`. Returns the number actually removed. */
  remove(itemId: string, count: number): number {
    let remaining = count
    for (let i = 0; i < this.slots.length && remaining > 0; i++) {
      const s = this.slots[i]
      if (s && s.itemId === itemId) {
        const take = Math.min(s.count, remaining)
        s.count -= take
        remaining -= take
        if (s.count === 0) this.slots[i] = null
      }
    }
    return count - remaining
  }

  /** True if the inventory holds at least the given amounts. */
  has(inputs: Record<string, number>): boolean {
    for (const [id, n] of Object.entries(inputs)) {
      if (this.countOf(id) < n) return false
    }
    return true
  }

  /** Snapshot to a plain array (for save + UI mirror). */
  snapshot(): (ItemStack | null)[] {
    return this.slots.map((s) => (s ? { ...s } : null))
  }

  /** Restore from a snapshot (length must match size). */
  restore(snap: (ItemStack | null)[]): void {
    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i] = snap[i] ? { ...(snap[i] as ItemStack) } : null
    }
  }

  clear(): void {
    for (let i = 0; i < this.slots.length; i++) this.slots[i] = null
  }
}
