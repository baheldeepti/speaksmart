import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import MeetingRoom from "./MeetingRoom";
import AudienceAvatars from "./AudienceAvatars";

interface SessionInfo {
  id: number;
  role: string;
  score: number;
  durationSeconds: number;
  mode: string;
  completedAt: string;
  recordingId?: number;
  evaluationScore?: number;
}

interface CameraPreset {
  id: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: CameraPreset[] = [
  { id: "audience", label: "Audience View", position: [0, 3, 6], target: [0, 1.5, -7] },
  { id: "podium", label: "Behind Podium", position: [0, 2, -5], target: [0, 2, 4] },
  { id: "side_left", label: "Left Side", position: [-8, 3, -2], target: [0, 1.5, -5] },
  { id: "side_right", label: "Right Side", position: [8, 3, -2], target: [0, 1.5, -5] },
  { id: "overhead", label: "Overhead", position: [0, 9, 0], target: [0, 0, -3] },
  { id: "cinematic", label: "Cinematic", position: [6, 3, 4], target: [0, 1.5, -5] },
];

function ReplayCamera({ preset, autoRotate }: { preset: CameraPreset; autoRotate: boolean }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const targetRef = useRef(new THREE.Vector3(...preset.target));
  const positionRef = useRef(new THREE.Vector3(...preset.position));

  useEffect(() => {
    positionRef.current.set(...preset.position);
    targetRef.current.set(...preset.target);
  }, [preset]);

  useFrame(() => {
    camera.position.lerp(positionRef.current, 0.03);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetRef.current, 0.03);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={preset.target}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0.1}
      maxDistance={20}
      minDistance={2}
      enablePan={true}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
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
      />
      <pointLight position={[0, 4, -7]} intensity={0.8} color="#fff5e6" distance={12} />
      <hemisphereLight intensity={0.3} color="#e0d5c5" groundColor="#2d3748" />
    </>
  );
}

function SpeakerIndicator({ role }: { role: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = 2.5 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
    }
  });

  const isSpeaker = role === "speaker" || role === "table_topics";
  if (!isSpeaker) return null;

  return (
    <group position={[0, 0, -7]}>
      <mesh ref={meshRef} position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#4299e1" emissive="#4299e1" emissiveIntensity={0.5} />
      </mesh>
      <pointLight position={[0, 2.5, 0]} intensity={0.3} color="#4299e1" distance={3} />
    </group>
  );
}

const roleLabels: Record<string, string> = {
  speaker: "Speaker",
  table_topics: "Table Topics",
  evaluator: "Evaluator",
  timer: "Timer",
  grammarian: "Grammarian",
  ah_counter: "Ah Counter",
};

