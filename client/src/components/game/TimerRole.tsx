import { useEffect, useRef, useState } from "react";
import { useToastmasters } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";

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
    }
    if (seconds >= yellowThreshold && !yellowPlayed) {
      playHit();
      setYellowPlayed(true);
    }
    if (seconds >= redThreshold && !redPlayed) {
      playHit();
      setRedPlayed(true);
      setRunning(false);
    }
  }, [seconds, greenThreshold, yellowThreshold, redThreshold, greenPlayed, yellowPlayed, redPlayed, playHit]);

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

  const handleStart = () => {
    setRunning(true);
    setSeconds(0);
    setGreenPlayed(false);
    setYellowPlayed(false);
    setRedPlayed(false);
  };

  const handleStop = () => {
    setRunning(false);
  };

  const handleReset = () => {
    setRunning(false);
    setSeconds(0);
    setGreenPlayed(false);
    setYellowPlayed(false);
    setRedPlayed(false);
  };

  const handleComplete = () => {
    playSuccess();
    completeRole();
  };

  const activeLight = getActiveLight();

  const timePresets = [
    { label: "1 min", value: 60 },
    { label: "2 min", value: 120 },
    { label: "5 min", value: 300 },
    { label: "7 min", value: 420 },
  ];

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      pointerEvents: "none",
    }}>
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        pointerEvents: "auto",
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
        padding: "32px",
        maxWidth: 400,
        width: "90%",
        textAlign: "center",
        color: "white",
        pointerEvents: "auto",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 4, fontWeight: 600 }}>TIMER ROLE</div>
        <div style={{ fontSize: 11, color: "#718096", marginBottom: 20 }}>Manage the meeting timer</div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginBottom: 24,
        }}>
          {[
            { color: "#48bb78", name: "green", label: "Green" },
            { color: "#f5a623", name: "yellow", label: "Yellow" },
            { color: "#e94560", name: "red", label: "Red" },
          ].map(light => (
            <div key={light.name} style={{ textAlign: "center" }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: activeLight === light.name || (
                  (light.name === "green" && (activeLight === "yellow" || activeLight === "red")) ||
                  (light.name === "yellow" && activeLight === "red")
                ) ? light.color : "#333",
                boxShadow: activeLight === light.name
                  ? `0 0 30px ${light.color}, 0 0 60px ${light.color}44`
                  : "none",
                border: `3px solid ${activeLight === light.name ? light.color : "#555"}`,
                transition: "all 0.3s",
                margin: "0 auto 8px",
              }} />
              <div style={{ fontSize: 11, color: "#a0aec0" }}>{light.label}</div>
              <div style={{ fontSize: 10, color: "#718096" }}>
                {light.name === "green" && formatTime(greenThreshold)}
                {light.name === "yellow" && formatTime(yellowThreshold)}
                {light.name === "red" && formatTime(redThreshold)}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          fontSize: 56,
          fontWeight: 800,
          fontFamily: "monospace",
          color: activeLight === "red" ? "#e94560" : activeLight === "yellow" ? "#f5a623" : activeLight === "green" ? "#48bb78" : "white",
          marginBottom: 16,
          textShadow: activeLight !== "none" ? `0 0 20px currentColor` : "none",
        }}>
          {formatTime(seconds)}
        </div>

        {!running && seconds === 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 8 }}>Speech Duration:</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {timePresets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => setMaxTime(preset.value)}
                  style={{
                    background: maxTime === preset.value ? "rgba(66, 153, 225, 0.3)" : "rgba(255,255,255,0.05)",
                    border: maxTime === preset.value ? "1px solid #4299e1" : "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    padding: "6px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {!running && seconds === 0 && (
            <button
              onClick={handleStart}
              style={{
                background: "linear-gradient(135deg, #48bb78, #38a169)",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Start Timer
            </button>
          )}
          {running && (
            <button
              onClick={handleStop}
              style={{
                background: "linear-gradient(135deg, #e94560, #c62a71)",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Stop
            </button>
          )}
          {!running && seconds > 0 && (
            <>
              <button
                onClick={handleReset}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "10px 24px",
                  borderRadius: 10,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
              <button
                onClick={handleComplete}
                style={{
                  background: "linear-gradient(135deg, #4299e1, #3182ce)",
                  color: "white",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Complete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
