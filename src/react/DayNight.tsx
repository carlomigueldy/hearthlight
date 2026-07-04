import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/state/useGameStore'
import { DAY_LENGTH_SECONDS } from '@/engine/world/World'

const SUN_DIST = 80

/** Moves the sun + tweaks sky/fog color from dayTime. Cozy: warm dawn/dusk, soft blue night. */
export function DayNight({
  sunRef,
}: {
  sunRef: React.MutableRefObject<THREE.DirectionalLight | null>
}) {
  const { scene } = useThree()
  const fogRef = useRef<THREE.Fog | null>(null)

  useFrame(() => {
    const t = useGameStore.getState().dayTime
    const frac = (t % DAY_LENGTH_SECONDS) / DAY_LENGTH_SECONDS // 0..1
    // sun angle: rise in east, set in west; noon at 0.5
    const angle = frac * Math.PI * 2 - Math.PI / 2
    const sunX = Math.cos(angle) * SUN_DIST
    const sunY = Math.sin(angle) * SUN_DIST
    const sunZ = SUN_DIST * 0.3
    const sun = sunRef.current
    if (sun) {
      sun.position.set(sunX, sunY, sunZ)
      // intensity falls off near horizon
      const elev = Math.max(0, Math.sin(angle))
      sun.intensity = 0.3 + elev * 1.2
      // warm at dawn/dusk, neutral at noon
      const warmth = 1 - elev
      sun.color.setHSL(0.08 + warmth * 0.02, 0.6, 0.5 + elev * 0.1)
    }

    // sky/fog color: dawn pink -> day blue -> dusk amber -> night dark blue
    const sky = skyColor(frac)
    if (scene.background instanceof THREE.Color) scene.background.lerp(sky, 0.05)
    if (!fogRef.current && scene.fog instanceof THREE.Fog) fogRef.current = scene.fog
    if (fogRef.current) fogRef.current.color.lerp(sky, 0.05)
  })

  return null
}

function skyColor(frac: number): THREE.Color {
  // key colors
  const night = new THREE.Color('#0d2030')
  const dawn = new THREE.Color('#e58a9a')
  const day = new THREE.Color('#bfe3e0')
  const dusk = new THREE.Color('#e6a23c')
  const c = new THREE.Color()
  if (frac < 0.2) {
    // night -> dawn
    c.copy(night).lerp(dawn, frac / 0.2)
  } else if (frac < 0.35) {
    c.copy(dawn).lerp(day, (frac - 0.2) / 0.15)
  } else if (frac < 0.65) {
    c.copy(day)
  } else if (frac < 0.8) {
    c.copy(day).lerp(dusk, (frac - 0.65) / 0.15)
  } else if (frac < 0.9) {
    c.copy(dusk).lerp(night, (frac - 0.8) / 0.1)
  } else {
    c.copy(night)
  }
  return c
}
