import type { InputState } from './InputState'

export interface InputListenerHandle {
  detach(): void
}

/**
 * Attach keyboard + mouse listeners (pointer lock for look) to `target`
 * and feed events into `input`. Returns a handle to detach.
 */
export function attachInputListeners(
  _target: HTMLElement | Window,
  input: InputState,
): InputListenerHandle {
  const onKeyDown = (e: KeyboardEvent) => {
    // don't capture typing in fields
    if (e.target instanceof HTMLElement && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'))
      return
    input.onKeyDown(e.code)
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault()
    }
  }
  const onKeyUp = (e: KeyboardEvent) => input.onKeyUp(e.code)
  const onMouseMove = (e: MouseEvent) => {
    if (document.pointerLockElement) input.addMouseDelta(e.movementX, e.movementY)
  }
  const onBlur = () => {
    // drop all held keys when window loses focus
    input.endFrame()
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('blur', onBlur)

  return {
    detach() {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('blur', onBlur)
    },
  }
}
