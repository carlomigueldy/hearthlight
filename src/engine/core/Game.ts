import { Loop } from './Loop'
import type { EntityStore } from './EntityStore'

export interface GameWorld {
  entities: EntityStore
  fixedUpdate(dt: number): void
  render(alpha: number): void
}

/** Owns the fixed-timestep loop driving a `GameWorld`. */
export class Game {
  private readonly loop: Loop
  constructor(
    private readonly world: GameWorld,
    fixedDt = 1 / 60,
  ) {
    this.loop = new Loop(fixedDt, (dt) => world.fixedUpdate(dt), (alpha) => world.render(alpha))
  }

  start(): void {
    this.loop.start()
  }

  stop(): void {
    this.loop.stop()
  }
}
