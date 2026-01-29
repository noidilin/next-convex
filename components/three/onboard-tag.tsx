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
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  type RapierRigidBody,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier'
import { useControls } from 'leva'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { useEffect, useRef, useState } from 'react'
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
export default function OnboardTag() {
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
        <Band />
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

function Band({ maxSpeed = 50, minSpeed = 10 }) {
  const { nodes, materials } = useGLTF(
    'https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb',
  ) as unknown as GLTFResult

  const texture = useTexture(
    'https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg',
  )

  // NOTE: reference for band and the joints
  const band = useRef<THREE.Mesh | null>(null),
    fixed = useRef<RapierRigidBody | null>(null),
    j1 = useRef<RapierRigidBody | null>(null),
    j2 = useRef<RapierRigidBody | null>(null),
    j3 = useRef<RapierRigidBody | null>(null),
    card = useRef<RapierRigidBody | null>(null)

  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3()

  const segmentProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 2,
    linearDamping: 2,
  }

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
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ])

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => void (document.body.style.cursor = 'auto')
    }
  }, [hovered, dragged])

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
      ;[card, j1, j2, j3, fixed].forEach((ref) => {
        ref.current?.wakeUp()
      })
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      })
    }

    if (fixed.current) {
      // Fix most of the jitter when over pulling the card
      ;[j1, j2].forEach((ref) => {
        if (!ref.current) return
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(
            ref.current.translation(),
          )
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())),
        )
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
        )
      })

      // NOTE: use catmull-rom curve to position the rigid body chain
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(32)) // interpolate curve with 32 points

      // NOTE: Tilt it back towards the screen
      ang.copy(card.current.angvel()) // card.current.angvel() current rotational velocity
      rot.copy(card.current.rotation()) // card.current.rotation() rotation
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }) // slowly spin the y-axis towards the front
    }
  })

  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

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
            onPointerUp={(e) => (
              e.target.releasePointerCapture(e.pointerId), drag(null)
            )}
            // HACK: current point of model (e.point) subtract card's position in space (card.current.translation)
            // the calcuated offset is for the `useFrame` above to calcuate the correct kinematic position
            onPointerDown={(e) => (
              e.target.setPointerCapture(e.pointerId),
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation())),
              )
            )}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                iridescence={1}
                iridescenceIOR={1}
                iridescenceThicknessRange={[0, 2400]}
                metalness={0.5}
                roughness={0.3}
              >
                <RenderTexture attach="map" height={2000} width={2000}>
                  <BadgeTexture user={{ firstName: 'test', lastName: 'lin' }} />
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
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap
          map={texture}
          repeat={[-3, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  )
}

function BadgeTexture({
  user,
}: {
  user: { firstName: string; lastName: string }
}) {
  return (
    <Center bottom right>
      <Resize maxHeight={0.45} maxWidth={0.925}>
        <Text3D
          bevelEnabled={false}
          bevelSize={0}
          font="/Geist_Regular.json"
          height={0}
          rotation={[0, Math.PI, Math.PI]}
        >
          {user.firstName}
        </Text3D>
        <Text3D
          bevelEnabled={false}
          bevelSize={0}
          font="/Geist_Regular.json"
          height={0}
          position={[0, 1.4, 0]}
          rotation={[0, Math.PI, Math.PI]}
        >
          {user.lastName}
        </Text3D>
      </Resize>
    </Center>
  )
}
