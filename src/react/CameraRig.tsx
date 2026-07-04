import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { input } from './inputSingleton'

const YAW_SPEED = 0.0025
const PITCH_SPEED = 0.0022
const MIN_PITCH = -0.4
const MAX_PITCH = 1.1
const DISTANCE = 7
const HEIGHT = 2.5

/**
 * Third-person follow camera. Owns yaw/pitch driven by mouse delta (pointer
 * lock). Each frame it positions the camera behind/above the player target ref.
 * Click the canvas to lock the pointer; Esc to release.
 */
export function CameraRig({
  target,
}: {
  target: React.MutableRefObject<{ x: number; y: number; z: number } | null>
}) {
  const { camera, gl } = useThree()
  const yaw = useRef(0)
  const pitch = useRef(0.45)
  const current = useRef(new THREE.Vector3(0, 12, 12))

  // request pointer lock on click
  useEffect(() => {
    const dom = gl.domElement
    const onClick = () => {
      if (!document.pointerLockElement) dom.requestPointerLock()
    }
    dom.addEventListener('click', onClick)
    return () => dom.removeEventListener('click', onClick)
  }, [gl])

  useFrame((_, delta) => {
    const d = input.consumeMouseDelta()
    yaw.current -= d.x * YAW_SPEED
    pitch.current = THREE.MathUtils.clamp(
      pitch.current - d.y * PITCH_SPEED,
      MIN_PITCH,
      MAX_PITCH,
    )

    const t = target.current
    if (t) {
      const cx = t.x - Math.sin(yaw.current) * Math.cos(pitch.current) * DISTANCE
      const cz = t.z - Math.cos(yaw.current) * Math.cos(pitch.current) * DISTANCE
      const cy = t.y + Math.sin(pitch.current) * DISTANCE + HEIGHT * 0.4
      current.current.lerp(new THREE.Vector3(cx, cy, cz), 1 - Math.pow(0.001, delta))
      camera.position.copy(current.current)
      camera.lookAt(t.x, t.y + 1.2, t.z)
    }
  })

  return null
}
