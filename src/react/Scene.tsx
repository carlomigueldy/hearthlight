import { useMemo, useRef } from 'react'
import { Physics, RigidBody, HeightfieldCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import {
  generateTerrain,
  terrainGeometry,
  rapierHeightfield,
  DEFAULT_TERRAIN,
  type Terrain,
} from '@/engine/world/Terrain'
import { Player } from './Player'
import { CameraRig } from './CameraRig'
import { Foliage } from './Foliage'
import { ResourceNodes } from './ResourceNodes'
import { Interaction } from './Interaction'
import { Stations } from './Stations'
import { EndFrame } from './EndFrame'
import type { ResourceNode } from '@/engine/gather/ResourceNodes'

export function Scene() {
  const { camera } = useThree()
  const cameraRef = useRef(camera as THREE.PerspectiveCamera)
  const playerTarget = useRef<{ x: number; y: number; z: number } | null>(null)
  const nodesRef = useRef<ResourceNode[]>([])

  const terrain: Terrain = useMemo(() => generateTerrain(DEFAULT_TERRAIN), [])
  const { geometry } = useMemo(() => terrainGeometry(terrain), [terrain])
  const hf = useMemo(() => rapierHeightfield(terrain), [terrain])

  return (
    <Physics>
      {/* Terrain collider + mesh */}
      <RigidBody type="fixed">
        <HeightfieldCollider args={[hf.nrows, hf.ncols, hf.heights, hf.scale]} position={[0, 0, 0]} />
        <mesh geometry={geometry} receiveShadow castShadow>
          <meshStandardMaterial vertexColors flatShading roughness={1} metalness={0} />
        </mesh>
      </RigidBody>

      {/* Water plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, DEFAULT_TERRAIN.waterLevel, 0]}>
        <planeGeometry args={[DEFAULT_TERRAIN.size * 2, DEFAULT_TERRAIN.size * 2, 1, 1]} />
        <meshStandardMaterial color="#2f8f8a" flatShading transparent opacity={0.85} roughness={0.4} />
      </mesh>

      <Foliage terrain={terrain} />
      <ResourceNodes terrain={terrain} nodesRef={nodesRef} />
      <Stations />

      <Player terrain={terrain} cameraRef={cameraRef} playerTarget={playerTarget} spawn={[0, 14, 0]} />
      <CameraRig target={playerTarget} />
      <Interaction nodesRef={nodesRef} />
      <EndFrame />
    </Physics>
  )
}
