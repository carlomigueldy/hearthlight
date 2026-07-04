import { useMemo } from 'react'
import * as THREE from 'three'
import { mulberry32 } from '@/engine/math/rng'
import type { Terrain } from '@/engine/world/Terrain'

interface ScatterInstance {
  position: [number, number, number]
  scale: number
  rotation: number
}

/** Poisson-disk-ish scatter: random rejection by min distance. Good enough for Phase 0. */
function scatter(
  terrain: Terrain,
  count: number,
  minDist: number,
  seed: number,
  yMin: number,
): ScatterInstance[] {
  const rng = mulberry32(seed)
  const out: ScatterInstance[] = []
  const half = terrain.params.size * 0.5
  let tries = 0
  while (out.length < count && tries < count * 20) {
    tries++
    const x = (rng() * 2 - 1) * half * 0.92
    const z = (rng() * 2 - 1) * half * 0.92
    const y = terrain.heightAt(x, z)
    if (y < yMin) continue
    if (y - terrain.params.waterLevel < 0.6) continue // keep off the beach
    let ok = true
    for (const o of out) {
      const dx = o.position[0]! - x
      const dz = o.position[2]! - z
      if (dx * dx + dz * dz < minDist * minDist) {
        ok = false
        break
      }
    }
    if (!ok) continue
    out.push({ position: [x, y, z], scale: 0.8 + rng() * 0.6, rotation: rng() * Math.PI * 2 })
  }
  return out
}

function InstancedFoliage({
  instances,
  geometry,
  color,
}: {
  instances: ScatterInstance[]
  geometry: THREE.BufferGeometry
  color: string
}) {
  const ref = useMemo(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const p = new THREE.Vector3()
    const s = new THREE.Vector3(1, 1, 1)
    return { m, q, p, s }
  }, [])

  return (
    <instancedMesh
      args={[geometry, undefined, instances.length]}
      castShadow
      receiveShadow
      ref={(mesh) => {
        if (!mesh) return
        for (let i = 0; i < instances.length; i++) {
          const inst = instances[i]!
          ref.p.set(inst.position[0]!, inst.position[1]!, inst.position[2]!)
          ref.q.setFromEuler(new THREE.Euler(0, inst.rotation, 0))
          ref.s.set(inst.scale, inst.scale, inst.scale)
          ref.m.compose(ref.p, ref.q, ref.s)
          mesh.setMatrixAt(i, ref.m)
        }
        mesh.instanceMatrix.needsUpdate = true
      }}
    >
      <meshStandardMaterial color={color} flatShading roughness={1} />
    </instancedMesh>
  )
}

export function Foliage({ terrain }: { terrain: Terrain }) {
  const trees = useMemo(() => scatter(terrain, 140, 6, terrain.params.seed + 100, 1.5), [terrain])
  const rocks = useMemo(() => scatter(terrain, 60, 4, terrain.params.seed + 200, 0.5), [terrain])

  const treeGeo = useMemo(
    () => new THREE.ConeGeometry(1.1, 3.2, 6).translate(0, 1.6, 0),
    [],
  )
  const trunkGeo = useMemo(
    () => new THREE.CylinderGeometry(0.18, 0.22, 1.2, 5).translate(0, 0.6, 0),
    [],
  )
  const rockGeo = useMemo(() => new THREE.DodecahedronGeometry(0.7, 0), [])

  return (
    <group>
      <InstancedFoliage instances={trees} geometry={trunkGeo} color="#6b4f2a" />
      <InstancedFoliage
        instances={trees.map((t) => ({
          ...t,
          position: [t.position[0]!, t.position[1]! + 1.2, t.position[2]!],
          scale: t.scale,
          rotation: t.rotation,
        }))}
        geometry={treeGeo}
        color="#4f7a3f"
      />
      <InstancedFoliage instances={rocks} geometry={rockGeo} color="#8a8278" />
    </group>
  )
}
