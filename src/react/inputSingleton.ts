import { InputState } from '@/engine/input/InputState'

/** Single shared InputState for the app. Listeners are attached in SceneHost. */
export const input = new InputState()
