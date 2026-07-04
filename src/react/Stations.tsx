import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { game } from './gameState'
import { useGameStore } from '@/state/useGameStore'
import { getItem } from '@/engine/items/Items'

interface PlacedStation {
  itemId: string
  mesh: THREE.Group
}

/** Renders placed stations (campfire / workbench). Stations register with `game.stations` for proximity checks. */
export function Stations() {
  const placedRef = useRef<PlacedStation[]>([])
  const rootRef = useRef<THREE.Group>(null)
  const version = useGameStore((s) => s.inventory)

  // re-render trigger when inventory changes (stations get placed on craft)
  useFrame(() => {
    void version
    const root = rootRef.current
    if (!root) return
    // reconcile: ensure every game.stations entry has a mesh
    for (const s of game.stations) {
      const exists = placedRef.current.some((p) => p.mesh.userData.stationKey === `${s.itemId}:${s.x}:${s.y}:${s.z}`)
      if (!exists) {
        const g = buildStationMesh(s.itemId)
        g.position.set(s.x, s.y, s.z)
        g.userData.stationId = s.itemId
        g.userData.stationKey = `${s.itemId}:${s.x}:${s.y}:${s.z}`
        root.add(g)
        placedRef.current.push({ itemId: s.itemId, mesh: g })
      }
    }
  })

  return <group ref={rootRef} />
}

function buildStationMesh(itemId: string): THREE.Group {
  const g = new THREE.Group()
  const def = getItem(itemId)
  const color = def?.color ?? '#888'
  if (itemId === 'campfire') {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.12, 6, 12),
      new THREE.MeshStandardMaterial({ color: '#6b4f2a', flatShading: true, roughness: 1 }),
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.1
    ring.castShadow = true
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.8, 5),
      new THREE.MeshStandardMaterial({
        color: '#e6a23c',
        flatShading: true,
        emissive: new THREE.Color('#e6a23c'),
        emissiveIntensity: 0.8,
        roughness: 1,
      }),
    )
    flame.position.y = 0.5
    g.add(ring, flame)
  } else if (itemId === 'workbench') {
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.2, 0.9),
      new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 1 }),
    )
    top.position.y = 0.9
    top.castShadow = true
    const legPositions: [number, number][] = [
      [-0.7, -0.35],
      [0.7, -0.35],
      [-0.7, 0.35],
      [0.7, 0.35],
    ]
    for (const [sx, sz] of legPositions) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.9, 0.15),
        new THREE.MeshStandardMaterial({ color: '#6b4f2a', flatShading: true, roughness: 1 }),
      )
      leg.position.set(sx, 0.45, sz)
      leg.castShadow = true
      g.add(leg)
    }
    g.add(top)
  } else {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 1 }),
    )
    m.position.y = 0.5
    m.castShadow = true
    g.add(m)
  }
  return g
}
