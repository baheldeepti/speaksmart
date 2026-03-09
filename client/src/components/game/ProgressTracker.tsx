import { useEffect, useState, useMemo } from "react";

interface SessionData {
  id: number;
  role: string;
  score: number;
  durationSeconds: number;
  mode: string;
  completedAt: string;
}

interface RoleEvaluationData {
  id: number;
  role: string;
  overallScore: number;
  createdAt: string;
}

interface SpeechEvaluationData {
  id: number;
  overallScore: number;
  clarityScore: number;
  structureScore: number;
  confidenceScore: number;
  engagementScore: number;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  speaker: "Speaker",
  table_topics: "Table Topics",
  evaluator: "Evaluator",
  timer: "Timer",
  grammarian: "Grammarian",
  ah_counter: "Ah Counter",
};

const roleColors: Record<string, string> = {
  speaker: "#4299e1",
  table_topics: "#9f7aea",
  evaluator: "#48bb78",
  timer: "#ed8936",
  grammarian: "#f56565",
  ah_counter: "#38b2ac",
};

export default function ProgressTracker({ onBack }: { onBack: () => void }) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [roleEvals, setRoleEvals] = useState<RoleEvaluationData[]>([]);
  const [speechEvals, setSpeechEvals] = useState<SpeechEvaluationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/sessions").then(r => r.json()).catch(() => []),
      fetch("/api/progress").then(r => r.json()).catch(() => ({ roleEvaluations: [], speechEvaluations: [] })),
    ]).then(([sessionsData, progressData]) => {
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setRoleEvals(Array.isArray(progressData.roleEvaluations) ? progressData.roleEvaluations : []);
      setSpeechEvals(Array.isArray(progressData.speechEvaluations) ? progressData.speechEvaluations : []);
      setLoading(false);
    });
  }, []);

  const roleStats = useMemo(() => {
    const stats: Record<string, { sessions: number; scores: number[]; totalDuration: number; firstDate: string; lastDate: string }> = {};

    for (const s of sessions) {
      if (!stats[s.role]) {
        stats[s.role] = { sessions: 0, scores: [], totalDuration: 0, firstDate: s.completedAt, lastDate: s.completedAt };
      }
      stats[s.role].sessions++;
      stats[s.role].scores.push(s.score);
      stats[s.role].totalDuration += s.durationSeconds;
      if (new Date(s.completedAt) < new Date(stats[s.role].firstDate)) stats[s.role].firstDate = s.completedAt;
      if (new Date(s.completedAt) > new Date(stats[s.role].lastDate)) stats[s.role].lastDate = s.completedAt;
    }

    return stats;
  }, [sessions]);

  const improvementSummary = useMemo(() => {
    if (sessions.length < 2) return null;

    const sorted = [...sessions].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const avgFirst = firstHalf.reduce((sum, s) => sum + s.score, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, s) => sum + s.score, 0) / secondHalf.length;

    if (avgFirst === 0) return null;
    const pctChange = Math.round(((avgSecond - avgFirst) / avgFirst) * 100);
    return pctChange;
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    if (selectedRole) return sorted.filter(s => s.role === selectedRole);
    return sorted;
  }, [sessions, selectedRole]);

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#48bb78";
    if (score >= 50) return "#ed8936";
    return "#f56565";
  };

  const allRoles = Object.keys(roleLabels);
  const practicedRoles = allRoles.filter(r => roleStats[r]);

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
          My Progress
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#718096", padding: 40 }}>Loading...</div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: "center", color: "#718096", padding: 40 }}>
            No sessions yet. Start practicing to track your progress!
          </div>
        ) : (
          <>
            {improvementSummary !== null && (
              <div style={{
                background: improvementSummary >= 0
                  ? "rgba(72, 187, 120, 0.15)"
                  : "rgba(245, 101, 101, 0.15)",
                border: `1px solid ${improvementSummary >= 0 ? "rgba(72, 187, 120, 0.3)" : "rgba(245, 101, 101, 0.3)"}`,
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 16,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 14, color: "#a0aec0", marginBottom: 4 }}>
                  Overall Trend
                </div>
                <div style={{
                  fontSize: 24, fontWeight: 800,
                  color: improvementSummary >= 0 ? "#48bb78" : "#f56565",
                }}>
                  {improvementSummary >= 0 ? "+" : ""}{improvementSummary}%
                </div>
                <div style={{ fontSize: 13, color: "#a0aec0", marginTop: 4 }}>
                  {improvementSummary >= 0
                    ? "You improved since your first sessions!"
                    : "Keep practicing — consistency is key!"}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#a0aec0", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                Per-Role Progress
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {allRoles.map(role => {
                  const stats = roleStats[role];
                  const color = roleColors[role] || "#4299e1";
                  const avgScore = stats
                    ? Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length)
                    : 0;
                  const trend = stats && stats.scores.length >= 2
                    ? stats.scores[stats.scores.length - 1] - stats.scores[0]
                    : null;

                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                      style={{
                        background: selectedRole === role
                          ? `rgba(${color === "#4299e1" ? "66,153,225" : color === "#9f7aea" ? "159,122,234" : color === "#48bb78" ? "72,187,120" : color === "#ed8936" ? "237,137,54" : color === "#f56565" ? "245,101,101" : "56,178,172"},0.2)`
                          : "rgba(255,255,255,0.04)",
                        border: selectedRole === role
                          ? `1px solid ${color}40`
                          : "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 10,
                        padding: "12px",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "white",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color }}>
                          {roleLabels[role]}
                        </div>
                        {trend !== null && (
                          <div style={{ fontSize: 11, color: trend >= 0 ? "#48bb78" : "#f56565" }}>
                            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}
                          </div>
                        )}
                      </div>
                      {stats ? (
                        <>
                          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>
                            {avgScore}
                          </div>
                          <div style={{ fontSize: 11, color: "#718096" }}>
                            avg score · {stats.sessions} {stats.sessions === 1 ? "session" : "sessions"}
                          </div>
                          <div style={{
                            height: 3,
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: 2,
                            marginTop: 8,
                            overflow: "hidden",
                          }}>
                            <div style={{
                              height: "100%",
                              width: `${Math.min(avgScore, 100)}%`,
                              background: color,
                              borderRadius: 2,
                            }} />
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 12, color: "#4a5568", marginTop: 4 }}>
                          Not practiced yet
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 10,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: 1 }}>
                  Session History
                </div>
                {selectedRole && (
                  <button onClick={() => setSelectedRole(null)} style={{
                    background: "none", border: "none", color: "#4299e1",
                    fontSize: 12, cursor: "pointer",
                  }}>
                    Show All
                  </button>
                )}
              </div>

              <div style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  padding: "10px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#718096",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}>
                  <div>Role</div>
                  <div>Score</div>
                  <div>Duration</div>
                  <div>Date</div>
                </div>

                {filteredSessions.length === 0 ? (
                  <div style={{ padding: "20px 14px", textAlign: "center", color: "#4a5568", fontSize: 13 }}>
                    No sessions for this role yet
                  </div>
                ) : (
                  filteredSessions.slice(0, 50).map((s, i) => (
                    <div key={s.id} style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr",
                      padding: "10px 14px",
                      borderBottom: i < filteredSessions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      fontSize: 13,
                      alignItems: "center",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: roleColors[s.role] || "#4299e1",
                          flexShrink: 0,
                        }} />
                        <span style={{ fontWeight: 500 }}>{roleLabels[s.role] || s.role}</span>
                      </div>
                      <div style={{ fontWeight: 700, color: getScoreColor(s.score) }}>
                        {s.score}
                      </div>
                      <div style={{ color: "#a0aec0" }}>
                        {formatDuration(s.durationSeconds)}
                      </div>
                      <div style={{ color: "#718096", fontSize: 11 }}>
                        {formatDate(s.completedAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "14px 16px",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a0aec0", marginBottom: 8 }}>
                Summary
              </div>
              <div style={{ fontSize: 13, color: "#cbd5e0", lineHeight: 1.6 }}>
                You've completed <strong style={{ color: "white" }}>{sessions.length}</strong> {sessions.length === 1 ? "session" : "sessions"} across{" "}
                <strong style={{ color: "white" }}>{practicedRoles.length}</strong> of {allRoles.length} roles.
                {practicedRoles.length < allRoles.length && (
                  <> Try <strong style={{ color: roleColors[allRoles.find(r => !roleStats[r]) || ""] || "#4299e1" }}>
                    {roleLabels[allRoles.find(r => !roleStats[r]) || ""] || "a new role"}
                  </strong> next!</>
                )}
                {practicedRoles.length === allRoles.length && (
                  <> Great job — you've practiced every role!</>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
