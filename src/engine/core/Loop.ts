import { Clock } from './Clock'

export type FixedUpdateFn = (dt: number) => void
export type RenderFn = (alpha: number) => void
export type ScheduleFrame = (cb: () => void) => number
export type CancelFrame = (id: number) => void

/**
 * Fixed-timestep loop with an accumulator. In the browser, R3F's `useFrame`
 * usually drives the world instead; this class is for headless tests and any
 * non-R3F host. `schedule`/`cancel` are injectable so tests don't need RAF.
 */
export class Loop {
  private acc = 0
  private running = false
  private rafId = 0
  constructor(
    private readonly fixedDt: number,
    private readonly fixedUpdate: FixedUpdateFn,
    private readonly render: RenderFn,
    private readonly schedule: ScheduleFrame = (cb) => requestAnimationFrame(cb),
    private readonly cancel: CancelFrame = (id) => cancelAnimationFrame(id),
    private readonly clock: Clock = new Clock(),
  ) {}

  start() {
    if (this.running) return
    this.running = true
    const tick = () => {
      if (!this.running) return
      const frame = this.clock.tick()
      this.acc += frame
      let steps = 0
      while (this.acc >= this.fixedDt && steps < 5) {
        this.fixedUpdate(this.fixedDt)
        this.acc -= this.fixedDt
        steps++
      }
      this.render(this.acc / this.fixedDt)
      this.rafId = this.schedule(tick)
    }
    this.rafId = this.schedule(tick)
  }

  stop() {
    this.running = false
    this.cancel(this.rafId)
  }
}
