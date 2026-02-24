import { useEffect, useState } from "react";
import { useAuth } from "@/lib/stores/useAuth";

interface ScoreEntry {
  username: string;
  totalScore: number;
  sessionsPlayed: number;
}

export default function Scoreboard({ onBack }: { onBack: () => void }) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch("/api/scoreboard")
      .then(r => r.json())
      .then(data => { setScores(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getLevel = (pts: number) => {
    if (pts >= 500) return { name: "Master Communicator", color: "#f5a623" };
    if (pts >= 200) return { name: "Confident Speaker", color: "#48bb78" };
    return { name: "Beginner", color: "#4299e1" };
  };

  const getMedal = (i: number) => {
    if (i === 0) return { emoji: "1st", color: "#f5a623" };
    if (i === 1) return { emoji: "2nd", color: "#a0aec0" };
    if (i === 2) return { emoji: "3rd", color: "#c97a3a" };
    return { emoji: `${i + 1}`, color: "#718096" };
  };

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
          Scoreboard
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#718096", padding: 40 }}>Loading...</div>
        ) : scores.length === 0 ? (
          <div style={{ textAlign: "center", color: "#718096", padding: 40 }}>
            No scores yet. Be the first to play and get on the board!
          </div>
        ) : (
          scores.map((entry, i) => {
            const medal = getMedal(i);
            const level = getLevel(entry.totalScore);
            const isMe = user?.username === entry.username;
            return (
              <div key={entry.username} style={{
                background: isMe ? "rgba(66, 153, 225, 0.12)" : "rgba(255,255,255,0.04)",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 8,
                border: isMe ? "1px solid rgba(66, 153, 225, 0.3)" : "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: "50%",
                  background: `rgba(255,255,255,0.1)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  color: medal.color,
                  flexShrink: 0,
                }}>
                  {medal.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {entry.username} {isMe && <span style={{ color: "#4299e1", fontSize: 11 }}>(you)</span>}
                  </div>
                  <div style={{ fontSize: 11, color: level.color, marginTop: 2 }}>
                    {level.name} · {entry.sessionsPlayed} sessions
                  </div>
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 800,
                  color: i < 3 ? medal.color : "#a0aec0",
                }}>
                  {entry.totalScore}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
