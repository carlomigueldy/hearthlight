import { useRef } from 'react'
import { useRapier, RigidBody, CapsuleCollider, type RapierRigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { input } from './inputSingleton'
import type { Terrain } from '@/engine/world/Terrain'

const SPEED = 6
const SPRINT = 10
const JUMP = 7
const GRAVITY_CAP = -30

/**
 * Dynamic RigidBody + capsule player. Movement is camera-relative, computed in
 * useFrame from InputState. Grounded is checked with a short downward ray.
 */
export function Player({
  terrain,
  cameraRef,
  playerTarget,
  spawn = [0, 12, 0],
}: {
  terrain: Terrain
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>
  playerTarget: React.MutableRefObject<{ x: number; y: number; z: number } | null>
  spawn?: [number, number, number]
}) {
  const body = useRef<RapierRigidBody>(null)
  const grounded = useRef(false)
  const { world, rapier } = useRapier()

  useFrame(() => {
    const rb = body.current
    if (!rb) return

    const pos = rb.translation()
    playerTarget.current = { x: pos.x, y: pos.y, z: pos.z }
    // grounded: short ray from slightly above feet downward
    const rayOrigin = { x: pos.x, y: pos.y - 0.6, z: pos.z }
    const ray = new rapier.Ray(rayOrigin, { x: 0, y: -1, z: 0 })
    const hit = world.castRay(ray, 0.25, true, undefined, undefined, undefined, rb)
    grounded.current = hit !== null

    // desired movement from input, camera-relative
    const cam = cameraRef.current
    const forward = new THREE.Vector3()
    const right = new THREE.Vector3()
    if (cam) {
      cam.getWorldDirection(forward)
      forward.y = 0
      forward.normalize()
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
    }
    const move = new THREE.Vector3()
    if (input.isDown('KeyW')) move.add(forward)
    if (input.isDown('KeyS')) move.sub(forward)
    if (input.isDown('KeyD')) move.add(right)
    if (input.isDown('KeyA')) move.sub(right)
    if (move.lengthSq() > 0) move.normalize()
    const sprint = input.isDown('ShiftLeft') || input.isDown('ShiftRight')
    const speed = sprint ? SPRINT : SPEED

    const vel = rb.linvel()
    rb.setLinvel({ x: move.x * speed, y: vel.y, z: move.z * speed }, true)

    // jump
    if (input.isJustPressed('Space') && grounded.current) {
      rb.setLinvel({ x: vel.x, y: JUMP, z: vel.z }, true)
    }

    // safety: never fall forever; respawn if somehow far below
    if (pos.y < GRAVITY_CAP) {
      rb.setTranslation({ x: spawn[0]!, y: spawn[1]!, z: spawn[2]! }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }

    input.endFrame()
    // touch terrain.heightAt so it stays referenced for future grounding tuning
    void terrain
  })

  return (
    <RigidBody
      ref={body}
      position={spawn}
      colliders={false}
      lockRotations
      enabledRotations={[false, false, false]}
      mass={1}
      friction={0.8}
      linearDamping={0.5}
    >
      <CapsuleCollider args={[0.5, 0.4]} position={[0, 0.9, 0]} />
      {/* simple faceted character: a capsule-ish body + head, flat-shaded */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.35, 0.8, 4, 8]} />
        <meshStandardMaterial color="#e6a23c" flatShading roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 1.9, 0]}>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color="#ffd9a0" flatShading roughness={1} />
      </mesh>
    </RigidBody>
  )
}
