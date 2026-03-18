import { useEffect, useRef, useState } from "react";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";
import { useToastmasters } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";
import GameScene from "./GameScene";

function MultiplayerHUD() {
  const { roomState, playerId, endMeeting, sendChat, chatMessages, blockPlayer, reportPlayer, reportedPlayers } = useMultiplayer();
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ name: string; x: number; y: number } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, showChat]);

  if (!roomState) return null;
  const isHost = playerId === roomState.hostId;
  const myPlayer = roomState.players.find(p => p.id === playerId);

  const roleNames: Record<string, string> = {
    speaker: "Speaker", table_topics: "Table Topics", timer: "Timer",
    evaluator: "Evaluator", grammarian: "Grammarian", ah_counter: "Ah Counter",
  };

  return (
    <>
      <div style={{
        position: "absolute",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.8)",
        borderRadius: 12,
        padding: "8px 20px",
        color: "white",
        zIndex: 60,
        textAlign: "center",
        display: "flex",
        gap: 16,
        alignItems: "center",
        fontSize: 13,
      }}>
        <div>
          <span style={{ color: "#a0aec0" }}>Room:</span>{" "}
          <span style={{ fontWeight: 700 }}>{roomState.name}</span>
        </div>
        <div style={{ color: "#555" }}>|</div>
        <div>
          <span style={{ color: "#a0aec0" }}>Your Role:</span>{" "}
          <span style={{ fontWeight: 700, color: "#f5a623" }}>
            {myPlayer?.role ? roleNames[myPlayer.role] : "None"}
          </span>
        </div>
        <div style={{ color: "#555" }}>|</div>
        <div>
          <span style={{ color: "#a0aec0" }}>Players:</span>{" "}
          <span style={{ fontWeight: 700 }}>{roomState.players.length}</span>
        </div>
      </div>

      <div style={{
        position: "absolute",
        top: 12,
        right: 12,
        display: "flex",
        gap: 8,
        zIndex: 60,
      }}>
        <button
          onClick={() => setShowChat(!showChat)}
          style={{
            background: "rgba(0,0,0,0.7)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          💬 Chat
        </button>
        {isHost && (
          <button
            onClick={endMeeting}
            style={{
              background: "rgba(233, 69, 96, 0.3)",
              color: "#e94560",
              border: "1px solid rgba(233, 69, 96, 0.4)",
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            End Meeting
          </button>
        )}
      </div>

      <div style={{
        position: "absolute",
        bottom: 12,
        left: 12,
        zIndex: 60,
      }}>
        <div style={{
          background: "rgba(0,0,0,0.8)",
          borderRadius: 10,
          padding: "8px 12px",
          fontSize: 11,
          color: "#a0aec0",
        }}>
          {roomState.players.map(p => (
            <div key={p.id} style={{
              display: "flex",
              gap: 6,
              marginBottom: 2,
              color: p.id === playerId ? "#4299e1" : "#a0aec0",
            }}>
              <span style={{ fontWeight: 600, minWidth: 70 }}>
                {p.role ? roleNames[p.role] : "?"}:
              </span>
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {showChat && (
        <div style={{
          position: "absolute",
          right: 12,
          top: 52,
          width: 280,
          height: 300,
          background: "rgba(0,0,0,0.9)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          zIndex: 70,
        }}>
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            position: "relative",
          }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={(e) => setContextMenu({ name: msg.playerName, x: e.clientX, y: e.clientY })}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    fontWeight: 600, color: "#4299e1", fontSize: 11,
                    minHeight: 22, WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {msg.playerName}:
                </button>
                <span style={{ color: "#e2e8f0" }}>{msg.message}</span>
              </div>
            ))}
            {contextMenu && (
              <>
                <div onClick={() => setContextMenu(null)} style={{ position: "fixed", inset: 0, zIndex: 80 }} />
                <div style={{
                  position: "fixed",
                  left: Math.min(contextMenu.x, window.innerWidth - 160),
                  top: Math.min(contextMenu.y, window.innerHeight - 100),
                  background: "rgba(30,30,50,0.98)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  padding: 4,
                  zIndex: 90,
                  minWidth: 140,
                }}>
                  <div style={{ fontSize: 10, color: "#a0aec0", padding: "4px 8px" }}>{contextMenu.name}</div>
                  <button onClick={() => {
                    reportPlayer(contextMenu.name);
                    setContextMenu(null);
                  }} style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: "none", border: "none", color: "#f5a623",
                    padding: "8px 8px", fontSize: 12, cursor: "pointer",
                    borderRadius: 4, minHeight: 36, WebkitTapHighlightColor: "transparent",
                  }}>
                    {reportedPlayers.has(contextMenu.name) ? "Reported" : "Report Player"}
                  </button>
                  <button onClick={() => {
                    blockPlayer(contextMenu.name);
                    setContextMenu(null);
                  }} style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: "none", border: "none", color: "#e94560",
                    padding: "8px 8px", fontSize: 12, cursor: "pointer",
                    borderRadius: 4, minHeight: 36, WebkitTapHighlightColor: "transparent",
                  }}>
                    Block Player
                  </button>
                </div>
              </>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{
            padding: "6px 8px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            gap: 4,
          }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && chatInput.trim()) {
                  sendChat(chatInput.trim());
                  setChatInput("");
                }
              }}
              placeholder="Message..."
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                padding: "6px 8px",
                borderRadius: 6,
                fontSize: 11,
                outline: "none",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

