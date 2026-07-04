import { useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { EngineDriver } from './EngineDriver'
import { Scene } from './Scene'
import { DayNight } from './DayNight'
import { createWorld } from '@/engine/world/World'
import { attachInputListeners } from '@/engine/input/inputListeners'
import { input } from './inputSingleton'
import { useGameStore } from '@/state/useGameStore'

export function SceneHost() {
  const setEngineFrame = useGameStore((s) => s.setEngineFrame)
  const setDayTime = useGameStore((s) => s.setDayTime)
  const sunRef = useRef<THREE.DirectionalLight | null>(null)

  const world = useMemo(
    () =>
      createWorld({
        onDayTimeChange: (t) => setDayTime(t),
      }),
    [setDayTime],
  )

  useEffect(() => {
    const handle = attachInputListeners(window, input)
    return () => handle.detach()
  }, [])

  useEffect(() => {
    let f = 0
    const id = setInterval(() => {
      f += 10
      setEngineFrame(f)
    }, 1000)
    return () => clearInterval(id)
  }, [setEngineFrame])

  return (
    <Canvas
      shadows
      camera={{ fov: 60, position: [0, 14, 12], near: 0.1, far: 400 }}
      gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={(state) => {
        state.scene.fog = new THREE.Fog('#bfe3e0', 60, 220)
        state.scene.background = new THREE.Color('#bfe3e0')
      }}
    >
      <hemisphereLight args={['#ffd9a0', '#4f7a3f', 0.7]} />
      <directionalLight
        ref={sunRef}
        position={[18, 24, 10]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-far={160}
      />
      <ambientLight intensity={0.18} />
      <DayNight sunRef={sunRef} />
      <EngineDriver world={world} />
      <Scene />
    </Canvas>
  )
}