export default function SessionReplay({ onBack }: { onBack: () => void }) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [recordings, setRecordings] = useState<{ id: number; role: string; sessionId: number; durationSeconds: number }[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionInfo | null>(null);
  const [currentPreset, setCurrentPreset] = useState<CameraPreset>(CAMERA_PRESETS[0]);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/sessions").then(r => r.json()).catch(() => []),
      fetch("/api/recordings").then(r => r.json()).catch(() => []),
    ]).then(([sessionsData, recordingsData]) => {
      const s = Array.isArray(sessionsData) ? sessionsData : [];
      const r = Array.isArray(recordingsData) ? recordingsData : [];
      const enriched = s.map((session: any) => {
        const rec = r.find((rec: any) => rec.sessionId === session.id);
        return { ...session, recordingId: rec?.id };
      });
      setSessions(enriched.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()));
      setRecordings(r);
      setLoading(false);
    });
  }, []);

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handlePlay = useCallback(() => {
    if (!selectedSession) return;

    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPlaying(false);
      return;
    }

    if (selectedSession.recordingId) {
      const audio = new Audio(`/api/recordings/${selectedSession.recordingId}/audio`);
      audio.currentTime = playbackTime;
      audio.onended = () => {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };
      audio.play().catch(() => {});
      audioRef.current = audio;
    }

    timerRef.current = setInterval(() => {
      setPlaybackTime(prev => {
        if (prev >= (selectedSession?.durationSeconds || 0)) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    setIsPlaying(true);
  }, [selectedSession, isPlaying, playbackTime]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value);
    setPlaybackTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setPlaybackTime(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSelectSession = (session: SessionInfo) => {
    if (audioRef.current) audioRef.current.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setPlaybackTime(0);
    setSelectedSession(session);
  };

  const handleBackToList = () => {
    if (audioRef.current) audioRef.current.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setPlaybackTime(0);
    setSelectedSession(null);
  };

  if (!selectedSession) {
    return (
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "white",
        fontFamily: "'Inter', sans-serif",
        zIndex: 100,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
          <button onClick={onBack} style={{
            background: "none", border: "none", color: "#4299e1",
            fontSize: 14, cursor: "pointer", padding: "8px 0", minHeight: 44,
          }}>
            Back
          </button>
          <div style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 700 }}>
            Session Replay
          </div>
          <div style={{ width: 40 }} />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          <div style={{
            textAlign: "center",
            padding: "16px 20px",
            marginBottom: 20,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ fontSize: 14, color: "#a0aec0", lineHeight: 1.6 }}>
              Select a past session to replay in the 3D meeting room. 
              Switch between camera angles and re-listen to your recordings.
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", color: "#718096", padding: 40 }}>Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: "center", color: "#718096", padding: 40 }}>
              No sessions yet. Complete a practice session to replay it here!
            </div>
          ) : (
            sessions.map(s => (
              <button
                key={s.id}
                onClick={() => handleSelectSession(s)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  color: "white",
                  textAlign: "left",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {roleLabels[s.role] || s.role}
                  </div>
                  <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>
                    {formatDate(s.completedAt)} · {formatTime(s.durationSeconds)}
                  </div>
                  {s.recordingId && (
                    <div style={{ fontSize: 11, color: "#4299e1", marginTop: 4 }}>
                      Has audio recording
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#48bb78" }}>
                    +{s.score}
                  </div>
                  <div style={{
                    fontSize: 18,
                    color: "#4299e1",
                  }}>
                    ▶
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  const progress = selectedSession.durationSeconds > 0
    ? (playbackTime / selectedSession.durationSeconds) * 100
    : 0;

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
    }}>
      <Canvas
        shadows
        camera={{
          position: currentPreset.position,
          fov: 55,
          near: 0.1,
          far: 100,
        }}
        gl={{ antialias: true, powerPreference: "default" }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#1a1a2e"]} />
        <fog attach="fog" args={["#1a1a2e", 20, 40]} />
        <ReplayCamera preset={currentPreset} autoRotate={autoRotate} />
        <Lighting />
        <Suspense fallback={null}>
          <MeetingRoom />
          <AudienceAvatars />
          <SpeakerIndicator role={selectedSession.role} />
        </Suspense>
      </Canvas>

      <div style={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 10,
        pointerEvents: "auto",
      }}>
        <button
          onClick={handleBackToList}
          style={{
            background: "rgba(0,0,0,0.8)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Back
        </button>
      </div>

      <div style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        background: "rgba(0,0,0,0.85)",
        borderRadius: 12,
        padding: "10px 20px",
        textAlign: "center",
        color: "white",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>
          {roleLabels[selectedSession.role] || selectedSession.role} Replay
        </div>
        <div style={{ fontSize: 11, color: "#a0aec0", marginTop: 2 }}>
          {formatDate(selectedSession.completedAt)} · Score: {selectedSession.score}
        </div>
      </div>

      <div style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}>
        {CAMERA_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => { setCurrentPreset(preset); setAutoRotate(false); }}
            style={{
              background: currentPreset.id === preset.id
                ? "rgba(66, 153, 225, 0.4)"
                : "rgba(0,0,0,0.7)",
              color: "white",
              border: currentPreset.id === preset.id
                ? "1px solid #4299e1"
                : "1px solid rgba(255,255,255,0.15)",
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: currentPreset.id === preset.id ? 700 : 400,
              textAlign: "left",
              minWidth: 140,
              pointerEvents: "auto",
            }}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          style={{
            background: autoRotate
              ? "rgba(233, 69, 96, 0.3)"
              : "rgba(0,0,0,0.7)",
            color: "white",
            border: autoRotate
              ? "1px solid #e94560"
              : "1px solid rgba(255,255,255,0.15)",
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: autoRotate ? 700 : 400,
            textAlign: "left",
            minWidth: 140,
            marginTop: 4,
            pointerEvents: "auto",
          }}
        >
          {autoRotate ? "Stop Auto-Rotate" : "Auto-Rotate"}
        </button>
      </div>

      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        background: "rgba(0,0,0,0.85)",
        padding: "12px 20px 16px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        pointerEvents: "auto",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}>
          <button
            onClick={handleRestart}
            style={{
              background: "none",
              border: "none",
              color: "#a0aec0",
              cursor: "pointer",
              fontSize: 16,
              padding: "4px 8px",
            }}
          >
            ⟲
          </button>
          <button
            onClick={handlePlay}
            style={{
              background: isPlaying
                ? "rgba(233, 69, 96, 0.3)"
                : "rgba(66, 153, 225, 0.3)",
              border: isPlaying
                ? "1px solid #e94560"
                : "1px solid #4299e1",
              color: "white",
              padding: "8px 20px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              minWidth: 80,
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <div style={{ fontSize: 13, color: "#a0aec0", fontFamily: "monospace", minWidth: 90 }}>
            {formatTime(playbackTime)} / {formatTime(selectedSession.durationSeconds)}
          </div>
          {!selectedSession.recordingId && (
            <div style={{ fontSize: 11, color: "#718096", fontStyle: "italic" }}>
              No audio recording for this session
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <div style={{
            width: "100%",
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min(progress, 100)}%`,
              background: "linear-gradient(90deg, #4299e1, #63b3ed)",
              borderRadius: 3,
              transition: "width 0.3s linear",
            }} />
          </div>
          <input
            type="range"
            min={0}
            max={selectedSession.durationSeconds || 1}
            value={playbackTime}
            onChange={handleSeek}
            style={{
              position: "absolute",
              top: -6,
              left: 0,
              width: "100%",
              height: 18,
              opacity: 0,
              cursor: "pointer",
            }}
          />
        </div>
      </div>
    </div>
  );
}
