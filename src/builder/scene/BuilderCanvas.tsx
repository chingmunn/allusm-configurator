import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { deriveLayout } from '../geometry/deriveLayout';
import { builderSelectors, useBuilderStore } from '../store/useBuilderStore';
import { BuilderScene } from './BuilderScene';

type CameraPreset = 'perspective' | 'front' | 'side';

function CameraController({
  preset,
  orbitControlsRef,
  maxDimension,
}: {
  preset: CameraPreset;
  orbitControlsRef: MutableRefObject<OrbitControlsImpl | null>;
  maxDimension: number;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const distance = Math.max(maxDimension * 2, 900);

    if (preset === 'front') {
      camera.position.set(0, distance * 0.22, distance);
    } else if (preset === 'side') {
      camera.position.set(distance, distance * 0.18, 0);
    } else {
      camera.position.set(distance * 0.82, distance * 0.58, distance * 0.82);
    }

    camera.lookAt(0, 0, 0);
    orbitControlsRef.current?.target.set(0, 0, 0);
    orbitControlsRef.current?.update();
  }, [camera, maxDimension, orbitControlsRef, preset]);

  return null;
}

export function BuilderCanvas() {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);
  const design = useBuilderStore(builderSelectors.design);
  const selectItem = useBuilderStore((state) => state.selectItem);
  const dimensions = useMemo(() => deriveLayout(design).dimensions, [design]);

  const maxDimension = useMemo(
    () => Math.max(dimensions.width, dimensions.height, dimensions.depth),
    [dimensions.depth, dimensions.height, dimensions.width],
  );

  return (
    <section className="builder-canvas-card">
      <div className="canvas-toolbar">
        <span className="canvas-toolbar__label">Camera</span>
        <div className="segmented-control">
          <button
            type="button"
            className={cameraPreset === 'perspective' ? 'is-active' : ''}
            onClick={() => setCameraPreset('perspective')}
          >
            Perspective
          </button>
          <button
            type="button"
            className={cameraPreset === 'front' ? 'is-active' : ''}
            onClick={() => setCameraPreset('front')}
          >
            Front
          </button>
          <button
            type="button"
            className={cameraPreset === 'side' ? 'is-active' : ''}
            onClick={() => setCameraPreset('side')}
          >
            Side
          </button>
        </div>
      </div>

      <div className="builder-canvas-shell">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [1100, 840, 1100], fov: 42, near: 1, far: 12000 }}
          onPointerMissed={() => selectItem(null)}
        >
          <color attach="background" args={['#eef2f4']} />
          <ambientLight intensity={1.1} />
          <directionalLight
            castShadow
            position={[600, 900, 500]}
            intensity={1.5}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <BuilderScene />
          <gridHelper
            args={[6000, 120, '#9aa8b4', '#d7dee3']}
            position={[0, -dimensions.height / 2 - 5, 0]}
          />
          <mesh
            position={[0, -dimensions.height / 2 - 6, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            onPointerDown={(event) => {
              event.stopPropagation();
              selectItem(null);
            }}
          >
            <planeGeometry args={[6000, 6000]} />
            <shadowMaterial opacity={0.15} />
          </mesh>
          <ContactShadows
            position={[0, -dimensions.height / 2 - 4, 0]}
            opacity={0.2}
            blur={2}
            scale={Math.max(dimensions.width * 1.8, 1600)}
            far={Math.max(dimensions.height * 1.8, 1400)}
          />
          <OrbitControls
            ref={orbitControlsRef}
            makeDefault
            minDistance={400}
            maxDistance={5500}
            enableDamping
            dampingFactor={0.1}
          />
          <CameraController
            preset={cameraPreset}
            orbitControlsRef={orbitControlsRef}
            maxDimension={maxDimension}
          />
        </Canvas>
      </div>
    </section>
  );
}
