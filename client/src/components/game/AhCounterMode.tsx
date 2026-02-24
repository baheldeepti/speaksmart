import { useState } from "react";
import { useToastmasters } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";

const FILLER_WORDS = ["Um", "Uh", "Ah", "Like", "You know", "So", "Actually", "Basically", "Right", "Well"];

export default function AhCounterMode() {
  const { ahCounterCount, incrementAhCounter, resetAhCounter, completeRole, goToMenu } = useToastmasters();
  const { playHit, playSuccess } = useAudio();
  const [fillerCounts, setFillerCounts] = useState<Record<string, number>>({});

  const handleCount = (word: string) => {
    incrementAhCounter();
    setFillerCounts(prev => ({
      ...prev,
      [word]: (prev[word] || 0) + 1,
    }));
    playHit();
  };

  const handleComplete = () => {
    playSuccess();
    completeRole();
  };

  const handleReset = () => {
    resetAhCounter();
    setFillerCounts({});
  };

  const totalCount = ahCounterCount;

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
        padding: "28px",
        maxWidth: 420,
        width: "90%",
        color: "white",
        pointerEvents: "auto",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 4, fontWeight: 600 }}>AH COUNTER</div>
          <div style={{ fontSize: 11, color: "#718096", marginBottom: 16 }}>Track filler words</div>

          <div style={{
            fontSize: 56,
            fontWeight: 800,
            color: totalCount > 10 ? "#e94560" : totalCount > 5 ? "#f5a623" : "#48bb78",
            marginBottom: 4,
          }}>
            {totalCount}
          </div>
          <div style={{ fontSize: 13, color: "#a0aec0" }}>total filler words detected</div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 8,
          marginBottom: 20,
        }}>
          {FILLER_WORDS.map(word => (
            <button
              key={word}
              onClick={() => handleCount(word)}
              style={{
                background: fillerCounts[word]
                  ? "rgba(237, 137, 54, 0.2)"
                  : "rgba(255,255,255,0.05)",
                border: fillerCounts[word]
                  ? "1px solid rgba(237, 137, 54, 0.4)"
                  : "1px solid rgba(255,255,255,0.15)",
                color: "white",
                padding: "12px 8px",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                textAlign: "center",
                transition: "all 0.15s",
                position: "relative",
              }}
            >
              {word}
              {fillerCounts[word] && (
                <span style={{
                  position: "absolute",
                  top: 4,
                  right: 6,
                  background: "#ed8936",
                  color: "white",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {fillerCounts[word]}
                </span>
              )}
            </button>
          ))}
        </div>

        {Object.keys(fillerCounts).length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 10,
            padding: "12px",
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 8 }}>Breakdown:</div>
            {Object.entries(fillerCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([word, count]) => (
                <div key={word} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  padding: "4px 0",
                  color: "#e2e8f0",
                }}>
                  <span>"{word}"</span>
                  <span style={{ fontWeight: 700, color: "#ed8936" }}>{count}x</span>
                </div>
              ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={handleReset}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "10px 20px",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Reset
          </button>
          <button
            onClick={handleComplete}
            style={{
              background: "linear-gradient(135deg, #ed8936, #dd6b20)",
              color: "white",
              border: "none",
              padding: "10px 24px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
