import { Edges } from '@react-three/drei';
import { useEffect, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { CylinderDescriptor } from '../model/types';

type SelectableCylinderProps = {
  descriptor: CylinderDescriptor;
  selected: boolean;
  renderMode?: boolean;
  onSelect: (id: string) => void;
};

export function SelectableCylinder({
  descriptor,
  selected,
  renderMode = false,
  onSelect,
}: SelectableCylinderProps) {
  const [hovered, setHovered] = useState(false);

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
      rotation={descriptor.rotation}
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
      <cylinderGeometry
        args={[descriptor.radius, descriptor.radius, descriptor.height, 24]}
      />
      <meshStandardMaterial
        color={descriptor.color}
        metalness={renderMode ? 0.78 : 0.68}
        roughness={renderMode ? 0.24 : 0.32}
        emissive={selected && !renderMode ? '#ffffff' : descriptor.color}
        emissiveIntensity={renderMode ? 0 : selected ? 0.32 : hovered ? 0.16 : 0}
      />
      {selected && !renderMode ? (
        <Edges color="#ffffff" scale={1.03} threshold={10} />
      ) : null}
    </mesh>
  );
}
