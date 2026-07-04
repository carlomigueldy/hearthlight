import type { ComponentMap, Entity } from '../types'

let nextId = 1

/** Minimal ECS-style store. Framework-free. */
export class EntityStore {
  private readonly entities = new Map<number, Entity>()

  create(components: ComponentMap = {}): Entity {
    const e: Entity = { id: nextId++, components }
    this.entities.set(e.id, e)
    return e
  }

  get(id: number): Entity | undefined {
    return this.entities.get(id)
  }

  remove(id: number): void {
    this.entities.delete(id)
  }

  /** All entities that possess the named component. */
  query(componentName: string): Entity[] {
    const out: Entity[] = []
    for (const e of this.entities.values()) {
      if (componentName in e.components) out.push(e)
    }
    return out
  }

  clear(): void {
    this.entities.clear()
  }

  size(): number {
    return this.entities.size
  }
}
