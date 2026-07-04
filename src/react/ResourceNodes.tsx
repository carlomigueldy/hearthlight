import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { scatterResourceNodes, type ResourceNode } from '@/engine/gather/ResourceNodes'
import type { Terrain } from '@/engine/world/Terrain'

function nodeGeometry(itemId: string): { geometry: THREE.BufferGeometry; color: string } {
  switch (itemId) {
    case 'wood':
      return { geometry: new THREE.ConeGeometry(0.9, 2.6, 6).translate(0, 1.3, 0), color: '#4f7a3f' }
    case 'stone':
      return { geometry: new THREE.DodecahedronGeometry(0.7, 0), color: '#8a8278' }
    case 'food':
      return { geometry: new THREE.IcosahedronGeometry(0.5, 0), color: '#c0392b' }
    case 'fiber':
      return { geometry: new THREE.ConeGeometry(0.3, 1.2, 4).translate(0, 0.6, 0), color: '#b5a253' }
    default:
      return { geometry: new THREE.BoxGeometry(0.5, 0.5, 0.5), color: '#888' }
  }
}

export function ResourceNodes({
  terrain,
  nodesRef,
}: {
  terrain: Terrain
  nodesRef: React.MutableRefObject<ResourceNode[]>
}) {
  const nodes = useMemo(() => scatterResourceNodes(terrain, terrain.params.seed + 999), [terrain])
  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const grp = groupRef.current
    if (!grp) return
    // toggle visibility per depletion state
    grp.children.forEach((child) => {
      const id = child.userData.nodeId as number | undefined
      if (id === undefined) return
      const n = nodes.find((x) => x.id === id)
      if (n) child.visible = n.amount > 0
    })
  })

  return (
    <group ref={groupRef}>
      {nodes.map((n) => {
        const { geometry, color } = nodeGeometry(n.itemId)
        return (
          <mesh
            key={n.id}
            geometry={geometry}
            position={[n.x, n.y, n.z]}
            scale={n.scale}
            castShadow
            userData={{ nodeId: n.id }}
          >
            <meshStandardMaterial color={color} flatShading roughness={1} />
          </mesh>
        )
      })}
    </group>
  )
}
