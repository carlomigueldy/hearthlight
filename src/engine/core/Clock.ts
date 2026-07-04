export class Clock {
  private last: number
  constructor(private readonly now: () => number = () => performance.now()) {
    this.last = now()
  }

  /** Seconds since the last tick, capped to `maxDelta` and floored at 0. */
  tick(maxDelta = 0.1): number {
    const t = this.now()
    let dt = (t - this.last) / 1000
    this.last = t
    if (dt > maxDelta) dt = maxDelta
    if (dt < 0) dt = 0
    return dt
  }
}
