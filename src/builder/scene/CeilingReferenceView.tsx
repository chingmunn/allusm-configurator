import type { ThreeEvent } from '@react-three/fiber';

type CeilingReferenceViewProps = {
  width: number;
  depth: number;
  height: number;
  onDeselect: () => void;
};

export function CeilingReferenceView({
  width,
  depth,
  height,
  onDeselect,
}: CeilingReferenceViewProps) {
  const planeWidth = Math.max(width + 900, 1800);
  const planeDepth = Math.max(depth + 1200, 1800);
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onDeselect();
  };

  return (
    <group position={[width / 2, height, depth / 2]}>
      <mesh receiveShadow onPointerDown={handlePointerDown}>
        <boxGeometry args={[planeWidth, 16, planeDepth]} />
        <meshStandardMaterial
          color="#f4f7fa"
          roughness={0.92}
          metalness={0.02}
          transparent
          opacity={0.68}
        />
      </mesh>
      <mesh position={[0, -10, 0]} receiveShadow onPointerDown={handlePointerDown}>
        <boxGeometry args={[planeWidth - 80, 3, planeDepth - 80]} />
        <meshStandardMaterial
          color="#c2ccd5"
          roughness={0.88}
          metalness={0.04}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}
