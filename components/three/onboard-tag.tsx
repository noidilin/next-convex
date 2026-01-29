'use client'

import {
  Center,
  Environment,
  Lightformer,
  RenderTexture,
  Resize,
  Text3D,
  useGLTF,
  useTexture,
} from '@react-three/drei'
import {
  Canvas,
  extend,
  type ThreeEvent,
  useFrame,
  useThree,
} from '@react-three/fiber'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  type RapierRigidBody,
  RigidBody,
  type RigidBodyProps,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier'
import { useControls } from 'leva'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { type RefObject, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    card: THREE.Mesh
    clip: THREE.Mesh
    clamp: THREE.Mesh
  }
  materials: {
    base: THREE.MeshPhysicalMaterial
    metal: THREE.MeshStandardMaterial
  }
}

// NOTE: in order to use MeshLine library, which is vanilla Three.js in React, we need to extend it.
// components added this way can then be referenced in the scene graph
extend({ MeshLineGeometry, MeshLineMaterial })

useGLTF.preload(
  'https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb',
)
useTexture.preload(
  'https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg',
)

// NOTE: structure of OnboardTag
// - <Canvas>: entry point into declarative Three.js
// - <Physics>: tie <Band/> to physics in Rapier
type OnboardTagUser = { name?: string | null; email?: string | null } | null

