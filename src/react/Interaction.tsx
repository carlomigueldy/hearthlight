import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { input } from './inputSingleton'
import { game } from './gameState'
import { useGameStore } from '@/state/useGameStore'
import type { ResourceNode } from '@/engine/gather/ResourceNodes'
import { ResourceKinds } from '@/engine/gather/ResourceNodes'
import { getItem } from '@/engine/items/Items'

const REACH = 6

/** Raycasts from screen center; sets HUD prompt; gathers on E / opens crafting on E near a station. */
export function Interaction({
  nodesRef,
}: {
  nodesRef: React.MutableRefObject<ResourceNode[]>
}) {
  const { camera, scene } = useThree()
  const raycaster = new THREE.Raycaster()

  useFrame(() => {
    const { panel, dayTime, setPrompt, setPanel, nearbyStation, setNearbyStation } =
      useGameStore.getState()
    if (panel !== 'none') {
      if (nearbyStation !== null) setNearbyStation(null)
      if (useGameStore.getState().prompt !== '') setPrompt('')
      input.endFrame()
      return
    }

    // respawn depleted nodes whose timer elapsed
    for (const n of nodesRef.current) {
      if (n.amount === 0 && n.respawnAt > 0 && dayTime >= n.respawnAt) {
        n.amount = n.max
        n.respawnAt = 0
      }
    }

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)
    raycaster.far = REACH
    const hits = raycaster.intersectObjects(scene.children, true)

    let nodeHit: ResourceNode | null = null
    let stationHit: string | null = null
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object
      while (o) {
        if (o.userData.nodeId !== undefined) {
          const n = nodesRef.current.find((x) => x.id === o!.userData.nodeId)
          if (n && n.amount > 0) nodeHit = n
          break
        }
        if (o.userData.stationId !== undefined) {
          stationHit = o.userData.stationId as string
          break
        }
        o = o.parent
      }
      if (nodeHit || stationHit) break
    }

    // station proximity (within 4m) even without looking directly at it
    if (!stationHit) {
      const p = camera.position
      for (const s of game.stations) {
        const dx = s.x - p.x
        const dy = s.y - p.y
        const dz = s.z - p.z
        if (dx * dx + dy * dy + dz * dz <= 16) {
          stationHit = s.itemId
          break
        }
      }
    }
    if (stationHit !== nearbyStation) setNearbyStation(stationHit)

    if (nodeHit) {
      const def = getItem(nodeHit.itemId)
      setPrompt(`E: Gather ${def?.name ?? nodeHit.itemId}`)
      if (input.isJustPressed('KeyE')) gather(nodeHit)
    } else if (stationHit) {
      setPrompt('E: Open Crafting')
      if (input.isJustPressed('KeyE')) setPanel('crafting')
    } else {
      setPrompt('')
    }
  })

  function gather(node: ResourceNode) {
    const kind = (Object.keys(ResourceKinds) as (keyof typeof ResourceKinds)[]).find(
      (k) => ResourceKinds[k].itemId === node.itemId,
    )
    const def = kind ? ResourceKinds[kind] : null
    if (!def) return
    const yieldCount = node.itemId === 'food' || node.itemId === 'fiber' ? 2 : 1
    node.amount = Math.max(0, node.amount - 1)
    game.inventory.add(node.itemId, yieldCount)
    game.syncToStore()
    if (node.amount === 0) {
      node.respawnAt = useGameStore.getState().dayTime + def.respawnSeconds
    }
  }

  return null
}
