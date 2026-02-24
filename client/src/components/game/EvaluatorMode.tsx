import { useEffect, useRef, useState } from "react";
import { useToastmasters } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";

export default function EvaluatorMode() {
  const {
    evaluationChecklist, toggleEvaluationItem,
    completeRole, goToMenu, setAudienceReaction,
  } = useToastmasters();
  const { playSuccess } = useAudio();
  const [phase, setPhase] = useState<"watching" | "evaluating" | "summary">("watching");
  const [watchProgress, setWatchProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === "watching") {
      setAudienceReaction("nodding");
      intervalRef.current = setInterval(() => {
        setWatchProgress(prev => {
          if (prev >= 100) {
            clearInterval(intervalRef.current!);
            setPhase("evaluating");
            return 100;
          }
          return prev + 2;
        });
      }, 300);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, setAudienceReaction]);

  const checkedCount = evaluationChecklist.filter(i => i.checked).length;
  const totalCount = evaluationChecklist.length;
  const score = Math.round((checkedCount / totalCount) * 100);

  const handleSubmit = () => {
    playSuccess();
    setPhase("summary");
  };

  const getGrade = () => {
    if (score >= 90) return { grade: "Excellent", color: "#48bb78" };
    if (score >= 70) return { grade: "Good", color: "#f5a623" };
    if (score >= 50) return { grade: "Needs Improvement", color: "#ed8936" };
    return { grade: "Keep Practicing", color: "#e94560" };
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
        <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>EVALUATOR MODE</div>
        <div style={{ fontSize: 11, color: "#718096" }}>Watch and evaluate the speaker</div>
      </div>

      {phase === "watching" && (
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎤</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Watching Virtual Speaker...
          </div>
          <div style={{ fontSize: 14, color: "#a0aec0", marginBottom: 16 }}>
            Pay attention to their delivery, structure, and style
          </div>
          <div style={{
            width: "100%",
            height: 8,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: 8,
          }}>
            <div style={{
              height: "100%",
              width: `${watchProgress}%`,
              background: "linear-gradient(90deg, #4299e1, #9f7aea)",
              borderRadius: 4,
              transition: "width 0.3s",
            }} />
          </div>
          <div style={{ fontSize: 12, color: "#718096" }}>{watchProgress}% complete</div>
          <button
            onClick={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setPhase("evaluating");
            }}
            style={{
              marginTop: 16,
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "8px 20px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Skip to Evaluation
          </button>
        </div>
      )}

      {phase === "evaluating" && (
        <div style={{
          background: "rgba(0,0,0,0.9)",
          borderRadius: 20,
          padding: "24px",
          maxWidth: 500,
          width: "90%",
          color: "white",
          pointerEvents: "auto",
          border: "1px solid rgba(255,255,255,0.1)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>
            Evaluation Checklist
          </div>
          <div style={{ fontSize: 13, color: "#a0aec0", marginBottom: 16, textAlign: "center" }}>
            Check all items that apply to the speaker's performance
          </div>

          {evaluationChecklist.map(item => (
            <label
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                marginBottom: 6,
                cursor: "pointer",
                background: item.checked ? "rgba(72, 187, 120, 0.15)" : "rgba(255,255,255,0.05)",
                border: item.checked ? "1px solid rgba(72, 187, 120, 0.3)" : "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.2s",
              }}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleEvaluationItem(item.id)}
                style={{ width: 18, height: 18, accentColor: "#48bb78" }}
              />
              <span style={{ fontSize: 14 }}>{item.label}</span>
            </label>
          ))}

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <div style={{ fontSize: 14, color: "#a0aec0", marginBottom: 8 }}>
              {checkedCount} of {totalCount} criteria met
            </div>
            <button
              onClick={handleSubmit}
              style={{
                background: "linear-gradient(135deg, #4299e1, #3182ce)",
                color: "white",
                border: "none",
                padding: "12px 32px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Submit Evaluation
            </button>
          </div>
        </div>
      )}

      {phase === "summary" && (
        <div style={{
          background: "rgba(0,0,0,0.9)",
          borderRadius: 20,
          padding: "32px",
          maxWidth: 450,
          width: "90%",
          textAlign: "center",
          color: "white",
          pointerEvents: "auto",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📝</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Evaluation Summary
          </div>
          <div style={{
            fontSize: 36,
            fontWeight: 800,
            color: getGrade().color,
            marginBottom: 4,
          }}>
            {score}%
          </div>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: getGrade().color,
            marginBottom: 16,
          }}>
            {getGrade().grade}
          </div>

          <div style={{ textAlign: "left", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#a0aec0" }}>
              Strengths:
            </div>
            {evaluationChecklist.filter(i => i.checked).map(item => (
              <div key={item.id} style={{ fontSize: 13, color: "#48bb78", marginBottom: 4 }}>
                ✓ {item.label}
              </div>
            ))}
            {evaluationChecklist.filter(i => !i.checked).length > 0 && (
              <>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12, marginBottom: 8, color: "#a0aec0" }}>
                  Areas to Improve:
                </div>
                {evaluationChecklist.filter(i => !i.checked).map(item => (
                  <div key={item.id} style={{ fontSize: 13, color: "#f5a623", marginBottom: 4 }}>
                    ○ {item.label}
                  </div>
                ))}
              </>
            )}
          </div>

          <button
            onClick={() => completeRole()}
            style={{
              background: "linear-gradient(135deg, #48bb78, #38a169)",
              color: "white",
              border: "none",
              padding: "12px 32px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Complete Evaluation
          </button>
        </div>
      )}
    </div>
  );
}
