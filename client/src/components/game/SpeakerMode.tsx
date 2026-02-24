import { useEffect, useRef, useState } from "react";
import { useToastmasters } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";

export default function SpeakerMode() {
  const {
    timerSeconds, timerRunning, timerMaxSeconds,
    startTimer, tickTimer, stopTimer, completeRole,
    setAudienceReaction, goToMenu,
  } = useToastmasters();
  const { playSuccess } = useAudio();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, tickTimer]);

  useEffect(() => {
    if (!started) return;
    const elapsed = timerSeconds;
    const max = timerMaxSeconds;
    const ratio = elapsed / max;

    if (ratio < 0.3) {
      setAudienceReaction("neutral");
    } else if (ratio < 0.7) {
      setAudienceReaction("nodding");
    } else if (ratio >= 1) {
      setAudienceReaction("distracted");
    }
  }, [timerSeconds, timerMaxSeconds, started, setAudienceReaction]);

  useEffect(() => {
    if (timerSeconds >= timerMaxSeconds && timerRunning) {
      stopTimer();
      setAudienceReaction("applause");
    }
  }, [timerSeconds, timerMaxSeconds, timerRunning, stopTimer, setAudienceReaction]);

  const handleStart = () => {
    setStarted(true);
    startTimer(300);
  };

  const handleFinish = () => {
    stopTimer();
    setAudienceReaction("applause");
    playSuccess();
    setTimeout(() => completeRole(), 1500);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    const ratio = timerSeconds / timerMaxSeconds;
    if (ratio < 0.5) return "#48bb78";
    if (ratio < 0.8) return "#f5a623";
    return "#e94560";
  };

  return (
    <div style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
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
        position: "absolute",
        top: 20,
        right: 20,
        background: "rgba(0,0,0,0.8)",
        borderRadius: 12,
        padding: "12px 20px",
        textAlign: "center",
        color: "white",
      }}>
        <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>SPEAKER MODE</div>
        <div style={{ fontSize: 11, color: "#718096" }}>5-minute prepared speech</div>
      </div>

      {started && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            fontSize: 64,
            fontWeight: 800,
            color: getTimerColor(),
            textShadow: `0 0 30px ${getTimerColor()}44`,
            fontFamily: "monospace",
          }}>
            {formatTime(timerSeconds)}
          </div>
          <div style={{
            width: 200,
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            margin: "8px auto",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min((timerSeconds / timerMaxSeconds) * 100, 100)}%`,
              background: getTimerColor(),
              borderRadius: 3,
              transition: "width 1s linear, background 0.5s",
            }} />
          </div>
          <div style={{ fontSize: 14, color: "#a0aec0" }}>
            {formatTime(timerMaxSeconds)} total
          </div>
        </div>
      )}

      <div style={{
        display: "flex",
        gap: 12,
        pointerEvents: "auto",
        marginBottom: 10,
      }}>
        {!started ? (
          <button
            onClick={handleStart}
            style={{
              background: "linear-gradient(135deg, #48bb78, #38a169)",
              color: "white",
              border: "none",
              padding: "14px 32px",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(72, 187, 120, 0.4)",
            }}
          >
            Begin Speech
          </button>
        ) : (
          <button
            onClick={handleFinish}
            style={{
              background: "linear-gradient(135deg, #e94560, #c62a71)",
              color: "white",
              border: "none",
              padding: "14px 32px",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(233, 69, 96, 0.4)",
            }}
          >
            Finish Speech
          </button>
        )}
      </div>
    </div>
  );
}
