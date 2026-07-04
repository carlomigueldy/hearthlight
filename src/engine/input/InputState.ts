export interface Vec2 {
  x: number
  y: number
}

/** Per-frame keyboard/mouse state. `endFrame()` clears per-frame flags. */
export class InputState {
  private readonly keys = new Set<string>()
  private readonly justPressed = new Set<string>()
  private mouseDelta: Vec2 = { x: 0, y: 0 }

  onKeyDown(code: string): void {
    this.keys.add(code)
    this.justPressed.add(code)
  }

  onKeyUp(code: string): void {
    this.keys.delete(code)
  }

  isDown(code: string): boolean {
    return this.keys.has(code)
  }

  isJustPressed(code: string): boolean {
    return this.justPressed.has(code)
  }

  addMouseDelta(x: number, y: number): void {
    this.mouseDelta.x += x
    this.mouseDelta.y += y
  }

  consumeMouseDelta(): Vec2 {
    const d = { ...this.mouseDelta }
    this.mouseDelta = { x: 0, y: 0 }
    return d
  }

  /** Call at the end of each frame. */
  endFrame(): void {
    this.justPressed.clear()
  }
}
