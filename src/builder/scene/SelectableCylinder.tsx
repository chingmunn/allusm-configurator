import { Edges } from '@react-three/drei';
import { useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { CylinderDescriptor } from '../model/types';

type SelectableCylinderProps = {
  descriptor: CylinderDescriptor;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function SelectableCylinder({
  descriptor,
  selected,
  onSelect,
}: SelectableCylinderProps) {
  const [hovered, setHovered] = useState(false);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelect(descriptor.selectId);
  };

  return (
    <mesh
      position={descriptor.position}
      rotation={descriptor.rotation}
      onPointerDown={handlePointerDown}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <cylinderGeometry
        args={[descriptor.radius, descriptor.radius, descriptor.height, 24]}
      />
      <meshStandardMaterial
        color={descriptor.color}
        metalness={0.68}
        roughness={0.32}
        emissive={selected ? '#ffffff' : descriptor.color}
        emissiveIntensity={selected ? 0.32 : hovered ? 0.16 : 0}
      />
      {selected ? <Edges color="#ffffff" scale={1.03} threshold={10} /> : null}
    </mesh>
  );
}
