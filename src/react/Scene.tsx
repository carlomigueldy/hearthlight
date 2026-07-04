import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { paletteMaterial } from '@/engine/assets/Materials'

export function Scene() {
  return (
    <Physics>
      {/* Ground */}
      <RigidBody type="fixed">
        <CuboidCollider args={[20, 0.5, 20]} position={[0, -0.5, 0]} />
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[40, 1, 40]} />
          <primitive object={paletteMaterial('sand')} attach="material" />
        </mesh>
      </RigidBody>

      {/* Falling box */}
      <RigidBody position={[0, 6, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <primitive object={paletteMaterial('amber')} attach="material" />
        </mesh>
      </RigidBody>
    </Physics>
  )
}
