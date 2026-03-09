import { useMemo } from "react";

export interface RubricMetric {
  label: string;
  score: number;
  maxScore: number;
}

export interface RoleRubricData {
  role: string;
  overallScore: number;
  metrics: RubricMetric[];
  feedback?: string;
  transcript?: string;
}

type RoleType = "speaker" | "table_topics" | "timer" | "evaluator" | "grammarian" | "ah_counter";

const roleConfig: Record<RoleType, { title: string; metricLabels: string[] }> = {
  speaker: {
    title: "Speaker Evaluation",
    metricLabels: ["Filler Words (Fluency)", "Speech Pace (Confidence)", "Story Structure (Clarity)", "Audience Engagement (Delivery)"],
  },
  table_topics: {
    title: "Table Topics Evaluation",
    metricLabels: ["Filler Words (Fluency)", "Speech Pace (Confidence)", "Story Structure (Clarity)", "Audience Engagement (Delivery)"],
  },
  timer: {
    title: "Timer Evaluation",
    metricLabels: ["Timing Accuracy", "Response Speed", "Signal Awareness", "Consistency"],
  },
  evaluator: {
    title: "Evaluator Assessment",
    metricLabels: ["Thoroughness", "Balance", "Detail Level", "Engagement"],
  },
  grammarian: {
    title: "Grammarian Assessment",
    metricLabels: ["Observation Count", "Variety", "Attentiveness", "Detail Quality"],
  },
  ah_counter: {
    title: "Ah Counter Assessment",
    metricLabels: ["Detection Count", "Category Coverage", "Tracking Consistency", "Attentiveness"],
  },
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

  if (!config) return null;

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

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
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
            </div>
          );
        })}
      </div>

      {data.feedback && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 10,
          padding: "14px",
          marginBottom: data.transcript ? 12 : 0,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
            AI Feedback
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
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
            Transcript Preview
          </div>
          <div style={{
            fontSize: 12,
            color: "#718096",
            lineHeight: 1.5,
            maxHeight: 120,
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}>
            {data.transcript.length > 500
              ? data.transcript.slice(0, 500) + "..."
              : data.transcript}
          </div>
        </div>
      )}
    </div>
  );
}
