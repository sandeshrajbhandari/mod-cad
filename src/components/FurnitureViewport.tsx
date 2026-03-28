import { useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, ContactShadows, OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { FurnitureConfig, GeneratedModel } from '../lib/furniture'

interface FurnitureViewportProps {
  config: FurnitureConfig
  model: GeneratedModel
}

export function FurnitureViewport({ config, model }: FurnitureViewportProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const sceneKey = useMemo(
    () =>
      `${config.family}-${config.width}-${config.height}-${config.depth}-${config.modules}-${config.frontStyle}-${config.shelfCount}-${config.theme}-${config.deskTopStyle}`,
    [config],
  )

  return (
    <div className="canvas-shell">
      <Canvas camera={{ position: [2.4, 1.7, 2.6], fov: 40 }} shadows dpr={[1, 2]}>
        <color attach="background" args={['#f6efe6']} />
        <fog attach="fog" args={['#f6efe6', 4, 9]} />
        <ambientLight intensity={1.15} />
        <directionalLight
          castShadow
          intensity={1.1}
          position={[4, 6, 3]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <spotLight intensity={0.5} position={[-3, 4, 5]} angle={0.35} penumbra={0.7} />

        <Bounds fit clip observe margin={1.15}>
          <group key={sceneKey}>
            {model.nodes.map((node) => (
              <mesh castShadow receiveShadow key={node.key} position={node.position}>
                <boxGeometry args={node.size} />
                <meshStandardMaterial color={node.color} roughness={0.6} metalness={0.08} />
              </mesh>
            ))}
          </group>
        </Bounds>

        <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.002, 0]}>
          <planeGeometry args={[12, 12]} />
          <meshStandardMaterial color="#efe4d3" />
        </mesh>
        <ContactShadows position={[0, 0.001, 0]} opacity={0.34} scale={6} blur={2.6} far={2.4} />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={1.3}
          maxDistance={6}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>

      <button type="button" className="canvas-hint" onClick={() => controlsRef.current?.reset()}>
        Reset camera
      </button>
    </div>
  )
}