function MultiplayerSpeakerView() {
  const { roomState, playerId, speakerStart, speakerFinish } = useMultiplayer();
  const { playSuccess } = useAudio();
  const [started, setStarted] = useState(false);

  if (!roomState) return null;
  const myPlayer = roomState.players.find(p => p.id === playerId);
  if (myPlayer?.role !== "speaker" && myPlayer?.role !== "table_topics") return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const ratio = roomState.timerMaxSeconds > 0 ? roomState.timerSeconds / roomState.timerMaxSeconds : 0;
  const timerColor = ratio < 0.5 ? "#48bb78" : ratio < 0.8 ? "#f5a623" : "#e94560";

  return (
    <div style={{
      position: "absolute",
      bottom: 80,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 60,
      textAlign: "center",
    }}>
      {roomState.timerRunning && (
        <div style={{
          fontSize: 48,
          fontWeight: 800,
          color: timerColor,
          fontFamily: "monospace",
          textShadow: `0 0 20px ${timerColor}44`,
          marginBottom: 12,
        }}>
          {formatTime(roomState.timerSeconds)}
        </div>
      )}

      {myPlayer?.role === "table_topics" && roomState.tableTopicPrompt && (
        <div style={{
          background: "rgba(0,0,0,0.85)",
          borderRadius: 14,
          padding: "16px 24px",
          marginBottom: 12,
          maxWidth: 400,
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ fontSize: 11, color: "#f5a623", fontWeight: 600, marginBottom: 4 }}>YOUR TOPIC</div>
          <div style={{ fontSize: 16, color: "white", fontStyle: "italic" }}>"{roomState.tableTopicPrompt}"</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {!started ? (
          <button
            onClick={() => { setStarted(true); speakerStart(); }}
            style={{
              background: "linear-gradient(135deg, #48bb78, #38a169)",
              color: "white", border: "none", padding: "12px 28px",
              borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}
          >
            Begin {myPlayer?.role === "table_topics" ? "Speaking" : "Speech"}
          </button>
        ) : (
          <button
            onClick={() => { speakerFinish(); playSuccess(); }}
            style={{
              background: "linear-gradient(135deg, #e94560, #c62a71)",
              color: "white", border: "none", padding: "12px 28px",
              borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}
          >
            Finish {myPlayer?.role === "table_topics" ? "Speaking" : "Speech"}
          </button>
        )}
      </div>
    </div>
  );
}

function MultiplayerTimerView() {
  const { roomState, playerId, timerStart, timerStop } = useMultiplayer();
  const { playHit } = useAudio();
  const [maxTime, setMaxTime] = useState(300);

  if (!roomState) return null;
  const myPlayer = roomState.players.find(p => p.id === playerId);
  if (myPlayer?.role !== "timer") return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const greenThreshold = Math.floor(maxTime * 0.5);
  const yellowThreshold = Math.floor(maxTime * 0.75);
  const activeLight = roomState.timerSeconds >= maxTime ? "red"
    : roomState.timerSeconds >= yellowThreshold ? "yellow"
    : roomState.timerSeconds >= greenThreshold ? "green" : "none";

  return (
    <div style={{
      position: "absolute",
      bottom: 80,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 60,
    }}>
      <div style={{
        background: "rgba(0,0,0,0.9)",
        borderRadius: 16,
        padding: "20px 28px",
        color: "white",
        textAlign: "center",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 12 }}>
          {[
            { c: "#48bb78", n: "green" }, { c: "#f5a623", n: "yellow" }, { c: "#e94560", n: "red" }
          ].map(l => (
            <div key={l.n} style={{
              width: 40, height: 40, borderRadius: "50%",
              background: activeLight === l.n || (l.n === "green" && (activeLight === "yellow" || activeLight === "red")) || (l.n === "yellow" && activeLight === "red") ? l.c : "#333",
              boxShadow: activeLight === l.n ? `0 0 20px ${l.c}` : "none",
              border: `2px solid ${activeLight === l.n ? l.c : "#555"}`,
            }} />
          ))}
        </div>

        <div style={{
          fontSize: 40, fontWeight: 800, fontFamily: "monospace",
          color: activeLight === "red" ? "#e94560" : activeLight === "yellow" ? "#f5a623" : activeLight === "green" ? "#48bb78" : "white",
          marginBottom: 12,
        }}>
          {formatTime(roomState.timerSeconds)}
        </div>

        {!roomState.timerRunning && roomState.timerSeconds === 0 && (
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 10, flexWrap: "wrap" }}>
            {[{ l: "1m", v: 60 }, { l: "2m", v: 120 }, { l: "5m", v: 300 }, { l: "7m", v: 420 }].map(p => (
              <button key={p.v} onClick={() => setMaxTime(p.v)} style={{
                background: maxTime === p.v ? "rgba(66,153,225,0.3)" : "rgba(255,255,255,0.05)",
                border: maxTime === p.v ? "1px solid #4299e1" : "1px solid rgba(255,255,255,0.1)",
                color: "white", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11,
              }}>
                {p.l}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {!roomState.timerRunning ? (
            <button onClick={() => timerStart(maxTime)} style={{
              background: "linear-gradient(135deg, #48bb78, #38a169)", color: "white", border: "none",
              padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              {roomState.timerSeconds > 0 ? "Resume" : "Start Timer"}
            </button>
          ) : (
            <button onClick={() => { timerStop(); playHit(); }} style={{
              background: "linear-gradient(135deg, #e94560, #c62a71)", color: "white", border: "none",
              padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MultiplayerEvaluatorView() {
  const { playerId, roomState, sendEvaluation } = useMultiplayer();
  const { playSuccess } = useAudio();
  const [checklist, setChecklist] = useState([
    { id: "opening", label: "Strong opening", checked: false },
    { id: "structure", label: "Clear structure", checked: false },
    { id: "eye_contact", label: "Good eye contact", checked: false },
    { id: "vocal_variety", label: "Vocal variety", checked: false },
    { id: "gestures", label: "Natural gestures", checked: false },
    { id: "fillers", label: "Minimal fillers", checked: false },
    { id: "message", label: "Clear message", checked: false },
    { id: "closing", label: "Strong closing", checked: false },
  ]);
  const [submitted, setSubmitted] = useState(false);

  if (!roomState) return null;
  const myPlayer = roomState.players.find(p => p.id === playerId);
  if (myPlayer?.role !== "evaluator") return null;

  const toggle = (id: string) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const score = Math.round((checklist.filter(c => c.checked).length / checklist.length) * 100);

  return (
    <div style={{
      position: "absolute",
      right: 12,
      top: 60,
      width: 260,
      zIndex: 60,
    }}>
      <div style={{
        background: "rgba(0,0,0,0.9)",
        borderRadius: 12,
        padding: "14px",
        color: "white",
        border: "1px solid rgba(255,255,255,0.1)",
        maxHeight: "70vh",
        overflowY: "auto",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#4299e1", marginBottom: 8 }}>Evaluation Checklist</div>
        {checklist.map(item => (
          <label key={item.id} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
            borderRadius: 6, marginBottom: 3, cursor: "pointer", fontSize: 12,
            background: item.checked ? "rgba(72,187,120,0.1)" : "transparent",
          }}>
            <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)}
              style={{ accentColor: "#48bb78" }} />
            {item.label}
          </label>
        ))}
        {!submitted ? (
          <button onClick={() => {
            sendEvaluation(checklist, score);
            playSuccess();
            setSubmitted(true);
          }} style={{
            width: "100%", marginTop: 8, background: "linear-gradient(135deg, #4299e1, #3182ce)",
            color: "white", border: "none", padding: "8px", borderRadius: 8,
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            Submit ({score}%)
          </button>
        ) : (
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "#48bb78" }}>
            ✓ Submitted!
          </div>
        )}
      </div>
    </div>
  );
}

function MultiplayerGrammarianView() {
  const { playerId, roomState, sendGrammarianNote } = useMultiplayer();
  const { playHit } = useAudio();
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState<string[]>([]);

  if (!roomState) return null;
  const myPlayer = roomState.players.find(p => p.id === playerId);
  if (myPlayer?.role !== "grammarian") return null;

  const addNote = () => {
    if (noteInput.trim()) {
      const note = noteInput.trim();
      setNotes(prev => [...prev, note]);
      sendGrammarianNote(note);
      setNoteInput("");
      playHit();
    }
  };

  return (
    <div style={{
      position: "absolute",
      left: 12,
      top: 60,
      width: 260,
      zIndex: 60,
    }}>
      <div style={{
        background: "rgba(0,0,0,0.9)",
        borderRadius: 12,
        padding: "14px",
        color: "white",
        border: "1px solid rgba(255,255,255,0.1)",
        maxHeight: "60vh",
        overflowY: "auto",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#9f7aea", marginBottom: 8 }}>
          Grammarian Notes
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          <input type="text" value={noteInput} onChange={e => setNoteInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addNote()}
            placeholder="Note grammar usage..."
            style={{
              flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
              color: "white", padding: "6px 8px", borderRadius: 6, fontSize: 11, outline: "none",
            }}
          />
          <button onClick={addNote} style={{
            background: "rgba(159,122,234,0.3)", border: "none", color: "white",
            padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11,
          }}>
            +
          </button>
        </div>
        {notes.map((n, i) => (
          <div key={i} style={{
            fontSize: 11, padding: "4px 8px", borderRadius: 4, marginBottom: 2,
            background: "rgba(159,122,234,0.1)", color: "#d6bcfa",
          }}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiplayerAhCounterView() {
  const { playerId, roomState, sendAhCounterUpdate } = useMultiplayer();
  const { playHit } = useAudio();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  if (!roomState) return null;
  const myPlayer = roomState.players.find(p => p.id === playerId);
  if (myPlayer?.role !== "ah_counter") return null;

  const fillers = ["Um", "Uh", "Ah", "Like", "You know", "So"];

  const handleCount = (word: string) => {
    const newCounts = { ...counts, [word]: (counts[word] || 0) + 1 };
    setCounts(newCounts);
    const newTotal = Object.values(newCounts).reduce((a, b) => a + b, 0);
    sendAhCounterUpdate(newTotal, word);
    playHit();
  };

  return (
    <div style={{
      position: "absolute",
      left: 12,
      top: 60,
      width: 220,
      zIndex: 60,
    }}>
      <div style={{
        background: "rgba(0,0,0,0.9)",
        borderRadius: 12,
        padding: "14px",
        color: "white",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#ed8936", marginBottom: 4 }}>Ah Counter</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: total > 10 ? "#e94560" : "#48bb78", marginBottom: 8, textAlign: "center" }}>
          {total}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {fillers.map(w => (
            <button key={w} onClick={() => handleCount(w)} style={{
              background: counts[w] ? "rgba(237,137,54,0.2)" : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)", color: "white",
              padding: "8px 4px", borderRadius: 6, cursor: "pointer", fontSize: 11,
              position: "relative",
            }}>
              {w}
              {counts[w] && (
                <span style={{
                  position: "absolute", top: 2, right: 2, background: "#ed8936",
                  borderRadius: "50%", width: 14, height: 14, fontSize: 9,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {counts[w]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AudienceRatingForm() {
  const { roomState, playerId, sendAudienceRating } = useMultiplayer();
  const { playSuccess } = useAudio();
  const [clarity, setClarity] = useState(0);
  const [storytelling, setStorytelling] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (!roomState || !roomState.ratingOpen) return null;
  const myPlayer = roomState.players.find(p => p.id === playerId);
  if (!myPlayer) return null;
  if (myPlayer.role === "speaker" || myPlayer.role === "table_topics") return null;

  if (submitted) {
    return (
      <div style={{
        position: "absolute",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 65,
        background: "rgba(0,0,0,0.9)",
        borderRadius: 16,
        padding: "16px 24px",
        color: "white",
        border: "1px solid rgba(72,187,120,0.3)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 13, color: "#48bb78", fontWeight: 600 }}>Rating Submitted!</div>
        {roomState.aggregatedRatings && (
          <div style={{ fontSize: 11, color: "#a0aec0", marginTop: 6 }}>
            {roomState.aggregatedRatings.totalRaters} rating{roomState.aggregatedRatings.totalRaters !== 1 ? "s" : ""} so far
          </div>
        )}
      </div>
    );
  }

  const StarRow = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 22,
              padding: "2px",
              filter: star <= value ? "none" : "grayscale(1) opacity(0.3)",
              transition: "transform 0.1s",
              transform: star <= value ? "scale(1.1)" : "scale(1)",
            }}
          >
            ⭐
          </button>
        ))}
      </div>
    </div>
  );

  const allRated = clarity > 0 && storytelling > 0 && confidence > 0;

  return (
    <div style={{
      position: "absolute",
      bottom: 80,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 65,
    }}>
      <div style={{
        background: "rgba(0,0,0,0.95)",
        borderRadius: 16,
        padding: "20px 24px",
        color: "white",
        border: "1px solid rgba(245,166,35,0.3)",
        minWidth: 240,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#f5a623", marginBottom: 4, textAlign: "center" }}>
          Rate the Speaker
        </div>
        <div style={{ fontSize: 10, color: "#a0aec0", marginBottom: 14, textAlign: "center" }}>
          Tap stars to rate
        </div>

        <StarRow label="Clarity" value={clarity} onChange={setClarity} />
        <StarRow label="Storytelling" value={storytelling} onChange={setStorytelling} />
        <StarRow label="Confidence" value={confidence} onChange={setConfidence} />

        <button
          onClick={() => {
            if (allRated) {
              sendAudienceRating(clarity, storytelling, confidence);
              playSuccess();
              setSubmitted(true);
            }
          }}
          disabled={!allRated}
          style={{
            width: "100%",
            marginTop: 4,
            background: allRated
              ? "linear-gradient(135deg, #f5a623, #e8961e)"
              : "rgba(255,255,255,0.05)",
            color: allRated ? "white" : "#555",
            border: "none",
            padding: "10px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: allRated ? "pointer" : "default",
          }}
        >
          Submit Rating
        </button>
      </div>
    </div>
  );
}

function MultiplayerObserverView() {
  const { roomState, playerId } = useMultiplayer();
  if (!roomState) return null;
  const myPlayer = roomState.players.find(p => p.id === playerId);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (roomState.timerRunning || roomState.timerSeconds > 0) {
    const ratio = roomState.timerMaxSeconds > 0 ? roomState.timerSeconds / roomState.timerMaxSeconds : 0;
    const timerColor = ratio < 0.5 ? "#48bb78" : ratio < 0.8 ? "#f5a623" : "#e94560";

    if (myPlayer?.role !== "timer") {
      return (
        <div style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 55,
          fontSize: 36,
          fontWeight: 800,
          fontFamily: "monospace",
          color: timerColor,
          textShadow: `0 0 20px ${timerColor}44`,
        }}>
          {formatTime(roomState.timerSeconds)}
        </div>
      );
    }
  }

  return null;
}

function MultiplayerEvaluationForm() {
  const { roomState, playerId, sendPeerEvaluation, receivedEvaluations } = useMultiplayer();
  const [evaluations, setEvaluations] = useState<Record<string, {
    commendations: string;
    suggestions: string;
    overallRating: number;
  }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const otherPlayers = roomState ? roomState.players.filter(p => p.id !== playerId) : [];

  useEffect(() => {
    if (!activeTab && otherPlayers.length > 0) {
      setActiveTab(otherPlayers[0].id);
    }
  }, [otherPlayers.length]);

  if (!roomState) return null;

  const myPlayer = roomState.players.find(p => p.id === playerId);
  const roleNames: Record<string, string> = {
    speaker: "Speaker", table_topics: "Table Topics", timer: "Timer",
    evaluator: "Evaluator", grammarian: "Grammarian", ah_counter: "Ah Counter",
  };

  const rolePrompts: Record<string, { commendationHint: string; suggestionHint: string }> = {
    speaker: {
      commendationHint: "What did the speaker do well? (e.g., strong opening, clear message, good eye contact, vocal variety...)",
      suggestionHint: "What could they try next time? (e.g., use more pauses, stronger conclusion, add a personal story...)",
    },
    table_topics: {
      commendationHint: "What stood out in their impromptu response? (e.g., quick thinking, stayed on topic, creative angle...)",
      suggestionHint: "How could they improve? (e.g., clearer structure, stronger close, use the full time...)",
    },
    timer: {
      commendationHint: "How well did they manage time signals? (e.g., timely signals, clear indicators, consistent tracking...)",
      suggestionHint: "Any timing improvements? (e.g., faster start, clearer signals, smoother transitions...)",
    },
    evaluator: {
      commendationHint: "What was strong about their evaluation? (e.g., specific examples, balanced feedback, encouraging tone...)",
      suggestionHint: "How could their evaluations improve? (e.g., more specifics, better sandwich method, actionable suggestions...)",
    },
    grammarian: {
      commendationHint: "How well did they track language? (e.g., good word of the day usage, caught key phrases, thorough notes...)",
      suggestionHint: "Any areas to grow? (e.g., more variety in observations, quote exact phrases, note positive language too...)",
    },
    ah_counter: {
      commendationHint: "How attentive were they? (e.g., caught many fillers, tracked different types, consistent attention...)",
      suggestionHint: "How could they improve? (e.g., track more filler types, note context of fillers, stay attentive throughout...)",
    },
  };

  const updateEval = (pId: string, field: string, value: string | number) => {
    setEvaluations(prev => ({
      ...prev,
      [pId]: { ...prev[pId] || { commendations: "", suggestions: "", overallRating: 0 }, [field]: value },
    }));
  };

  const filledCount = Object.values(evaluations).filter(e => e.commendations.trim() && e.overallRating > 0).length;

  if (submitted) {
    return (
      <div style={{
        background: "rgba(72,187,120,0.1)",
        borderRadius: 16,
        padding: "16px 20px",
        border: "1px solid rgba(72,187,120,0.3)",
        textAlign: "center",
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 20, marginBottom: 6 }}>&#10003;</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#48bb78" }}>Evaluations Submitted!</div>
        <div style={{ fontSize: 11, color: "#a0aec0", marginTop: 4 }}>
          You evaluated {filledCount} member{filledCount !== 1 ? "s" : ""}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      borderRadius: 16,
      padding: "20px",
      maxWidth: 520,
      width: "90%",
      marginBottom: 20,
      border: "1px solid rgba(66,153,225,0.3)",
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#4299e1", marginBottom: 4 }}>
        Toastmasters Evaluation
      </div>
      <div style={{ fontSize: 11, color: "#a0aec0", marginBottom: 14 }}>
        Give each member feedback using the Toastmasters method: what they did well, and one thing to try next time
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
        {otherPlayers.map(p => {
          const hasEval = evaluations[p.id]?.commendations?.trim();
          return (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              style={{
                background: activeTab === p.id ? "rgba(66,153,225,0.3)" : hasEval ? "rgba(72,187,120,0.15)" : "rgba(255,255,255,0.05)",
                border: activeTab === p.id ? "1px solid #4299e1" : hasEval ? "1px solid rgba(72,187,120,0.3)" : "1px solid rgba(255,255,255,0.1)",
                color: "white",
                padding: "6px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: activeTab === p.id ? 700 : 400,
              }}
            >
              {p.name}
              <span style={{ fontSize: 9, color: "#a0aec0", marginLeft: 4 }}>
                {p.role ? roleNames[p.role] : ""}
              </span>
              {hasEval && <span style={{ marginLeft: 4, color: "#48bb78" }}>&#10003;</span>}
            </button>
          );
        })}
      </div>

      {activeTab && (() => {
        const p = otherPlayers.find(pl => pl.id === activeTab);
        if (!p) return null;
        const ev = evaluations[p.id] || { commendations: "", suggestions: "", overallRating: 0 };
        const prompts = rolePrompts[p.role || "speaker"] || rolePrompts.speaker;

        return (
          <div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
              padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#f5a623" }}>{p.role ? roleNames[p.role] : "Unknown"}</div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#48bb78", marginBottom: 4 }}>
                What did they do well? (Commendations)
              </div>
              <textarea
                value={ev.commendations}
                onChange={e => updateEval(p.id, "commendations", e.target.value)}
                placeholder={prompts.commendationHint}
                rows={3}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "white", padding: "8px 10px", borderRadius: 8, fontSize: 12, outline: "none",
                  resize: "vertical", fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#f5a623", marginBottom: 4 }}>
                One thing to try next time (Suggestion)
              </div>
              <textarea
                value={ev.suggestions}
                onChange={e => updateEval(p.id, "suggestions", e.target.value)}
                placeholder={prompts.suggestionHint}
                rows={2}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "white", padding: "8px 10px", borderRadius: 8, fontSize: 12, outline: "none",
                  resize: "vertical", fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#a0aec0", marginBottom: 6 }}>
                Overall Rating
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => updateEval(p.id, "overallRating", star)}
                    style={{
                      background: "none", border: "none", cursor: "pointer", fontSize: 24, padding: "2px",
                      filter: star <= ev.overallRating ? "none" : "grayscale(1) opacity(0.3)",
                      transform: star <= ev.overallRating ? "scale(1.1)" : "scale(1)",
                      transition: "transform 0.1s",
                    }}
                  >
                    &#11088;
                  </button>
                ))}
                {ev.overallRating > 0 && (
                  <span style={{ fontSize: 11, color: "#a0aec0", marginLeft: 4 }}>
                    {["", "Needs Work", "Developing", "Competent", "Advanced", "Distinguished"][ev.overallRating]}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <span style={{ fontSize: 11, color: "#a0aec0" }}>
          {filledCount}/{otherPlayers.length} evaluated
        </span>
        <button
          onClick={() => {
            Object.entries(evaluations).forEach(([pId, ev]) => {
              if (ev.commendations.trim() && ev.overallRating > 0) {
                sendPeerEvaluation(pId, ev.commendations, ev.suggestions, ev.overallRating);
              }
            });
            setSubmitted(true);
          }}
          disabled={filledCount === 0}
          style={{
            background: filledCount > 0 ? "linear-gradient(135deg, #4299e1, #3182ce)" : "rgba(255,255,255,0.05)",
            color: filledCount > 0 ? "white" : "#555",
            border: "none", padding: "10px 24px", borderRadius: 10,
            fontSize: 13, fontWeight: 700, cursor: filledCount > 0 ? "pointer" : "default",
          }}
        >
          Submit Evaluations
        </button>
      </div>

      {receivedEvaluations.length > 0 && (
        <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#48bb78", marginBottom: 10 }}>
            Feedback You Received ({receivedEvaluations.length})
          </div>
          {receivedEvaluations.map((ev, i) => (
            <div key={i} style={{
              background: "rgba(72,187,120,0.08)", borderRadius: 10, padding: "12px",
              marginBottom: 8, border: "1px solid rgba(72,187,120,0.15)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>
                  {ev.fromName} <span style={{ color: "#a0aec0", fontWeight: 400 }}>({ev.fromRole})</span>
                </span>
                <span style={{ fontSize: 12 }}>
                  {Array.from({ length: 5 }, (_, s) => (
                    <span key={s} style={{ filter: s < ev.overallRating ? "none" : "grayscale(1) opacity(0.3)" }}>&#11088;</span>
                  ))}
                </span>
              </div>
              {ev.commendations && (
                <div style={{ fontSize: 12, color: "#c6f6d5", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: "#48bb78" }}>Well done: </span>{ev.commendations}
                </div>
              )}
              {ev.suggestions && (
                <div style={{ fontSize: 12, color: "#fefcbf" }}>
                  <span style={{ fontWeight: 600, color: "#f5a623" }}>Try next: </span>{ev.suggestions}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MultiplayerFeedback() {
  const { roomState, playerId, returnToLobby, leaveRoom } = useMultiplayer();
  if (!roomState || roomState.phase !== "feedback") return null;

  const isHost = playerId === roomState.hostId;

  const roleNames: Record<string, string> = {
    speaker: "Speaker", table_topics: "Table Topics", timer: "Timer",
    evaluator: "Evaluator", grammarian: "Grammarian", ah_counter: "Ah Counter",
  };

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      color: "white",
      fontFamily: "'Inter', sans-serif",
      zIndex: 100,
      overflow: "auto",
      padding: "30px 20px",
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>&#127881;</div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Meeting Complete!</h2>
      <p style={{ fontSize: 14, color: "#a0aec0", marginBottom: 24 }}>
        Great practice session with {roomState.players.length} members
      </p>

      <MultiplayerEvaluationForm />

      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: "20px",
        maxWidth: 520,
        width: "90%",
        marginBottom: 20,
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#a0aec0" }}>Participants</div>
        {roomState.players.map(p => (
          <div key={p.id} style={{
            display: "flex", justifyContent: "space-between", padding: "6px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 14,
          }}>
            <span>{p.name}</span>
            <span style={{ color: "#f5a623" }}>{p.role ? roleNames[p.role] : p.role}</span>
          </div>
        ))}
      </div>

      {roomState.aggregatedRatings && roomState.aggregatedRatings.totalRaters > 0 && (
        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 16,
          padding: "20px",
          maxWidth: 520,
          width: "90%",
          marginBottom: 20,
          border: "1px solid rgba(245,166,35,0.2)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#f5a623" }}>
            Audience Ratings ({roomState.aggregatedRatings.totalRaters} rater{roomState.aggregatedRatings.totalRaters !== 1 ? "s" : ""})
          </div>
          {[
            { label: "Clarity", value: roomState.aggregatedRatings.clarity },
            { label: "Storytelling", value: roomState.aggregatedRatings.storytelling },
            { label: "Confidence", value: roomState.aggregatedRatings.confidence },
          ].map(metric => (
            <div key={metric.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{ fontSize: 13, color: "#e2e8f0" }}>{metric.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 100, height: 6, background: "rgba(255,255,255,0.1)",
                  borderRadius: 3, overflow: "hidden",
                }}>
                  <div style={{
                    width: `${(metric.value / 5) * 100}%`,
                    height: "100%",
                    background: metric.value >= 4 ? "#48bb78" : metric.value >= 3 ? "#f5a623" : "#e94560",
                    borderRadius: 3,
                  }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "white", minWidth: 30, textAlign: "right" }}>
                  {metric.value.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
          <div style={{
            marginTop: 10, textAlign: "center", fontSize: 20, fontWeight: 800, color: "#f5a623",
          }}>
            {((roomState.aggregatedRatings.clarity + roomState.aggregatedRatings.storytelling + roomState.aggregatedRatings.confidence) / 3).toFixed(1)} / 5.0
          </div>
          <div style={{ textAlign: "center", fontSize: 10, color: "#a0aec0", marginTop: 2 }}>
            Overall Average
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        {isHost && (
          <button onClick={returnToLobby} style={{
            background: "linear-gradient(135deg, #e94560, #c62a71)", color: "white", border: "none",
            padding: "12px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            Play Again
          </button>
        )}
        <button onClick={leaveRoom} style={{
          background: "rgba(255,255,255,0.1)", color: "white",
          border: "1px solid rgba(255,255,255,0.2)",
          padding: "12px 28px", borderRadius: 10, fontSize: 15, cursor: "pointer",
        }}>
          Leave
        </button>
      </div>
    </div>
  );
}

export default function MultiplayerGame() {
  const { roomState, playerId } = useMultiplayer();
  const { setAudienceReaction } = useToastmasters();

  useEffect(() => {
    if (roomState?.audienceReaction) {
      setAudienceReaction(roomState.audienceReaction as any);
    }
  }, [roomState?.audienceReaction, setAudienceReaction]);

  if (!roomState) return null;

  if (roomState.phase === "feedback") {
    return <MultiplayerFeedback />;
  }

  if (roomState.phase !== "playing") return null;

  const myPlayer = roomState.players.find(p => p.id === playerId);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      <GameScene />
      <MultiplayerHUD />
      <MultiplayerObserverView />
      {(myPlayer?.role === "speaker" || myPlayer?.role === "table_topics") && <MultiplayerSpeakerView />}
      {myPlayer?.role === "timer" && <MultiplayerTimerView />}
      {myPlayer?.role === "evaluator" && <MultiplayerEvaluatorView />}
      {myPlayer?.role === "grammarian" && <MultiplayerGrammarianView />}
      {myPlayer?.role === "ah_counter" && <MultiplayerAhCounterView />}
      <AudienceRatingForm />
    </div>
  );
}
