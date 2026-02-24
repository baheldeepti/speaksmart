import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

function Floor() {
  const woodTexture = useTexture("/textures/wood.jpg");
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(8, 8);
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 20]} />
      <meshStandardMaterial map={woodTexture} />
    </mesh>
  );
}

function Walls() {
  const wallColor = "#e8e0d4";
  const wallHeight = 5;
  
  return (
    <group>
      <mesh position={[0, wallHeight / 2, -10]} receiveShadow>
        <boxGeometry args={[30, wallHeight, 0.3]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[-15, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[0.3, wallHeight, 20]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[15, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[0.3, wallHeight, 20]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[0, wallHeight / 2, 10]} receiveShadow>
        <boxGeometry args={[30, wallHeight, 0.3]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
    </group>
  );
}

function Ceiling() {
  return (
    <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[30, 20]} />
      <meshStandardMaterial color="#f5f0e8" />
    </mesh>
  );
}

function Podium() {
  return (
    <group position={[0, 0, -7]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 1, 1.5]} />
        <meshStandardMaterial color="#5c3d2e" />
      </mesh>
      <mesh position={[0, 1.3, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.6, 0.1]} />
        <meshStandardMaterial color="#4a2f21" />
      </mesh>
      <mesh position={[0, 1.7, -0.15]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.7, -0.15]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#555" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Chair({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.5]} />
        <meshStandardMaterial color="#6b4c3b" />
      </mesh>
      {[[-0.2, 0, -0.2], [0.2, 0, -0.2], [-0.2, 0, 0.2], [0.2, 0, 0.2]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.12, pos[2]]} castShadow>
          <boxGeometry args={[0.04, 0.25, 0.04]} />
          <meshStandardMaterial color="#5a3d2e" />
        </mesh>
      ))}
      <mesh position={[0, 0.55, -0.22]} castShadow>
        <boxGeometry args={[0.5, 0.55, 0.05]} />
        <meshStandardMaterial color="#6b4c3b" />
      </mesh>
    </group>
  );
}

function AudienceChairs() {
  const chairs = useMemo(() => {
    const result: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const x = (col - 2) * 2;
        const z = -3 + row * 2.5;
        result.push({ pos: [x, 0, z], rot: [0, Math.PI, 0] });
      }
    }
    return result;
  }, []);

  return (
    <group>
      {chairs.map((chair, i) => (
        <Chair key={i} position={chair.pos} rotation={chair.rot} />
      ))}
    </group>
  );
}

function TimerScreen() {
  return (
    <group position={[6, 2.5, -9.7]}>
      <mesh castShadow>
        <boxGeometry args={[3, 1.8, 0.2]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[2.7, 1.5]} />
        <meshStandardMaterial color="#001a00" emissive="#001a00" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function AgendaBoard() {
  return (
    <group position={[-6, 2.5, -9.7]}>
      <mesh castShadow>
        <boxGeometry args={[4, 3, 0.15]} />
        <meshStandardMaterial color="#f5f0e0" />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[3.6, 2.6, 0.02]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 1.1, 0.1]}>
        <boxGeometry args={[2.5, 0.3, 0.01]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      {[-0.3, -0.7, -1.1].map((y, i) => (
        <mesh key={i} position={[-0.2, y, 0.1]}>
          <boxGeometry args={[2, 0.08, 0.01]} />
          <meshStandardMaterial color="#a0aec0" />
        </mesh>
      ))}
    </group>
  );
}

function CeilingLights() {
  return (
    <group>
      {[-5, 0, 5].map((x, i) => (
        <group key={i} position={[x, 4.8, -2]}>
          <mesh>
            <boxGeometry args={[2, 0.1, 0.5]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[0, -0.5, 0]} intensity={0.8} distance={12} color="#fff5e6" castShadow={i === 1} />
        </group>
      ))}
    </group>
  );
}

function ToastmastersLogo() {
  return (
    <group position={[0, 3.5, -9.7]}>
      <mesh>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color="#004165" />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[0.35, 32]} />
        <meshStandardMaterial color="#004165" />
      </mesh>
    </group>
  );
}

function SideTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial color="#6b4c3b" />
      </mesh>
      {[[-0.5, 0, -0.25], [0.5, 0, -0.25], [-0.5, 0, 0.25], [0.5, 0, 0.25]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.2, pos[2]]} castShadow>
          <boxGeometry args={[0.04, 0.4, 0.04]} />
          <meshStandardMaterial color="#5a3d2e" />
        </mesh>
      ))}
    </group>
  );
}

export default function MeetingRoom() {
  return (
    <group>
      <Floor />
      <Walls />
      <Ceiling />
      <Podium />
      <AudienceChairs />
      <TimerScreen />
      <AgendaBoard />
      <CeilingLights />
      <ToastmastersLogo />
      <SideTable position={[-10, 0, -6]} />
      <SideTable position={[10, 0, -6]} />
    </group>
  );
}
