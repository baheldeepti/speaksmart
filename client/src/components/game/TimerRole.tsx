import { useEffect, useRef, useState } from "react";
import { useToastmasters } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";

interface SpeakerEntry {
  name: string;
  startTime: number;
  endTime: number | null;
  greenAt: number | null;
  yellowAt: number | null;
  redAt: number | null;
}

export default function TimerRole() {
  const { completeRole, goToMenu } = useToastmasters();
  const { playHit, playSuccess } = useAudio();
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [maxTime, setMaxTime] = useState(300);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [greenPlayed, setGreenPlayed] = useState(false);
  const [yellowPlayed, setYellowPlayed] = useState(false);
  const [redPlayed, setRedPlayed] = useState(false);
  const [stopCount, setStopCount] = useState(0);
  const startTimeRef = useRef<number>(0);

  const [speakers, setSpeakers] = useState<SpeakerEntry[]>([]);
  const [currentSpeakerName, setCurrentSpeakerName] = useState("");
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const greenThreshold = Math.floor(maxTime * 0.5);
  const yellowThreshold = Math.floor(maxTime * 0.75);
  const redThreshold = maxTime;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (seconds >= greenThreshold && !greenPlayed) {
      playHit();
      setGreenPlayed(true);
      if (activeSpeakerIdx !== null) {
        setSpeakers(prev => prev.map((s, i) => i === activeSpeakerIdx ? { ...s, greenAt: seconds } : s));
      }
    }
    if (seconds >= yellowThreshold && !yellowPlayed) {
      playHit();
      setYellowPlayed(true);
      if (activeSpeakerIdx !== null) {
        setSpeakers(prev => prev.map((s, i) => i === activeSpeakerIdx ? { ...s, yellowAt: seconds } : s));
      }
    }
    if (seconds >= redThreshold && !redPlayed) {
      playHit();
      setRedPlayed(true);
      setRunning(false);
      if (activeSpeakerIdx !== null) {
        setSpeakers(prev => prev.map((s, i) => i === activeSpeakerIdx ? { ...s, redAt: seconds, endTime: seconds } : s));
        setActiveSpeakerIdx(null);
      }
    }
  }, [seconds, greenThreshold, yellowThreshold, redThreshold, greenPlayed, yellowPlayed, redPlayed, playHit, activeSpeakerIdx]);

  const getActiveLight = () => {
    if (seconds >= redThreshold) return "red";
    if (seconds >= yellowThreshold) return "yellow";
    if (seconds >= greenThreshold) return "green";
    return "none";
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleStartSpeaker = () => {
    const name = currentSpeakerName.trim() || `Speaker ${speakers.length + 1}`;
    const entry: SpeakerEntry = {
      name,
      startTime: seconds,
      endTime: null,
      greenAt: null,
      yellowAt: null,
      redAt: null,
    };
    setSpeakers(prev => [...prev, entry]);
    setActiveSpeakerIdx(speakers.length);
    setCurrentSpeakerName("");
    setRunning(true);
    setSeconds(0);
    setGreenPlayed(false);
    setYellowPlayed(false);
    setRedPlayed(false);
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now();
    }
  };

  const handleStopSpeaker = () => {
    setRunning(false);
    setStopCount(prev => prev + 1);
    if (activeSpeakerIdx !== null) {
      setSpeakers(prev => prev.map((s, i) => i === activeSpeakerIdx ? { ...s, endTime: seconds } : s));
      setActiveSpeakerIdx(null);
    }
  };

  const handleComplete = () => {
    playSuccess();
    const totalDuration = speakers.length > 0
      ? speakers.reduce((sum, s) => sum + (s.endTime || 0), 0)
      : seconds;
    const accuracyPercent = speakers.length > 0
      ? Math.min(100, Math.round((totalDuration / (speakers.length * maxTime)) * 100))
      : Math.min(100, Math.round((seconds / maxTime) * 100));
    window.__pendingRoleEvaluation = {
      role: "timer",
      metrics: {
        totalDuration,
        timerStartDelay: 0,
        numberOfStops: stopCount,
        greenSignaled: speakers.some(s => s.greenAt !== null) || greenPlayed,
        yellowSignaled: speakers.some(s => s.yellowAt !== null) || yellowPlayed,
        redSignaled: speakers.some(s => s.redAt !== null) || redPlayed,
        accuracyPercent,
      },
    };
    completeRole();
  };

  const activeLight = getActiveLight();

  const timePresets = [
    { label: "1 min", value: 60 },
    { label: "2 min", value: 120 },
    { label: "5 min", value: 300 },
    { label: "7 min", value: 420 },
  ];

  const getStatusColor = (entry: SpeakerEntry) => {
    if (entry.redAt) return "#e94560";
    if (entry.yellowAt) return "#f5a623";
    if (entry.greenAt) return "#48bb78";
    return "#718096";
  };

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      zIndex: 50,
      pointerEvents: "none",
      overflowY: "auto",
      padding: "20px 0",
    }}>
      <div style={{
        position: "fixed",
        top: 20,
        left: 20,
        pointerEvents: "auto",
        zIndex: 60,
      }}>
        <button
          onClick={goToMenu}
          style={{
            background: "rgba(0,0,0,0.7)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Exit
        </button>
      </div>

      <div style={{
        background: "rgba(0,0,0,0.9)",
        borderRadius: 20,
        padding: "24px",
        maxWidth: 500,
        width: "90%",
        color: "white",
        pointerEvents: "auto",
        border: "1px solid rgba(255,255,255,0.1)",
        marginTop: 60,
      }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>Timer Worksheet</div>
          <div style={{ fontSize: 11, color: "#718096" }}>Track each speaker's time and signal zones</div>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 16,
          marginBottom: 16,
        }}>
          {[
            { color: "#48bb78", name: "green", label: "Green" },
            { color: "#f5a623", name: "yellow", label: "Yellow" },
            { color: "#e94560", name: "red", label: "Red" },
          ].map(light => (
            <div key={light.name} style={{ textAlign: "center" }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: activeLight === light.name || (
                  (light.name === "green" && (activeLight === "yellow" || activeLight === "red")) ||
                  (light.name === "yellow" && activeLight === "red")
                ) ? light.color : "#333",
                boxShadow: activeLight === light.name
                  ? `0 0 20px ${light.color}, 0 0 40px ${light.color}44`
                  : "none",
                border: `2px solid ${activeLight === light.name ? light.color : "#555"}`,
                transition: "all 0.3s",
                margin: "0 auto 4px",
              }} />
              <div style={{ fontSize: 10, color: "#a0aec0" }}>{light.label}</div>
              <div style={{ fontSize: 9, color: "#718096" }}>
                {light.name === "green" && formatTime(greenThreshold)}
                {light.name === "yellow" && formatTime(yellowThreshold)}
                {light.name === "red" && formatTime(redThreshold)}
              </div>
            </div>
          ))}
        </div>

        {running && (
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{
              fontSize: 48,
              fontWeight: 800,
              fontFamily: "monospace",
              color: activeLight === "red" ? "#e94560" : activeLight === "yellow" ? "#f5a623" : activeLight === "green" ? "#48bb78" : "white",
              textShadow: activeLight !== "none" ? `0 0 20px currentColor` : "none",
            }}>
              {formatTime(seconds)}
            </div>
            {activeSpeakerIdx !== null && (
              <div style={{ fontSize: 12, color: "#63b3ed", fontWeight: 600, marginTop: 4 }}>
                Timing: {speakers[activeSpeakerIdx]?.name}
              </div>
            )}
          </div>
        )}

        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 10 }}>
            Speech Duration Preset
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {timePresets.map(preset => (
              <button
                key={preset.value}
                onClick={() => !running && setMaxTime(preset.value)}
                style={{
                  background: maxTime === preset.value ? "rgba(66, 153, 225, 0.3)" : "rgba(255,255,255,0.05)",
                  border: maxTime === preset.value ? "1px solid #4299e1" : "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  padding: "6px 14px",
                  borderRadius: 6,
                  cursor: running ? "default" : "pointer",
                  fontSize: 12,
                  opacity: running ? 0.5 : 1,
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 8 }}>
            {running ? "Speaker Being Timed" : "Start Timing a Speaker"}
          </div>
          {!running && (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={currentSpeakerName}
                onChange={e => setCurrentSpeakerName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleStartSpeaker()}
                placeholder="Speaker name (optional)"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={handleStartSpeaker}
                style={{
                  background: "linear-gradient(135deg, #48bb78, #38a169)",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Start
              </button>
            </div>
          )}
          {running && (
            <button
              onClick={handleStopSpeaker}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #e94560, #c62a71)",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Stop Timer
            </button>
          )}
        </div>

        {speakers.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 10 }}>
              Speaker Log ({speakers.length})
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 60px 40px 40px 40px",
              gap: 4,
              fontSize: 10,
              color: "#718096",
              fontWeight: 600,
              marginBottom: 6,
              textTransform: "uppercase",
            }}>
              <div>Speaker</div>
              <div style={{ textAlign: "center" }}>Time</div>
              <div style={{ textAlign: "center", color: "#48bb78" }}>G</div>
              <div style={{ textAlign: "center", color: "#f5a623" }}>Y</div>
              <div style={{ textAlign: "center", color: "#e94560" }}>R</div>
            </div>
            {speakers.map((entry, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "1fr 60px 40px 40px 40px",
                gap: 4,
                padding: "8px 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                alignItems: "center",
              }}>
                <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>
                  {entry.name}
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: getStatusColor(entry),
                  textAlign: "center",
                  fontFamily: "monospace",
                }}>
                  {formatTime(entry.endTime || (activeSpeakerIdx === i ? seconds : 0))}
                </div>
                <div style={{ textAlign: "center", fontSize: 14 }}>
                  {entry.greenAt !== null ? "●" : "○"}
                </div>
                <div style={{ textAlign: "center", fontSize: 14 }}>
                  {entry.yellowAt !== null ? "●" : "○"}
                </div>
                <div style={{ textAlign: "center", fontSize: 14 }}>
                  {entry.redAt !== null ? "●" : "○"}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 8 }}>
            Timer Notes
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any observations about timing, pacing, or meeting flow..."
            rows={3}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleComplete}
            disabled={speakers.length === 0 && seconds === 0}
            style={{
              background: speakers.length === 0 && seconds === 0
                ? "rgba(255,255,255,0.1)"
                : "linear-gradient(135deg, #4299e1, #3182ce)",
              color: "white",
              border: "none",
              padding: "12px 32px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: speakers.length === 0 && seconds === 0 ? "default" : "pointer",
              opacity: speakers.length === 0 && seconds === 0 ? 0.5 : 1,
            }}
          >
            Submit Timer Report
          </button>
        </div>
      </div>
    </div>
  );
}