export default function OnboardTag({ user }: { user?: OnboardTagUser }) {
  const { debug } = useControls({ debug: false })
  return (
    <Canvas camera={{ position: [0, 0, 13], fov: 25 }}>
      <ambientLight intensity={Math.PI} />
      <Physics
        debug={debug}
        interpolate
        gravity={[0, -40, 0]}
        timeStep={1 / 60}
      >
        <Band user={user ?? null} />
      </Physics>
      <Environment background blur={0.75}>
        <color attach="background" args={['black']} />
        <Lightformer
          intensity={2}
          color="white"
          position={[0, -1, 5]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[-1, -1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={3}
          color="white"
          position={[1, 1, 1]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[100, 0.1, 1]}
        />
        <Lightformer
          intensity={10}
          color="white"
          position={[-10, 0, 14]}
          rotation={[0, Math.PI / 2, Math.PI / 3]}
          scale={[100, 10, 1]}
        />
      </Environment>
    </Canvas>
  )
}

function Band({
  maxSpeed = 50,
  minSpeed = 10,
  user,
}: {
  maxSpeed?: number
  minSpeed?: number
  user: OnboardTagUser
}) {
  const { nodes, materials } = useGLTF(
    'https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb',
  ) as unknown as GLTFResult

  const texture = useTexture(
    'https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg',
  )

  // NOTE: reference for band and the joints
  const band = useRef<THREE.Mesh<MeshLineGeometry, MeshLineMaterial> | null>(
    null,
  )
  const fixed = useRef<RapierRigidBody | null>(null)
  const j1 = useRef<RapierRigidBody | null>(null)
  const j2 = useRef<RapierRigidBody | null>(null)
  const j3 = useRef<RapierRigidBody | null>(null)
  const card = useRef<RapierRigidBody | null>(null)

  // Smooth positions (avoid monkey-patching onto RapierRigidBody)
  const j1Lerped = useRef<THREE.Vector3 | null>(null)
  const j2Lerped = useRef<THREE.Vector3 | null>(null)

  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    dir = new THREE.Vector3()

  const q = new THREE.Quaternion()
  const euler = new THREE.Euler(0, 0, 0, 'YXZ')
  const restYaw = useRef<number | null>(null)

  const normAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

  const segmentProps = {
    canSleep: true,
    colliders: false,
    angularDamping: 2,
    linearDamping: 2,
  } as const satisfies Partial<RigidBodyProps>

  // NOTE: Canvas size
  const { width, height } = useThree((state) => state.size)

  // NOTE: a catmull-rom curve to smooth out curve with just a few points.
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  )

  const [dragged, drag] = useState<THREE.Vector3 | null>(null)
  const [hovered, hover] = useState(false)

  // NOTE: Defining physics joints, and made a chain that hangs on a fixed point
  // useRopeJoint requires two <RigidBody> references
  useRopeJoint(
    fixed as unknown as RefObject<RapierRigidBody>,
    j1 as unknown as RefObject<RapierRigidBody>,
    [[0, 0, 0], [0, 0, 0], 1],
  )
  useRopeJoint(
    j1 as unknown as RefObject<RapierRigidBody>,
    j2 as unknown as RefObject<RapierRigidBody>,
    [[0, 0, 0], [0, 0, 0], 1],
  )
  useRopeJoint(
    j2 as unknown as RefObject<RapierRigidBody>,
    j3 as unknown as RefObject<RapierRigidBody>,
    [[0, 0, 0], [0, 0, 0], 1],
  )
  useSphericalJoint(
    j3 as unknown as RefObject<RapierRigidBody>,
    card as unknown as RefObject<RapierRigidBody>,
    [
      [0, 0, 0],
      [0, 1.45, 0],
    ],
  )

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => {
        document.body.style.cursor = 'auto'
      }
    }
  }, [hovered, dragged])

  const stepLerped = (
    body: RapierRigidBody,
    lerpedRef: RefObject<THREE.Vector3 | null>,
    delta: number,
  ) => {
    if (!lerpedRef.current)
      lerpedRef.current = new THREE.Vector3().copy(body.translation())

    const clampedDistance = Math.max(
      0.1,
      Math.min(1, lerpedRef.current.distanceTo(body.translation())),
    )
    lerpedRef.current.lerp(
      body.translation(),
      delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
    )
  }

  useFrame((state, delta) => {
    if (
      !fixed.current ||
      !j1.current ||
      !j2.current ||
      !j3.current ||
      !band.current ||
      !card.current
    )
      return

    // PERF: camera unprojection: translate a pointer event coordinate to a 3D object
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[
        card.current,
        j1.current,
        j2.current,
        j3.current,
        fixed.current,
      ].forEach((rb) => {
        rb.wakeUp()
      })
      card.current.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      })
    }

    if (fixed.current) {
      // Fix most of the jitter when over pulling the card
      stepLerped(j1.current, j1Lerped, delta)
      stepLerped(j2.current, j2Lerped, delta)

      // NOTE: use catmull-rom curve to position the rigid body chain
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2Lerped.current ?? j2.current.translation())
      curve.points[2].copy(j1Lerped.current ?? j1.current.translation())
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(32)) // interpolate curve with 32 points

      // NOTE: Tilt it back towards the screen
      const shouldAutoface = Boolean(dragged) || card.current.isMoving()
      if (shouldAutoface) {
        const r = card.current.rotation()
        q.set(r.x, r.y, r.z, r.w)
        euler.setFromQuaternion(q)

        const yaw = euler.y
        if (restYaw.current === null) restYaw.current = yaw

        const yawError =
          restYaw.current === null ? 0 : normAngle(restYaw.current - yaw)
        if (Math.abs(yawError) > 1e-3) {
          ang.copy(card.current.angvel()) // card.current.angvel() current rotational velocity
          // Nudge back towards the initial orientation without waking the whole chain.
          card.current.setAngvel(
            { x: ang.x, y: ang.y + yawError * 0.25, z: ang.z },
            false,
          )
        }
      }
    }
  })

  curve.curveType = 'centripetal'
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody ref={j1} position={[0.5, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={j2} position={[1, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={j3} position={[1.5, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          ref={card}
          position={[2, 0, 0]}
          rotation={[0, Math.PI, 0]}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          {/* box shape for collider */}
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              ;(
                e.currentTarget as unknown as HTMLElement
              ).releasePointerCapture(e.pointerId)
              drag(null)
            }}
            // HACK: current point of model (e.point) subtract card's position in space (card.current.translation)
            // the calcuated offset is for the `useFrame` above to calcuate the correct kinematic position
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              ;(e.currentTarget as unknown as HTMLElement).setPointerCapture(
                e.pointerId,
              )
              if (!card.current) return
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation())),
              )
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                // map={materials.base.map}
                // map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                iridescence={1}
                iridescenceIOR={1}
                iridescenceThicknessRange={[0, 2400]}
                metalness={0.5}
                roughness={0.3}
              >
                <RenderTexture attach="map" width={2000} height={2000}>
                  <BadgeTexture user={user} />
                </RenderTexture>
              </meshPhysicalMaterial>
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          depthTest={false}
          args={[
            {
              color: 'white',
              lineWidth: 1,
              map: texture,
              repeat: new THREE.Vector2(-3, 1),
              resolution: new THREE.Vector2(width, height),
              useMap: 1,
            },
          ]}
        />
      </mesh>
    </>
  )
}

function BadgeTexture({ user }: { user: OnboardTagUser }) {
  const nameLine = user?.name?.trim() || 'Anonymous'
  const emailLine = user?.email?.trim() || ''

  return (
    <Center bottom right>
      <group scale={2}>
        <Resize height width>
          <Text3D
            bevelEnabled={false}
            bevelSize={0}
            font="/Geist_Regular.json"
            height={0.5}
            position={[5.5, 0, 0]}
            rotation={[0, Math.PI, Math.PI / 2]}
          >
            {user ? nameLine : 'Log in'}
          </Text3D>
          <Text3D
            bevelEnabled={false}
            bevelSize={0}
            font="/Geist_Regular.json"
            height={0.5}
            position={[4, 0, 0]}
            rotation={[0, Math.PI, Math.PI / 2]}
          >
            {user ? emailLine : 'to claim your tag'}
          </Text3D>
        </Resize>
      </group>
    </Center>
  )
}
