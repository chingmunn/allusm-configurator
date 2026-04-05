import type { ThreeEvent } from '@react-three/fiber';

type HumanReferenceViewProps = {
  position: [number, number, number];
  onDeselect: () => void;
};

const HUMAN_HEIGHT = 1700;
const LEG_HEIGHT = 820;
const TORSO_HEIGHT = 520;
const NECK_HEIGHT = 60;
const HEAD_RADIUS = 150;

export function HumanReferenceView({
  position,
  onDeselect,
}: HumanReferenceViewProps) {
  const hipY = LEG_HEIGHT;
  const torsoCenterY = hipY + TORSO_HEIGHT / 2;
  const shoulderY = hipY + TORSO_HEIGHT - 70;
  const neckCenterY = hipY + TORSO_HEIGHT + NECK_HEIGHT / 2;
  const headCenterY = HUMAN_HEIGHT - HEAD_RADIUS;

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onDeselect();
  };

  return (
    <group position={position} onPointerDown={handlePointerDown}>
      <mesh position={[0, torsoCenterY, 0]} castShadow receiveShadow>
        <boxGeometry args={[280, TORSO_HEIGHT, 150]} />
        <meshStandardMaterial color="#78838d" roughness={0.82} metalness={0.08} />
      </mesh>

      <mesh position={[0, neckCenterY, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[42, 42, NECK_HEIGHT, 16]} />
        <meshStandardMaterial color="#d7b199" roughness={0.92} metalness={0.02} />
      </mesh>

      <mesh position={[0, headCenterY, 0]} castShadow receiveShadow>
        <sphereGeometry args={[HEAD_RADIUS, 24, 24]} />
        <meshStandardMaterial color="#d7b199" roughness={0.92} metalness={0.02} />
      </mesh>

      <mesh position={[-86, LEG_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[92, LEG_HEIGHT, 92]} />
        <meshStandardMaterial color="#2f3640" roughness={0.86} metalness={0.08} />
      </mesh>
      <mesh position={[86, LEG_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[92, LEG_HEIGHT, 92]} />
        <meshStandardMaterial color="#2f3640" roughness={0.86} metalness={0.08} />
      </mesh>

      <mesh position={[-218, shoulderY, 0]} rotation={[0, 0, Math.PI / 12]} castShadow>
        <cylinderGeometry args={[38, 38, 540, 16]} />
        <meshStandardMaterial color="#78838d" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh position={[218, shoulderY, 0]} rotation={[0, 0, -Math.PI / 12]} castShadow>
        <cylinderGeometry args={[38, 38, 540, 16]} />
        <meshStandardMaterial color="#78838d" roughness={0.82} metalness={0.08} />
      </mesh>
    </group>
  );
}
