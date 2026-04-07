import { Edges } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { BoxDescriptor } from '../model/types';

type PegboardViewProps = {
  descriptor: BoxDescriptor;
  selected: boolean;
  renderMode?: boolean;
  onSelect: (id: string) => void;
};

type HolePosition = [number, number, number];
type HoleLayout = {
  positions: HolePosition[];
  rotation: [number, number, number];
  holeDepth: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function deriveHoleLayout(size: [number, number, number]): HoleLayout {
  const [sizeX, sizeY, sizeZ] = size;
  const thinAxis =
    sizeX <= sizeY && sizeX <= sizeZ ? 'x' : sizeY <= sizeZ ? 'y' : 'z';

  const { width, height, holeDepth, rotation } =
    thinAxis === 'x'
      ? {
          width: sizeZ,
          height: sizeY,
          holeDepth: sizeX + 3.2,
          rotation: [0, 0, Math.PI / 2] as [number, number, number],
        }
      : thinAxis === 'y'
        ? {
            width: sizeX,
            height: sizeZ,
            holeDepth: sizeY + 3.2,
            rotation: [0, 0, 0] as [number, number, number],
          }
        : {
            width: sizeX,
            height: sizeY,
            holeDepth: sizeZ + 3.2,
            rotation: [Math.PI / 2, 0, 0] as [number, number, number],
          };

  const columns = clamp(Math.floor(width / 80), 3, 8);
  const rows = clamp(Math.floor(height / 80), 3, 8);
  const usableWidth = width - 48;
  const usableHeight = height - 48;

  const positions = Array.from({ length: columns * rows }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const widthOffset =
      columns === 1
        ? 0
        : -usableWidth / 2 + (usableWidth / (columns - 1)) * column;
    const heightOffset =
      rows === 1
        ? 0
        : usableHeight / 2 - (usableHeight / (rows - 1)) * row;

    if (thinAxis === 'x') {
      return [0, heightOffset, widthOffset] as HolePosition;
    }

    if (thinAxis === 'y') {
      return [widthOffset, 0, heightOffset] as HolePosition;
    }

    return [widthOffset, heightOffset, 0] as HolePosition;
  });

  return {
    positions,
    rotation,
    holeDepth,
  };
}

export function PegboardView({
  descriptor,
  selected,
  renderMode = false,
  onSelect,
}: PegboardViewProps) {
  const [hovered, setHovered] = useState(false);
  const resolvedOpacity = descriptor.opacity ?? 1;
  const resolvedRoughness = Math.max(
    renderMode ? (descriptor.roughness ?? 0.58) - 0.06 : descriptor.roughness ?? 0.58,
    0.04,
  );
  const resolvedMetalness = descriptor.metalness ?? 0.08;
  const resolvedTransmission = descriptor.transmission ?? 0.68;
  const isTransparent = resolvedOpacity < 1;
  const holeLayout = useMemo(
    () => deriveHoleLayout(descriptor.size),
    [descriptor.size],
  );

  useEffect(() => {
    if (renderMode) {
      setHovered(false);
    }
  }, [renderMode]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelect(descriptor.selectId);
  };

  return (
    <group
      position={descriptor.position}
      onPointerDown={handlePointerDown}
      onPointerOver={(event) => {
        if (renderMode) {
          return;
        }
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={descriptor.size} />
        {isTransparent ? (
          <meshPhysicalMaterial
            color={descriptor.color}
            roughness={resolvedRoughness}
            metalness={resolvedMetalness}
            emissive={selected && !renderMode ? '#ffffff' : descriptor.color}
            emissiveIntensity={renderMode ? 0 : selected ? 0.3 : hovered ? 0.12 : 0}
            transparent
            opacity={resolvedOpacity}
            transmission={renderMode ? Math.min(resolvedTransmission + 0.08, 0.9) : resolvedTransmission}
            thickness={1}
            clearcoat={0.4}
            clearcoatRoughness={0.08}
            depthWrite={false}
          />
        ) : (
          <meshStandardMaterial
            color={descriptor.color}
            roughness={resolvedRoughness}
            metalness={resolvedMetalness}
            emissive={selected && !renderMode ? '#ffffff' : descriptor.color}
            emissiveIntensity={renderMode ? 0 : selected ? 0.34 : hovered ? 0.14 : 0}
          />
        )}
        {selected && !renderMode ? (
          <Edges color="#ffffff" scale={1.01} threshold={15} />
        ) : null}
      </mesh>

      {holeLayout.positions.map((position, index) => (
        <mesh
          key={`${descriptor.id}-hole-${index}`}
          position={position}
          rotation={holeLayout.rotation}
        >
          <cylinderGeometry args={[6, 6, holeLayout.holeDepth, 16]} />
          <meshStandardMaterial color="#18222c" roughness={0.82} metalness={0.02} />
        </mesh>
      ))}
    </group>
  );
}
