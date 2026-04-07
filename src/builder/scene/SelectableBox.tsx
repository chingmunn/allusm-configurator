import { Edges } from '@react-three/drei';
import { useEffect, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { BoxDescriptor } from '../model/types';

type SelectableBoxProps = {
  descriptor: BoxDescriptor;
  selected: boolean;
  opacity?: number;
  renderMode?: boolean;
  onSelect: (id: string) => void;
};

export function SelectableBox({
  descriptor,
  selected,
  opacity = 1,
  renderMode = false,
  onSelect,
}: SelectableBoxProps) {
  const [hovered, setHovered] = useState(false);
  const resolvedOpacity = descriptor.opacity ?? opacity;
  const resolvedRoughness = Math.max(
    renderMode ? (descriptor.roughness ?? 0.48) - 0.08 : descriptor.roughness ?? 0.48,
    0.02,
  );
  const resolvedMetalness =
    descriptor.metalness ?? (descriptor.kind === 'frame' ? 0.55 : 0.14);
  const renderMetalness =
    descriptor.kind === 'frame' && renderMode
      ? Math.min(resolvedMetalness + 0.12, 1)
      : resolvedMetalness;
  const resolvedTransmission = descriptor.transmission ?? 0.72;
  const renderTransmission = renderMode
    ? Math.min(resolvedTransmission + 0.08, 0.95)
    : resolvedTransmission;
  const isTransparent = resolvedOpacity < 1;
  const useGlassMaterial =
    isTransparent &&
    (descriptor.kind === 'panel' ||
      descriptor.kind === 'pegboard' ||
      descriptor.kind === 'shelf');

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
    <mesh
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
      castShadow
      receiveShadow
    >
      <boxGeometry args={descriptor.size} />
      {useGlassMaterial ? (
        <meshPhysicalMaterial
          color={descriptor.color}
          roughness={resolvedRoughness}
          metalness={renderMetalness}
          emissive={selected && !renderMode ? '#ffffff' : descriptor.color}
          emissiveIntensity={
            renderMode ? 0 : selected ? 0.32 : hovered ? 0.16 : 0
          }
          transparent
          opacity={resolvedOpacity}
          transmission={renderTransmission}
          thickness={1}
          clearcoat={0.45}
          clearcoatRoughness={0.08}
          depthWrite={false}
        />
      ) : (
        <meshStandardMaterial
          color={descriptor.color}
          roughness={resolvedRoughness}
          metalness={renderMetalness}
          emissive={selected && !renderMode ? '#ffffff' : descriptor.color}
          emissiveIntensity={
            renderMode ? 0 : selected ? 0.36 : hovered ? 0.18 : 0
          }
          transparent={resolvedOpacity < 1}
          opacity={resolvedOpacity}
        />
      )}
      {selected && !renderMode ? (
        <Edges color="#ffffff" scale={1.01} threshold={15} />
      ) : null}
    </mesh>
  );
}
