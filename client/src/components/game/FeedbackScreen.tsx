import { useEffect, useRef, useState } from "react";
import { useToastmasters } from "@/lib/stores/useToastmasters";
import RoleRubric, { type RoleRubricData } from "./RoleRubric";

declare global {
  interface Window {
    __lastSessionId?: number;
    __pendingRecordingBlob?: Blob;
    __pendingRecordingRole?: string;
    __pendingRecordingDuration?: number;
    __pendingRoleEvaluation?: { role: string; metrics: any };
  }
}

export default function FeedbackScreen() {
  const {
    selectedRole, speechFeedback, points, level,
    completedRoles, badges, goToMenu, goToRoleSelection, timerSeconds,
    tableTopicPrompt, selectedPathwayProject,
  } = useToastmasters();
  const savedRef = useRef(false);
  const [rubricData, setRubricData] = useState<RoleRubricData | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const latestCompletion = completedRoles[completedRoles.length - 1];

  useEffect(() => {
    if (savedRef.current || !latestCompletion) return;
    savedRef.current = true;

    const saveAndEvaluate = async () => {
      try {
        const sessionRes = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: selectedRole,
            score: latestCompletion.pointsEarned,
            durationSeconds: timerSeconds || 0,
            mode: "solo",
          }),
        });
        const session = await sessionRes.json();
        const sessionId = session?.id;
        if (sessionId) {
          window.__lastSessionId = sessionId;
        }

        if (window.__pendingRecordingBlob && sessionId) {
          const formData = new FormData();
          formData.append("audio", window.__pendingRecordingBlob, `${window.__pendingRecordingRole || selectedRole}-recording.webm`);
          formData.append("role", window.__pendingRecordingRole || selectedRole || "unknown");
          formData.append("durationSeconds", String(window.__pendingRecordingDuration || timerSeconds || 0));
          formData.append("sessionId", String(sessionId));
          await fetch("/api/recordings", { method: "POST", body: formData }).catch(() => {});
          window.__pendingRecordingBlob = undefined;
          window.__pendingRecordingRole = undefined;
          window.__pendingRecordingDuration = undefined;
        }

        fetch("/api/engagement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "session_complete",
            role: selectedRole,
            durationSeconds: timerSeconds || 0,
          }),
        }).catch(() => {});

        if ((selectedRole === "speaker" || selectedRole === "table_topics") && sessionId) {
          setAiLoading(true);
          try {
            const evalBody: any = {
              sessionId,
              role: selectedRole,
              durationSeconds: timerSeconds || 0,
            };
            if (selectedRole === "table_topics" && tableTopicPrompt) {
              evalBody.prompt = tableTopicPrompt;
            }
            if (selectedPathwayProject) {
              evalBody.pathwaysProject = {
                name: selectedPathwayProject.projectName,
                objectives: selectedPathwayProject.objectives,
                timeMin: selectedPathwayProject.minMinutes,
                timeMax: selectedPathwayProject.maxMinutes,
              };
            }
            const evalRes = await fetch("/api/evaluate-speech", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(evalBody),
            });
            if (evalRes.ok) {
              const evalData = await evalRes.json();
              const rubric = evalData.rubric as any;
              if (rubric?.metrics) {
                setRubricData({
                  role: selectedRole,
                  overallScore: (evalData.overallScore || 50) / 10,
                  metrics: rubric.metrics.map((m: any) => ({
                    label: m.label,
                    score: m.score,
                    maxScore: m.maxScore,
                  })),
                  feedback: evalData.aiFeedback || evalData.ai_feedback,
                  transcript: evalData.transcript,
                });
              }
            } else {
              setAiError("Could not analyze speech - recording may be too short");
            }
          } catch {
            setAiError("AI evaluation unavailable");
          }
          setAiLoading(false);
        } else if (selectedRole && sessionId && window.__pendingRoleEvaluation) {
          try {
            const pending = window.__pendingRoleEvaluation;
            window.__pendingRoleEvaluation = undefined;
            const evalRes = await fetch("/api/evaluate-role", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                role: pending.role,
                sessionId,
                metrics: pending.metrics,
              }),
            });
            if (evalRes.ok) {
              const evalData = await evalRes.json();
              const metrics = Array.isArray(evalData.metrics)
                ? evalData.metrics
                : [];
              if (metrics.length > 0) {
                setRubricData({
                  role: selectedRole,
                  overallScore: (evalData.overallScore || 50) / 10,
                  metrics: metrics.map((m: any) => ({
                    label: m.label,
                    score: m.score,
                    maxScore: m.maxScore,
                  })),
                  feedback: evalData.feedback,
                });
              }
            }
          } catch {}
        }
      } catch {}
    };

    saveAndEvaluate();
  }, [latestCompletion]);

  const newlyEarned = badges.filter(b => b.earned && b.earnedDate === latestCompletion?.completedAt);

  const roleNames: Record<string, string> = {
    speaker: "Speaker",
    table_topics: "Table Topics Speaker",
    timer: "Timer",
    evaluator: "Evaluator",
    grammarian: "Grammarian",
    ah_counter: "Ah Counter",
  };

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      color: "white",
      fontFamily: "'Inter', sans-serif",
      zIndex: 100,
      overflow: "auto",
      padding: "20px",
    }}>
      <div style={{
        maxWidth: 480,
        width: "100%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          Session Complete!
        </h2>
        <div style={{ fontSize: 16, color: "#a0aec0", marginBottom: 24 }}>
          {selectedRole ? roleNames[selectedRole] : "Role"} completed
        </div>

        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 16,
          padding: "20px",
          marginBottom: 20,
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#f5a623",
            marginBottom: 4,
          }}>
            +{latestCompletion?.pointsEarned || 0} pts
          </div>
          <div style={{ fontSize: 14, color: "#a0aec0" }}>
            Total: {points} points
          </div>
          <div style={{
            display: "inline-block",
            background: "rgba(245, 166, 35, 0.15)",
            border: "1px solid rgba(245, 166, 35, 0.3)",
            borderRadius: 20,
            padding: "4px 16px",
            marginTop: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "#f5a623",
          }}>
            {level}
          </div>
        </div>

        {aiLoading && (
          <div style={{
            background: "rgba(66, 153, 225, 0.1)",
            borderRadius: 16,
            padding: "20px",
            marginBottom: 20,
            border: "1px solid rgba(66, 153, 225, 0.3)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 14, color: "#63b3ed" }}>
              Analyzing your speech with AI...
            </div>
            <div style={{
              width: "60%",
              height: 4,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              margin: "12px auto 0",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: "60%",
                background: "#63b3ed",
                borderRadius: 2,
                animation: "slideRight 1.5s ease-in-out infinite",
              }} />
            </div>
          </div>
        )}

        {rubricData && <RoleRubric data={rubricData} />}

        {aiError && (
          <div style={{
            background: "rgba(245, 166, 35, 0.1)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 20,
            border: "1px solid rgba(245, 166, 35, 0.3)",
            fontSize: 13,
            color: "#fbd38d",
          }}>
            {aiError}
          </div>
        )}

        {speechFeedback && !rubricData && !aiLoading && (
          <div style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 16,
            padding: "20px",
            marginBottom: 20,
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "left",
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, textAlign: "center" }}>
              Speech Feedback
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 13, color: "#a0aec0" }}>Speech Length</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {Math.floor(speechFeedback.speechLength / 60)}m {speechFeedback.speechLength % 60}s
                </span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 13, color: "#a0aec0" }}>Pacing</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#48bb78" }}>
                  {speechFeedback.pacing}
                </span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 13, color: "#a0aec0" }}>Filler Words</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: speechFeedback.fillerWords > 3 ? "#f5a623" : "#48bb78" }}>
                  {speechFeedback.fillerWords} detected
                </span>
              </div>
            </div>
          </div>
        )}

        {newlyEarned.length > 0 && (
          <div style={{
            background: "rgba(245, 166, 35, 0.1)",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 20,
            border: "1px solid rgba(245, 166, 35, 0.3)",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#f5a623" }}>
              New Badges Earned!
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {newlyEarned.map(badge => (
                <div key={badge.id} style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 13,
                }}>
                  {badge.icon} {badge.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={goToRoleSelection}
            style={{
              background: "linear-gradient(135deg, #e94560, #c62a71)",
              color: "white",
              border: "none",
              padding: "14px 28px",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(233, 69, 96, 0.4)",
            }}
          >
            Practice Another Role
          </button>
          <button
            onClick={goToMenu}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "14px 28px",
              borderRadius: 12,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Main Menu
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideRight {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
