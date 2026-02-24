import { useEffect, useRef, useState } from "react";
import { useToastmasters } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";

export default function TableTopicsMode() {
  const {
    timerSeconds, timerRunning, timerMaxSeconds,
    startTimer, tickTimer, stopTimer, completeRole,
    tableTopicPrompt, generateTableTopic, goToMenu,
  } = useToastmasters();
  const { playSuccess } = useAudio();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [started, setStarted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

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
    if (timerSeconds >= timerMaxSeconds && timerRunning) {
      stopTimer();
      setShowFeedback(true);
    }
  }, [timerSeconds, timerMaxSeconds, timerRunning, stopTimer]);

  const handleStart = () => {
    setStarted(true);
    startTimer(120);
  };

  const handleFinish = () => {
    stopTimer();
    setShowFeedback(true);
    playSuccess();
  };

  const handleComplete = () => {
    completeRole();
  };

  const handleNewPrompt = () => {
    generateTableTopic();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timerSeconds < 60) return "#48bb78";
    if (timerSeconds < 90) return "#f5a623";
    return "#e94560";
  };

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
        position: "absolute",
        top: 20,
        right: 20,
        background: "rgba(0,0,0,0.8)",
        borderRadius: 12,
        padding: "12px 20px",
        textAlign: "center",
        color: "white",
      }}>
        <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>TABLE TOPICS</div>
        <div style={{ fontSize: 11, color: "#718096" }}>1-2 minute impromptu speech</div>
      </div>

      {!showFeedback ? (
        <div style={{
          background: "rgba(0,0,0,0.85)",
          borderRadius: 20,
          padding: "32px",
          maxWidth: 500,
          width: "90%",
          textAlign: "center",
          color: "white",
          pointerEvents: "auto",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ fontSize: 12, color: "#f5a623", marginBottom: 12, fontWeight: 600 }}>
            YOUR TOPIC
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 600,
            lineHeight: 1.5,
            marginBottom: 20,
            color: "#fff",
            fontStyle: "italic",
          }}>
            "{tableTopicPrompt}"
          </div>

          {started && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 48,
                fontWeight: 800,
                color: getTimerColor(),
                fontFamily: "monospace",
              }}>
                {formatTime(timerSeconds)}
              </div>
              <div style={{
                width: "80%",
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
                  transition: "width 1s linear",
                }} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {!started ? (
              <>
                <button
                  onClick={handleNewPrompt}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "12px 24px",
                    borderRadius: 10,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  New Prompt
                </button>
                <button
                  onClick={handleStart}
                  style={{
                    background: "linear-gradient(135deg, #48bb78, #38a169)",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Start Speaking
                </button>
              </>
            ) : (
              <button
                onClick={handleFinish}
                style={{
                  background: "linear-gradient(135deg, #e94560, #c62a71)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Finish Speaking
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          background: "rgba(0,0,0,0.85)",
          borderRadius: 20,
          padding: "32px",
          maxWidth: 400,
          width: "90%",
          textAlign: "center",
          color: "white",
          pointerEvents: "auto",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👏</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Great Job!
          </div>
          <div style={{ fontSize: 16, color: "#a0aec0", marginBottom: 8 }}>
            You spoke for {formatTime(timerSeconds)}
          </div>
          <div style={{ fontSize: 14, color: "#718096", marginBottom: 20 }}>
            {timerSeconds < 60
              ? "Try to elaborate more next time - aim for at least 1 minute!"
              : timerSeconds <= 120
              ? "Perfect timing! You stayed within the ideal range."
              : "Great effort! Try to be a bit more concise next time."}
          </div>
          <button
            onClick={handleComplete}
            style={{
              background: "linear-gradient(135deg, #48bb78, #38a169)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Complete Session
          </button>
        </div>
      )}
    </div>
  );
}
