import { useEffect, useState, useRef } from "react";
import { useMultiplayer, type Role } from "@/lib/stores/useMultiplayer";

const ROLES: { role: Role; name: string; icon: string; color: string }[] = [
  { role: "speaker", name: "Speaker", icon: "🎤", color: "#e94560" },
  { role: "table_topics", name: "Table Topics", icon: "💡", color: "#f5a623" },
  { role: "timer", name: "Timer", icon: "⏱️", color: "#48bb78" },
  { role: "evaluator", name: "Evaluator", icon: "📝", color: "#4299e1" },
  { role: "grammarian", name: "Grammarian", icon: "📖", color: "#9f7aea" },
  { role: "ah_counter", name: "Ah Counter", icon: "🔍", color: "#ed8936" },
];

function JoinOrCreateView() {
  const {
    playerName, setPlayerName, createRoom, joinRoom, listRooms,
    availableRooms, setMultiplayerMode, error, connected, connect,
  } = useMultiplayer();
  const [view, setView] = useState<"choice" | "create" | "join">("choice");
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    if (!connected) {
      connect();
    }
  }, [connected, connect]);

  useEffect(() => {
    if (!connected) return;
    listRooms();
    const interval = setInterval(listRooms, 5000);
    return () => clearInterval(interval);
  }, [listRooms, connected]);

  const handleCreate = () => {
    if (playerName.trim()) {
      createRoom(roomName || "Toastmasters Meeting");
    }
  };

  const handleJoin = () => {
    if (playerName.trim() && roomCode.trim()) {
      joinRoom(roomCode.trim().toUpperCase());
    }
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
      padding: 20,
    }}>
      <button
        onClick={() => setMultiplayerMode(false)}
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white",
          padding: "8px 16px",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        ← Back
      </button>

      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Multiplayer Mode</h2>
      <p style={{ color: "#a0aec0", fontSize: 14, marginBottom: 24 }}>
        Practice with others in a live meeting
      </p>

      {error && (
        <div style={{
          background: "rgba(233, 69, 96, 0.2)",
          border: "1px solid rgba(233, 69, 96, 0.4)",
          borderRadius: 10,
          padding: "10px 16px",
          marginBottom: 16,
          fontSize: 13,
          color: "#e94560",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: "20px",
        maxWidth: 400,
        width: "100%",
        marginBottom: 16,
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <label style={{ fontSize: 12, color: "#a0aec0", fontWeight: 600 }}>Your Name</label>
        <input
          type="text"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 14,
            marginTop: 6,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {view === "choice" && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => setView("create")}
            disabled={!playerName.trim()}
            style={{
              background: playerName.trim() ? "linear-gradient(135deg, #e94560, #c62a71)" : "rgba(255,255,255,0.1)",
              color: playerName.trim() ? "white" : "#718096",
              border: "none",
              padding: "14px 32px",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: playerName.trim() ? "pointer" : "not-allowed",
            }}
          >
            Create Room
          </button>
          <button
            onClick={() => setView("join")}
            disabled={!playerName.trim()}
            style={{
              background: playerName.trim() ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
              color: playerName.trim() ? "white" : "#718096",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "14px 32px",
              borderRadius: 12,
              fontSize: 15,
              cursor: playerName.trim() ? "pointer" : "not-allowed",
            }}
          >
            Join Room
          </button>
        </div>
      )}

      {view === "create" && (
        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 16,
          padding: "20px",
          maxWidth: 400,
          width: "100%",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <label style={{ fontSize: 12, color: "#a0aec0", fontWeight: 600 }}>Room Name</label>
          <input
            type="text"
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            placeholder="Toastmasters Meeting"
            maxLength={30}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 14,
              marginTop: 6,
              marginBottom: 16,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setView("choice")}
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "10px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #e94560, #c62a71)",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Create & Wait for Players
            </button>
          </div>
        </div>
      )}

      {view === "join" && (
        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 16,
          padding: "20px",
          maxWidth: 400,
          width: "100%",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <label style={{ fontSize: 12, color: "#a0aec0", fontWeight: 600 }}>Room Code</label>
          <input
            type="text"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-letter code"
            maxLength={6}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 4,
              textAlign: "center",
              marginTop: 6,
              marginBottom: 16,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setView("choice")}
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "10px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={roomCode.length < 4}
              style={{
                flex: 1,
                background: roomCode.length >= 4 ? "linear-gradient(135deg, #4299e1, #3182ce)" : "rgba(255,255,255,0.1)",
                color: roomCode.length >= 4 ? "white" : "#718096",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: roomCode.length >= 4 ? "pointer" : "not-allowed",
              }}
            >
              Join Room
            </button>
          </div>

          {availableRooms.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, color: "#a0aec0", fontWeight: 600, marginBottom: 8 }}>Available Rooms:</div>
              {availableRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => {
                    setRoomCode(room.id);
                    joinRoom(room.id);
                  }}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "white",
                    cursor: "pointer",
                    textAlign: "left",
                    marginBottom: 6,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{room.name}</span>
                  <span style={{ fontSize: 12, color: "#a0aec0" }}>
                    {room.playerCount}/{room.minPlayers} players · {room.id}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WaitingLobby() {
  const {
    roomState, playerId, leaveRoom, startRoleAssignment,
    selectRole, setReady, startMeeting, error, sendChat, chatMessages,
  } = useMultiplayer();
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (!roomState) return null;

  const isHost = playerId === roomState.hostId;
  const myPlayer = roomState.players.find(p => p.id === playerId);
  const hasEnoughPlayers = roomState.players.length >= roomState.minPlayers;
  const allHaveRoles = roomState.players.every(p => p.role !== null);
  const allReady = roomState.players.every(p => p.ready);

  const handleSendChat = () => {
    if (chatInput.trim()) {
      sendChat(chatInput.trim());
      setChatInput("");
    }
  };

  const getRoleTakenBy = (role: Role) => {
    return roomState.players.find(p => p.role === role);
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
      overflow: "hidden",
    }}>
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{roomState.name}</h2>
          <div style={{ fontSize: 12, color: "#a0aec0" }}>
            Room Code: <span style={{ fontWeight: 700, color: "#f5a623", letterSpacing: 2 }}>{roomState.id}</span>
            {" · "}{roomState.players.length}/{roomState.minPlayers} players
          </div>
        </div>
        <button
          onClick={leaveRoom}
          style={{
            background: "rgba(233, 69, 96, 0.2)",
            border: "1px solid rgba(233, 69, 96, 0.4)",
            color: "#e94560",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Leave
        </button>
      </div>

      {error && (
        <div style={{
          background: "rgba(233, 69, 96, 0.2)",
          borderBottom: "1px solid rgba(233, 69, 96, 0.3)",
          padding: "8px 20px",
          fontSize: 13,
          color: "#e94560",
          textAlign: "center",
          flexShrink: 0,
        }}>
          {error}
        </div>
      )}

      <div style={{
        flex: 1,
        display: "flex",
        overflow: "hidden",
      }}>
        <div style={{
          flex: 1,
          padding: "16px 20px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#a0aec0", marginBottom: 8 }}>
              Players ({roomState.players.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {roomState.players.map(player => (
                <div key={player.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: player.id === playerId ? "rgba(66, 153, 225, 0.15)" : "rgba(255,255,255,0.05)",
                  border: player.id === playerId ? "1px solid rgba(66, 153, 225, 0.3)" : "1px solid rgba(255,255,255,0.1)",
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: player.id === roomState.hostId ? "#f5a623" : "#4a5568",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {player.name}
                      {player.id === roomState.hostId && <span style={{ fontSize: 10, color: "#f5a623", marginLeft: 6 }}>HOST</span>}
                      {player.id === playerId && <span style={{ fontSize: 10, color: "#4299e1", marginLeft: 6 }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "#718096" }}>
                      {player.role
                        ? `${ROLES.find(r => r.role === player.role)?.icon || ""} ${ROLES.find(r => r.role === player.role)?.name || player.role}`
                        : "No role selected"}
                      {player.ready && " ✓ Ready"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {(roomState.phase === "role_assignment" || roomState.phase === "lobby") && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#a0aec0", marginBottom: 8 }}>
                {roomState.phase === "lobby" ? "Waiting for players..." : "Select Your Role"}
              </div>

              {roomState.phase === "lobby" && !hasEnoughPlayers && (
                <div style={{
                  background: "rgba(245, 166, 35, 0.15)",
                  border: "1px solid rgba(245, 166, 35, 0.3)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  fontSize: 13,
                  color: "#f5a623",
                  marginBottom: 12,
                }}>
                  Need {roomState.minPlayers - roomState.players.length} more player{roomState.minPlayers - roomState.players.length !== 1 ? "s" : ""} to start.
                  Share the room code: <strong>{roomState.id}</strong>
                </div>
              )}

              {roomState.phase === "role_assignment" && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 8,
                  marginBottom: 12,
                }}>
                  {ROLES.map(({ role, name, icon, color }) => {
                    const takenBy = getRoleTakenBy(role);
                    const isMyRole = myPlayer?.role === role;
                    const isTaken = takenBy && takenBy.id !== playerId;

                    return (
                      <button
                        key={role}
                        onClick={() => !isTaken && selectRole(role)}
                        disabled={!!isTaken}
                        style={{
                          background: isMyRole
                            ? `linear-gradient(135deg, ${color}33, ${color}22)`
                            : isTaken
                            ? "rgba(255,255,255,0.02)"
                            : "rgba(255,255,255,0.05)",
                          border: isMyRole
                            ? `2px solid ${color}`
                            : "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 10,
                          padding: "12px 10px",
                          cursor: isTaken ? "not-allowed" : "pointer",
                          color: isTaken ? "#555" : "white",
                          textAlign: "center",
                          opacity: isTaken ? 0.5 : 1,
                        }}
                      >
                        <div style={{ fontSize: 24 }}>{icon}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isTaken ? "#555" : color, marginTop: 4 }}>
                          {name}
                        </div>
                        {isTaken && (
                          <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
                            {takenBy.name}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {roomState.phase === "role_assignment" && myPlayer?.role && (
                <button
                  onClick={() => setReady(!myPlayer.ready)}
                  style={{
                    width: "100%",
                    background: myPlayer.ready
                      ? "rgba(72, 187, 120, 0.2)"
                      : "linear-gradient(135deg, #48bb78, #38a169)",
                    color: "white",
                    border: myPlayer.ready ? "1px solid #48bb78" : "none",
                    padding: "12px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    marginBottom: 8,
                  }}
                >
                  {myPlayer.ready ? "✓ Ready! (click to unready)" : "I'm Ready!"}
                </button>
              )}

              {isHost && roomState.phase === "lobby" && hasEnoughPlayers && (
                <button
                  onClick={startRoleAssignment}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #e94560, #c62a71)",
                    color: "white",
                    border: "none",
                    padding: "12px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    marginTop: 4,
                  }}
                >
                  Start Role Assignment
                </button>
              )}

              {isHost && roomState.phase === "role_assignment" && allHaveRoles && allReady && (
                <button
                  onClick={startMeeting}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #48bb78, #38a169)",
                    color: "white",
                    border: "none",
                    padding: "14px",
                    borderRadius: 10,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    marginTop: 4,
                    boxShadow: "0 4px 20px rgba(72, 187, 120, 0.4)",
                  }}
                >
                  Start Meeting!
                </button>
              )}
            </div>
          )}
        </div>

        <div style={{
          width: 280,
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}>
          <div style={{
            padding: "12px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            fontSize: 12,
            fontWeight: 600,
            color: "#a0aec0",
          }}>
            Chat
          </div>
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: "#4299e1" }}>{msg.playerName}:</span>{" "}
                <span style={{ color: "#e2e8f0" }}>{msg.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{
            padding: "8px 12px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            gap: 6,
          }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendChat()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                padding: "8px 10px",
                borderRadius: 6,
                fontSize: 12,
                outline: "none",
              }}
            />
            <button
              onClick={handleSendChat}
              style={{
                background: "rgba(66, 153, 225, 0.3)",
                border: "none",
                color: "white",
                padding: "8px 12px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MultiplayerLobby() {
  const { roomState } = useMultiplayer();

  if (!roomState) {
    return <JoinOrCreateView />;
  }

  if (roomState.phase === "lobby" || roomState.phase === "role_assignment") {
    return <WaitingLobby />;
  }

  return null;
}
