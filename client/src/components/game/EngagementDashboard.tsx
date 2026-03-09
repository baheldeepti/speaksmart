import { useEffect, useState } from "react";

interface EngagementStats {
  totalSessions: number;
  totalSpeakingTime: number;
  multiplayerGames: number;
  rolesCompleted: string[];
  practiceStreak: number;
  sessionsPerWeek: number;
  challengesCompleted: number;
}

const ALL_ROLES = ["speaker", "table_topics", "evaluator", "timer", "grammarian", "ah_counter"];

const roleLabels: Record<string, string> = {
  speaker: "Speaker",
  table_topics: "Table Topics",
  evaluator: "Evaluator",
  timer: "Timer",
  grammarian: "Grammarian",
  ah_counter: "Ah Counter",
};

function formatSpeakingTime(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getStreakLabel(streak: number): string {
  if (streak >= 30) return "On Fire!";
  if (streak >= 14) return "Impressive";
  if (streak >= 7) return "Great Streak";
  if (streak >= 3) return "Building Momentum";
  if (streak >= 1) return "Getting Started";
  return "Start Practicing!";
}

function getReturnRateLabel(sessionsPerWeek: number): string {
  if (sessionsPerWeek >= 5) return "Daily Practitioner";
  if (sessionsPerWeek >= 3) return "Dedicated";
  if (sessionsPerWeek >= 1) return "Regular";
  if (sessionsPerWeek > 0) return "Occasional";
  return "New Member";
}

export default function EngagementDashboard({ onBack }: { onBack: () => void }) {
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/engagement/stats")
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => {
        setStats({
          totalSessions: 0,
          totalSpeakingTime: 0,
          multiplayerGames: 0,
          rolesCompleted: [],
          practiceStreak: 0,
          sessionsPerWeek: 0,
          challengesCompleted: 0,
        });
        setLoading(false);
      });
  }, []);

  const cardStyle = (color: string): React.CSSProperties => ({
    background: `linear-gradient(135deg, ${color}15, ${color}08)`,
    border: `1px solid ${color}30`,
    borderRadius: 14,
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  });

  const iconStyle = (color: string): React.CSSProperties => ({
    width: 40,
    height: 40,
    borderRadius: 10,
    background: `${color}20`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    marginBottom: 4,
  });

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
          Engagement
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#718096", padding: 40 }}>Loading...</div>
        ) : !stats ? (
          <div style={{ textAlign: "center", color: "#718096", padding: 40 }}>
            Unable to load engagement data.
          </div>
        ) : (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}>
              <div style={cardStyle("#4299e1")}>
                <div style={iconStyle("#4299e1")}>
                  <span style={{ color: "#4299e1" }}>&#9654;</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#4299e1" }}>
                  {stats.totalSessions}
                </div>
                <div style={{ fontSize: 12, color: "#a0aec0", fontWeight: 600 }}>
                  Practice Sessions
                </div>
              </div>

              <div style={cardStyle("#48bb78")}>
                <div style={iconStyle("#48bb78")}>
                  <span style={{ color: "#48bb78" }}>&#9201;</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#48bb78" }}>
                  {formatSpeakingTime(stats.totalSpeakingTime)}
                </div>
                <div style={{ fontSize: 12, color: "#a0aec0", fontWeight: 600 }}>
                  Speaking Time
                </div>
              </div>

              <div style={cardStyle("#ed8936")}>
                <div style={iconStyle("#ed8936")}>
                  <span style={{ color: "#ed8936" }}>&#9734;</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#ed8936" }}>
                  {stats.practiceStreak}
                </div>
                <div style={{ fontSize: 12, color: "#a0aec0", fontWeight: 600 }}>
                  Day Streak
                </div>
                <div style={{ fontSize: 10, color: "#ed8936", marginTop: 2 }}>
                  {getStreakLabel(stats.practiceStreak)}
                </div>
              </div>

              <div style={cardStyle("#9f7aea")}>
                <div style={iconStyle("#9f7aea")}>
                  <span style={{ color: "#9f7aea" }}>&#8634;</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#9f7aea" }}>
                  {stats.sessionsPerWeek.toFixed(1)}
                </div>
                <div style={{ fontSize: 12, color: "#a0aec0", fontWeight: 600 }}>
                  Sessions / Week
                </div>
                <div style={{ fontSize: 10, color: "#9f7aea", marginTop: 2 }}>
                  {getReturnRateLabel(stats.sessionsPerWeek)}
                </div>
              </div>

              <div style={cardStyle("#e53e3e")}>
                <div style={iconStyle("#e53e3e")}>
                  <span style={{ color: "#e53e3e" }}>&#9733;</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#e53e3e" }}>
                  {stats.multiplayerGames}
                </div>
                <div style={{ fontSize: 12, color: "#a0aec0", fontWeight: 600 }}>
                  Multiplayer Games
                </div>
              </div>

              <div style={cardStyle("#38b2ac")}>
                <div style={iconStyle("#38b2ac")}>
                  <span style={{ color: "#38b2ac" }}>&#10003;</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#38b2ac" }}>
                  {stats.rolesCompleted.length}/{ALL_ROLES.length}
                </div>
                <div style={{ fontSize: 12, color: "#a0aec0", fontWeight: 600 }}>
                  Roles Practiced
                </div>
              </div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 14,
              padding: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                Role Completion
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ALL_ROLES.map(role => {
                  const completed = stats.rolesCompleted.includes(role);
                  return (
                    <div key={role} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}>
                      <div style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        background: completed ? "#48bb78" : "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: completed ? "white" : "#4a5568",
                        flexShrink: 0,
                      }}>
                        {completed ? "\u2713" : ""}
                      </div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: completed ? "#e2e8f0" : "#718096",
                      }}>
                        {roleLabels[role] || role}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
