import { useEffect, useRef, useState } from "react";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";
import { useToastmasters } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";
import GameScene from "./GameScene";

function MultiplayerHUD() {
  const { roomState, playerId, endMeeting, sendChat, chatMessages } = useMultiplayer();
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
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
          }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ fontSize: 11 }}>
                <span style={{ fontWeight: 600, color: "#4299e1" }}>{msg.playerName}:</span>{" "}
                <span style={{ color: "#e2e8f0" }}>{msg.message}</span>
              </div>
            ))}
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

function MultiplayerFeedback() {
  const { roomState, playerId, returnToLobby, leaveRoom } = useMultiplayer();
  if (!roomState || roomState.phase !== "feedback") return null;

  const isHost = playerId === roomState.hostId;

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
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Meeting Complete!</h2>
      <p style={{ fontSize: 14, color: "#a0aec0", marginBottom: 24 }}>
        Great practice session with {roomState.players.length} members
      </p>

      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: "20px",
        maxWidth: 400,
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
            <span style={{ color: "#f5a623" }}>{p.role}</span>
          </div>
        ))}
      </div>

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
    </div>
  );
}
