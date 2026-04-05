import { Edges } from '@react-three/drei';
import { useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';

type BayViewProps = {
  bayId: string;
  position: [number, number, number];
  size: [number, number, number];
  selected: boolean;
  onSelect: (id: string) => void;
};

export function BayView({
  bayId,
  position,
  size,
  selected,
  onSelect,
}: BayViewProps) {
  const [hovered, setHovered] = useState(false);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelect(bayId);
  };

  return (
    <mesh
      position={position}
      onPointerDown={handlePointerDown}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      {selected || hovered ? (
        <Edges
          color={selected ? '#ffd666' : '#9aa8b4'}
          scale={1.001}
          threshold={15}
        />
      ) : null}
    </mesh>
  );
}
