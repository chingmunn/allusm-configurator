import { Edges } from '@react-three/drei';
import { useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { BoxDescriptor } from '../model/types';

type SelectableBoxProps = {
  descriptor: BoxDescriptor;
  selected: boolean;
  opacity?: number;
  onSelect: (id: string) => void;
};

export function SelectableBox({
  descriptor,
  selected,
  opacity = 1,
  onSelect,
}: SelectableBoxProps) {
  const [hovered, setHovered] = useState(false);
  const resolvedOpacity = descriptor.opacity ?? opacity;
  const resolvedRoughness = descriptor.roughness ?? 0.48;
  const resolvedMetalness =
    descriptor.metalness ?? (descriptor.kind === 'frame' ? 0.55 : 0.14);
  const resolvedTransmission = descriptor.transmission ?? 0.72;
  const isTransparent = resolvedOpacity < 1;
  const useGlassMaterial =
    isTransparent &&
    (descriptor.kind === 'panel' ||
      descriptor.kind === 'pegboard' ||
      descriptor.kind === 'shelf');

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelect(descriptor.selectId);
  };

  return (
    <mesh
      position={descriptor.position}
      onPointerDown={handlePointerDown}
      onPointerOver={(event) => {
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
          metalness={resolvedMetalness}
          emissive={selected ? '#ffffff' : descriptor.color}
          emissiveIntensity={selected ? 0.32 : hovered ? 0.16 : 0}
          transparent
          opacity={resolvedOpacity}
          transmission={resolvedTransmission}
          thickness={1}
          clearcoat={0.45}
          clearcoatRoughness={0.08}
          depthWrite={false}
        />
      ) : (
        <meshStandardMaterial
          color={descriptor.color}
          roughness={resolvedRoughness}
          metalness={resolvedMetalness}
          emissive={selected ? '#ffffff' : descriptor.color}
          emissiveIntensity={selected ? 0.36 : hovered ? 0.18 : 0}
          transparent={resolvedOpacity < 1}
          opacity={resolvedOpacity}
        />
      )}
      {selected ? <Edges color="#ffffff" scale={1.01} threshold={15} /> : null}
    </mesh>
  );
}
