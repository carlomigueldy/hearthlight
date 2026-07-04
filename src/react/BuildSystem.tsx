import { useEffect, useMemo, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { input } from './inputSingleton'
import { game } from './gameState'
import { useGameStore } from '@/state/useGameStore'
import { getPieceDef, type PieceDef } from '@/engine/build/PieceDefs'
import { findSnap, type PlacedPiece } from '@/engine/build/SocketGraph'

function pieceGeometry(def: PieceDef): THREE.BufferGeometry {
  const { hx, hy, hz } = def.shape
  return new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2)
}

function PlacedMesh({ piece }: { piece: PlacedPiece }) {
  const def = getPieceDef(piece.itemId)
  const geo = useMemo(
    () => (def ? pieceGeometry(def) : new THREE.BufferGeometry()),
    [def],
  )
  if (!def) return null
  return (
    <mesh
      geometry={geo}
      position={[piece.x, piece.y, piece.z]}
      rotation={[0, piece.yaw, 0]}
      castShadow
      receiveShadow
      userData={{ pieceId: piece.id }}
    >
      <meshStandardMaterial color={def.color} flatShading roughness={1} />
    </mesh>
  )
}

/** Build system: ghost preview, placement on click, demolish. */
export function BuildSystem() {
  const { camera, scene, gl } = useThree()
  const ghostRef = useRef<THREE.Mesh>(null)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const [, force] = useState(0)
  const buildPieceStore = useGameStore((s) => s.buildPiece)

  useEffect(() => {
    const dom = gl.domElement
    const onDown = (e: MouseEvent) => {
      if (e.button === 0) input.onKeyDown('Mouse0')
    }
    const onUp = () => input.onKeyUp('Mouse0')
    dom.addEventListener('mousedown', onDown)
    dom.addEventListener('mouseup', onUp)
    return () => {
      dom.removeEventListener('mousedown', onDown)
      dom.removeEventListener('mouseup', onUp)
    }
  }, [gl])

  useFrame(() => {
    const { buildMode, buildPiece, buildRotation, buildDemolish, panel } = useGameStore.getState()
    const ghost = ghostRef.current
    if (!ghost) return
    if (!buildMode || panel !== 'none') {
      ghost.visible = false
      return
    }

    if (buildDemolish) {
      ghost.visible = false
      if (input.isJustPressed('Mouse0')) {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)
        raycaster.far = 10
        const hits = raycaster.intersectObjects(scene.children, true)
        for (const h of hits) {
          let o: THREE.Object3D | null = h.object
          while (o && o.userData.pieceId === undefined) o = o.parent
          if (o && o.userData.pieceId !== undefined) {
            const id = o.userData.pieceId as number
            const piece = game.build.pieces.get(id)
            if (piece) {
              game.inventory.add(piece.itemId, 1)
              game.build.remove(id)
              game.syncToStore()
              force((n) => n + 1)
            }
            break
          }
        }
      }
      return
    }

    const def = buildPiece ? getPieceDef(buildPiece) : null
    if (!def) {
      ghost.visible = false
      return
    }
    const afford = game.inventory.countOf(buildPiece!) >= 1
    ghost.visible = true

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)
    raycaster.far = 12
    const hits = raycaster.intersectObjects(scene.children, true)
    let point = new THREE.Vector3(
      game.playerPos.x + game.playerForward.x * 4,
      game.playerPos.y,
      game.playerPos.z + game.playerForward.z * 4,
    )
    for (const h of hits) {
      if (h.object === ghost) continue
      point = h.point.clone()
      break
    }

    const yaw = (buildRotation * Math.PI) / 2
    const nearby = game.build.nearby(point.x, point.y, point.z, 2.5)
    const snap = findSnap({ x: point.x, y: point.y, z: point.z, yaw }, nearby, 0.7)
    ghost.position.set(snap.x, snap.y, snap.z)
    ghost.rotation.set(0, yaw, 0)
    const mat = ghost.material as THREE.MeshStandardMaterial
    mat.color.set(afford ? '#7aa05a' : '#c0392b')

    if (afford && input.isJustPressed('Mouse0')) {
      game.inventory.remove(buildPiece!, 1)
      game.build.add({ itemId: buildPiece!, x: snap.x, y: snap.y, z: snap.z, yaw })
      game.syncToStore()
      force((n) => n + 1)
    }
  })

  const ghostDef = buildPieceStore ? getPieceDef(buildPieceStore) : null

  return (
    <>
      {ghostDef && (
        <mesh ref={ghostRef} visible={false}>
          <boxGeometry
            args={[ghostDef.shape.hx * 2, ghostDef.shape.hy * 2, ghostDef.shape.hz * 2]}
          />
          <meshStandardMaterial color="#7aa05a" transparent opacity={0.5} flatShading />
        </mesh>
      )}
      {Array.from(game.build.pieces.values()).map((p) => (
        <PlacedMesh key={p.id} piece={p} />
      ))}
    </>
  )
}
