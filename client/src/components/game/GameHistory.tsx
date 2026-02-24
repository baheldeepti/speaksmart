import { useEffect, useState } from "react";

interface GameSessionData {
  id: number;
  role: string;
  score: number;
  durationSeconds: number;
  mode: string;
  completedAt: string;
}

interface RecordingData {
  id: number;
  role: string;
  durationSeconds: number;
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

export default function GameHistory({ onBack }: { onBack: () => void }) {
  const [sessions, setSessions] = useState<GameSessionData[]>([]);
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [tab, setTab] = useState<"sessions" | "recordings">("sessions");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/sessions").then(r => r.json()).then(setSessions).catch(() => {});
    fetch("/api/recordings").then(r => r.json()).then(setRecordings).catch(() => {});
  }, []);

  const playRecording = (id: number) => {
    if (audio) { audio.pause(); setAudio(null); }
    if (playingId === id) { setPlayingId(null); return; }
    const a = new Audio(`/api/recordings/${id}/audio`);
    a.onended = () => { setPlayingId(null); setAudio(null); };
    a.play();
    setAudio(a);
    setPlayingId(id);
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
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
          My History
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        {(["sessions", "recordings"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "12px", background: "none", border: "none",
            color: tab === t ? "#4299e1" : "#718096",
            borderBottom: tab === t ? "2px solid #4299e1" : "2px solid transparent",
            fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44,
          }}>
            {t === "sessions" ? `Games (${sessions.length})` : `Recordings (${recordings.length})`}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {tab === "sessions" ? (
          sessions.length === 0 ? (
            <div style={{ textAlign: "center", color: "#718096", padding: 40 }}>
              No games played yet. Start practicing to see your history here!
            </div>
          ) : (
            sessions.map(s => (
              <div key={s.id} style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 8,
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {roleLabels[s.role] || s.role}
                    </div>
                    <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>
                      {formatDate(s.completedAt)} · {s.mode}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#48bb78" }}>
                      +{s.score}
                    </div>
                    <div style={{ fontSize: 11, color: "#718096" }}>
                      {formatDuration(s.durationSeconds)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          recordings.length === 0 ? (
            <div style={{ textAlign: "center", color: "#718096", padding: 40 }}>
              No recordings yet. Use Speaker or Table Topics mode with recording enabled!
            </div>
          ) : (
            recordings.map(r => (
              <div key={r.id} style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {roleLabels[r.role] || r.role}
                  </div>
                  <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>
                    {formatDate(r.createdAt)} · {formatDuration(r.durationSeconds)}
                  </div>
                </div>
                <button onClick={() => playRecording(r.id)} style={{
                  background: playingId === r.id
                    ? "rgba(233, 69, 96, 0.2)"
                    : "linear-gradient(135deg, #4299e1, #3182ce)",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: 44,
                }}>
                  {playingId === r.id ? "Stop" : "Play"}
                </button>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
