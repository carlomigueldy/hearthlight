import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import { EngineDriver } from './EngineDriver'
import { Scene } from './Scene'
import { createBridgeWorld } from '@/engine/worlds/BridgeWorld'
import { useGameStore } from '@/state/useGameStore'

export function SceneHost() {
  const setEngineFrame = useGameStore((s) => s.setEngineFrame)
  const world = useMemo(() => createBridgeWorld(setEngineFrame), [setEngineFrame])

  return (
    <Canvas
      shadows
      camera={{ fov: 55, position: [6, 5, 9], near: 0.1, far: 200 }}
      gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={(state) => {
        state.scene.fog = new THREE.Fog('#bfe3e0', 30, 120)
        state.scene.background = new THREE.Color('#bfe3e0')
      }}
    >
      <hemisphereLight args={['#ffd9a0', '#4f7a3f', 0.6]} />
      <directionalLight
        position={[10, 14, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <ambientLight intensity={0.15} />
      <Sky sunPosition={[10, 14, 6]} turbidity={6} rayleigh={1.5} />
      <EngineDriver world={world} />
      <Scene />
    </Canvas>
  )
}
