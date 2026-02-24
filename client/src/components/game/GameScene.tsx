import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, KeyboardControls, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import MeetingRoom from "./MeetingRoom";
import AudienceAvatars from "./AudienceAvatars";
import { useToastmasters } from "@/lib/stores/useToastmasters";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
}

const keyMap = [
  { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
  { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
  { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
  { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
];

function CameraMovement() {
  const [, getControls] = useKeyboardControls<Controls>();
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const speed = 0.08;

  useEffect(() => {
    console.log("[Controls] Keyboard controls initialized - WASD/Arrow keys for camera movement");
  }, []);

  useFrame(() => {
    const controls = getControls();
    const direction = new THREE.Vector3();

    if (controls.forward) direction.z -= 1;
    if (controls.back) direction.z += 1;
    if (controls.left) direction.x -= 1;
    if (controls.right) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize().multiplyScalar(speed);
      direction.applyQuaternion(camera.quaternion);
      direction.y = 0;

      const newPos = camera.position.clone().add(direction);
      newPos.x = THREE.MathUtils.clamp(newPos.x, -14, 14);
      newPos.z = THREE.MathUtils.clamp(newPos.z, -9, 9);
      newPos.y = THREE.MathUtils.clamp(newPos.y, 1.5, 6);

      camera.position.copy(newPos);
    }
  });

  return null;
}

function CameraController() {
  const selectedRole = useToastmasters(state => state.selectedRole);

  const getCameraTarget = (): [number, number, number] => {
    switch (selectedRole) {
      case "speaker":
      case "table_topics":
        return [0, 1.5, -6];
      default:
        return [0, 1.5, -3];
    }
  };

  const target = getCameraTarget();

  return (
    <OrbitControls
      target={target}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0.2}
      maxDistance={18}
      minDistance={3}
      enablePan={false}
      autoRotate={false}
    />
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} color="#fff5e6" />
      <directionalLight
        position={[5, 8, 3]}
        intensity={0.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <pointLight position={[0, 4, -7]} intensity={0.8} color="#fff5e6" distance={12} />
      <hemisphereLight intensity={0.3} color="#e0d5c5" groundColor="#2d3748" />
    </>
  );
}

function SceneContent() {
  return (
    <>
      <CameraMovement />
      <CameraController />
      <Lighting />
      <Suspense fallback={null}>
        <MeetingRoom />
        <AudienceAvatars />
      </Suspense>
    </>
  );
}

export default function GameScene() {
  const selectedRole = useToastmasters(state => state.selectedRole);

  const getCameraPosition = (): [number, number, number] => {
    switch (selectedRole) {
      case "speaker":
      case "table_topics":
        return [0, 2.5, -4];
      default:
        return [0, 4, 8];
    }
  };

  return (
    <KeyboardControls map={keyMap}>
      <Canvas
        shadows
        camera={{
          position: getCameraPosition(),
          fov: 55,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          powerPreference: "default",
        }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#1a1a2e"]} />
        <fog attach="fog" args={["#1a1a2e", 20, 40]} />
        <SceneContent />
      </Canvas>
    </KeyboardControls>
  );
}
