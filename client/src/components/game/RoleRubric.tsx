import { useMemo, useState } from "react";

export interface RubricMetric {
  label: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

export interface RoleRubricData {
  role: string;
  overallScore: number;
  metrics: RubricMetric[];
  feedback?: string;
  transcript?: string;
  improvementAreas?: string[];
  strengths?: string[];
}

type RoleType = "speaker" | "table_topics" | "timer" | "evaluator" | "grammarian" | "ah_counter";

const roleConfig: Record<RoleType, { title: string }> = {
  speaker: { title: "Speaker Evaluation" },
  table_topics: { title: "Table Topics Evaluation" },
  timer: { title: "Timer Evaluation" },
  evaluator: { title: "Evaluator Assessment" },
  grammarian: { title: "Grammarian Assessment" },
  ah_counter: { title: "Ah Counter Assessment" },
};

function getScoreColor(score: number, max: number): string {
  const ratio = score / max;
  if (ratio >= 0.8) return "#48bb78";
  if (ratio >= 0.6) return "#f5a623";
  if (ratio >= 0.4) return "#ed8936";
  return "#e53e3e";
}

function getOverallGrade(score: number): { label: string; color: string } {
  if (score >= 9) return { label: "Outstanding", color: "#48bb78" };
  if (score >= 7) return { label: "Great", color: "#68d391" };
  if (score >= 5) return { label: "Good", color: "#f5a623" };
  if (score >= 3) return { label: "Developing", color: "#ed8936" };
  return { label: "Needs Work", color: "#e53e3e" };
}

export default function RoleRubric({ data }: { data: RoleRubricData }) {
  const config = roleConfig[data.role as RoleType];
  const grade = useMemo(() => getOverallGrade(data.overallScore), [data.overallScore]);
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  if (!config) return null;

  const strengths = data.strengths?.length
    ? data.strengths
    : data.metrics.filter(m => m.score / m.maxScore >= 0.7).map(m => m.feedback || `${m.label}: ${m.score}/${m.maxScore}`);

  const improvementAreas = data.improvementAreas?.length
    ? data.improvementAreas
    : data.metrics.filter(m => m.score / m.maxScore < 0.7).map(m => m.feedback || `${m.label}: needs improvement`);

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      borderRadius: 16,
      padding: "24px",
      marginBottom: 20,
      border: "1px solid rgba(255,255,255,0.1)",
      textAlign: "left",
      width: "100%",
    }}>
      <div style={{
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 16,
        textAlign: "center",
        color: "#e2e8f0",
      }}>
        {config.title}
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        marginBottom: 20,
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          border: `3px solid ${grade.color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 800,
          color: grade.color,
        }}>
          {data.overallScore.toFixed(1)}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: grade.color }}>
            {grade.label}
          </div>
          <div style={{ fontSize: 12, color: "#a0aec0" }}>
            Overall Score (out of 10)
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
        {data.metrics.map((metric, i) => {
          const barColor = getScoreColor(metric.score, metric.maxScore);
          const pct = Math.min((metric.score / metric.maxScore) * 100, 100);
          return (
            <div key={i}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                marginBottom: 4,
              }}>
                <span style={{ color: "#cbd5e0" }}>{metric.label}</span>
                <span style={{ fontWeight: 600, color: barColor }}>
                  {metric.score}/{metric.maxScore}
                </span>
              </div>
              <div style={{
                height: 8,
                borderRadius: 4,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 4,
                  background: barColor,
                  transition: "width 0.6s ease",
                }} />
              </div>
              {metric.feedback && (
                <div style={{
                  fontSize: 12,
                  color: "#8a94a6",
                  marginTop: 4,
                  lineHeight: 1.4,
                  paddingLeft: 4,
                }}>
                  {metric.feedback}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {strengths.length > 0 && (
        <div style={{
          background: "rgba(72, 187, 120, 0.08)",
          borderRadius: 10,
          padding: "14px",
          marginBottom: 12,
          border: "1px solid rgba(72, 187, 120, 0.2)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#48bb78", marginBottom: 8 }}>
            Strengths
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {strengths.map((s, i) => (
              <li key={i} style={{ fontSize: 12, color: "#a0aec0", lineHeight: 1.6, marginBottom: 2 }}>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {improvementAreas.length > 0 && (
        <div style={{
          background: "rgba(237, 137, 54, 0.08)",
          borderRadius: 10,
          padding: "14px",
          marginBottom: 12,
          border: "1px solid rgba(237, 137, 54, 0.2)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ed8936", marginBottom: 8 }}>
            Areas for Improvement
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {improvementAreas.map((a, i) => (
              <li key={i} style={{ fontSize: 12, color: "#a0aec0", lineHeight: 1.6, marginBottom: 2 }}>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.feedback && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 10,
          padding: "14px",
          marginBottom: data.transcript ? 12 : 0,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
            Detailed Feedback
          </div>
          <div style={{ fontSize: 13, color: "#a0aec0", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {data.feedback}
          </div>
        </div>
      )}

      {data.transcript && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 10,
          padding: "14px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
              Your Transcript
            </div>
            {data.transcript.length > 300 && (
              <button
                onClick={() => setShowFullTranscript(!showFullTranscript)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#63b3ed",
                  fontSize: 12,
                  cursor: "pointer",
                  padding: "2px 6px",
                }}
              >
                {showFullTranscript ? "Show less" : "Show full"}
              </button>
            )}
          </div>
          <div style={{
            fontSize: 12,
            color: "#718096",
            lineHeight: 1.6,
            maxHeight: showFullTranscript ? "none" : 150,
            overflow: showFullTranscript ? "visible" : "auto",
            whiteSpace: "pre-wrap",
          }}>
            {showFullTranscript || data.transcript.length <= 300
              ? data.transcript
              : data.transcript.slice(0, 300) + "..."}
          </div>
        </div>
      )}
    </div>
  );
}
