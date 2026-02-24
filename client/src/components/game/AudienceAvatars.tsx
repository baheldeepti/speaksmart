import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useToastmasters } from "@/lib/stores/useToastmasters";

interface AvatarProps {
  position: [number, number, number];
  color: string;
  animationOffset: number;
}

function Avatar({ position, color, animationOffset }: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const audienceReaction = useToastmasters(state => state.audienceReaction);

  useFrame((state) => {
    if (!groupRef.current || !headRef.current) return;
    const t = state.clock.elapsedTime + animationOffset;

    switch (audienceReaction) {
      case "nodding":
        headRef.current.rotation.x = Math.sin(t * 3) * 0.15;
        break;
      case "applause":
        groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 5)) * 0.05;
        headRef.current.rotation.x = 0;
        break;
      case "distracted":
        headRef.current.rotation.y = Math.sin(t * 0.5 + animationOffset * 2) * 0.4;
        headRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
        break;
      default:
        headRef.current.rotation.x = Math.sin(t * 0.5) * 0.03;
        headRef.current.rotation.y = Math.sin(t * 0.3 + animationOffset) * 0.05;
        groupRef.current.position.y = position[1];
        break;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.25]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh ref={headRef} position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#f0d0b0" />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.3, 0.08, 0.22]} />
        <meshStandardMaterial color={color === "#2d3748" ? "#1a1a2e" : "#4a3020"} />
      </mesh>
      <mesh position={[-0.28, 0.6, 0]} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.28, 0.6, 0]} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default function AudienceAvatars() {
  const avatars = useMemo(() => {
    const colors = ["#2d3748", "#4a5568", "#2b6cb0", "#2f855a", "#9b2c2c", "#6b46c1", "#c05621", "#2d3748", "#4a5568", "#2b6cb0", "#2f855a", "#9b2c2c", "#6b46c1", "#c05621", "#2d3748"];
    const result: { pos: [number, number, number]; color: string; offset: number }[] = [];
    let idx = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const x = (col - 2) * 2;
        const z = -3 + row * 2.5;
        result.push({
          pos: [x, 0, z],
          color: colors[idx % colors.length],
          offset: idx * 0.7,
        });
        idx++;
      }
    }
    return result;
  }, []);

  return (
    <group>
      {avatars.map((avatar, i) => (
        <Avatar
          key={i}
          position={avatar.pos}
          color={avatar.color}
          animationOffset={avatar.offset}
        />
      ))}
    </group>
  );
}
