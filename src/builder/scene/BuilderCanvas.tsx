import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { flushSync } from 'react-dom';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { deriveLayout } from '../geometry/deriveLayout';
import { builderSelectors, useBuilderStore } from '../store/useBuilderStore';
import { BuilderScene } from './BuilderScene';

type CameraPreset = 'perspective' | 'front' | 'side';
type CaptureStillImage = () => Promise<void>;

async function waitForAnimationFrames(count = 2): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
}

async function downloadCanvasPng(canvas: HTMLCanvasElement) {
  const filename = `wardrobe-capture-${new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19)}.png`;

  const fallbackDownload = () => {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  if (!('toBlob' in canvas)) {
    fallbackDownload();
    return;
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });

  if (!blob) {
    fallbackDownload();
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ExportCaptureController({
  onReady,
}: {
  onReady: (capture: CaptureStillImage | null) => void;
}) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    onReady(async () => {
      gl.render(scene, camera);
      await downloadCanvasPng(gl.domElement);
    });

    return () => onReady(null);
  }, [camera, gl, onReady, scene]);

  return null;
}

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
  const [renderMode, setRenderMode] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);
  const captureStillImageRef = useRef<CaptureStillImage | null>(null);
  const design = useBuilderStore(builderSelectors.design);
  const selectItem = useBuilderStore((state) => state.selectItem);
  const dimensions = useMemo(() => deriveLayout(design).dimensions, [design]);

  const maxDimension = useMemo(
    () => Math.max(dimensions.width, dimensions.height, dimensions.depth),
    [dimensions.depth, dimensions.height, dimensions.width],
  );

  const handleRender = async () => {
    if (isRendering) {
      return;
    }

    try {
      flushSync(() => {
        setIsRendering(true);
        setRenderMode(true);
      });
      await waitForAnimationFrames(5);
      await captureStillImageRef.current?.();
    } finally {
      flushSync(() => {
        setRenderMode(false);
        setIsRendering(false);
      });
    }
  };

  return (
    <section className="builder-canvas-card">
      <div className="canvas-toolbar">
        <div className="canvas-toolbar__group">
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
        <button
          type="button"
          className="button button--secondary"
          onClick={handleRender}
          disabled={isRendering}
        >
          {isRendering ? 'Capturing...' : 'Capture'}
        </button>
      </div>

      <div className="builder-canvas-shell">
        <Canvas
          shadows
          dpr={renderMode ? [2, 3] : [1, 2]}
          camera={{ position: [1100, 840, 1100], fov: 42, near: 1, far: 12000 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          onPointerMissed={() => selectItem(null)}
        >
          <ExportCaptureController
            onReady={(capture) => {
              captureStillImageRef.current = capture;
            }}
          />
          <color
            attach="background"
            args={[renderMode ? '#f8fafc' : '#eef2f4']}
          />
          <ambientLight intensity={renderMode ? 1.35 : 1.1} />
          <directionalLight
            castShadow
            position={[600, 900, 500]}
            intensity={renderMode ? 1.9 : 1.5}
            shadow-mapSize-width={renderMode ? 3072 : 2048}
            shadow-mapSize-height={renderMode ? 3072 : 2048}
          />
          {renderMode ? (
            <>
              <directionalLight position={[-750, 640, 920]} intensity={0.55} />
              <directionalLight position={[0, 300, -900]} intensity={0.35} />
            </>
          ) : null}
          <BuilderScene renderMode={renderMode} />
          {!renderMode ? (
            <gridHelper
              args={[6000, 120, '#9aa8b4', '#d7dee3']}
              position={[0, -dimensions.height / 2 - 5, 0]}
            />
          ) : null}
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
            opacity={renderMode ? 0.34 : 0.2}
            blur={renderMode ? 3 : 2}
            scale={Math.max(dimensions.width * (renderMode ? 2.1 : 1.8), 1600)}
            far={Math.max(dimensions.height * (renderMode ? 2.1 : 1.8), 1400)}
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
