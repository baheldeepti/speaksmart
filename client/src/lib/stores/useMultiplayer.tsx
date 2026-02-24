import { create } from "zustand";

export type Role = "speaker" | "table_topics" | "timer" | "evaluator" | "grammarian" | "ah_counter";

export interface MultiplayerPlayer {
  id: string;
  name: string;
  role: Role | null;
  ready: boolean;
}

export interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  minPlayers: number;
}

export interface RoomState {
  id: string;
  name: string;
  hostId: string;
  phase: "lobby" | "role_assignment" | "playing" | "feedback";
  minPlayers: number;
  players: MultiplayerPlayer[];
  timerSeconds: number;
  timerRunning: boolean;
  timerMaxSeconds: number;
  tableTopicPrompt: string;
  audienceReaction: string;
  speakerActive: boolean;
}

export interface ChatMessage {
  playerName: string;
  message: string;
  role: Role | null;
  timestamp: number;
}

interface MultiplayerState {
  ws: WebSocket | null;
  connected: boolean;
  playerId: string | null;
  playerName: string;
  roomState: RoomState | null;
  availableRooms: RoomInfo[];
  error: string | null;
  chatMessages: ChatMessage[];
  multiplayerMode: boolean;

  connect: () => void;
  disconnect: () => void;
  setPlayerName: (name: string) => void;
  createRoom: (roomName: string) => void;
  joinRoom: (roomId: string) => void;
  listRooms: () => void;
  selectRole: (role: Role) => void;
  setReady: (ready: boolean) => void;
  startRoleAssignment: () => void;
  startMeeting: () => void;
  leaveRoom: () => void;
  sendChat: (message: string) => void;

  timerStart: (maxSeconds: number) => void;
  timerStop: () => void;
  speakerStart: () => void;
  speakerFinish: () => void;
  sendAudienceReaction: (reaction: string) => void;
  sendGrammarianNote: (note: string) => void;
  sendAhCounterUpdate: (count: number, word: string) => void;
  sendEvaluation: (checklist: any[], score: number) => void;
  endMeeting: () => void;
  returnToLobby: () => void;

  setMultiplayerMode: (enabled: boolean) => void;
  clearError: () => void;
}

export const useMultiplayer = create<MultiplayerState>((set, get) => {
  function send(msg: any) {
    const { ws } = get();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  return {
    ws: null,
    connected: false,
    playerId: null,
    playerName: "",
    roomState: null,
    availableRooms: [],
    error: null,
    chatMessages: [],
    multiplayerMode: false,

    connect: () => {
      const { ws: existingWs } = get();
      if (existingWs && existingWs.readyState === WebSocket.OPEN) return;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[Multiplayer] Connected to server");
        set({ connected: true });
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case "room_created":
              set({ playerId: msg.playerId });
              break;

            case "room_joined":
              set({ playerId: msg.playerId });
              break;

            case "room_state":
              set({ roomState: msg.room });
              break;

            case "room_list":
              set({ availableRooms: msg.rooms });
              break;

            case "timer_update":
              set((state) => {
                if (!state.roomState) return {};
                return {
                  roomState: {
                    ...state.roomState,
                    timerSeconds: msg.seconds,
                    timerRunning: msg.running,
                    timerMaxSeconds: msg.maxSeconds,
                  },
                };
              });
              break;

            case "audience_reaction_update":
              set((state) => {
                if (!state.roomState) return {};
                return {
                  roomState: {
                    ...state.roomState,
                    audienceReaction: msg.reaction,
                  },
                };
              });
              break;

            case "chat_message":
              set((state) => ({
                chatMessages: [
                  ...state.chatMessages,
                  {
                    playerName: msg.playerName,
                    message: msg.message,
                    role: msg.role,
                    timestamp: Date.now(),
                  },
                ].slice(-50),
              }));
              break;

            case "left_room":
              set({ roomState: null, chatMessages: [] });
              break;

            case "error":
              set({ error: msg.message });
              setTimeout(() => set({ error: null }), 5000);
              break;
          }
        } catch (err) {
          console.error("[Multiplayer] Parse error:", err);
        }
      };

      ws.onclose = () => {
        console.log("[Multiplayer] Disconnected");
        set({ connected: false, ws: null });
      };

      ws.onerror = (err) => {
        console.error("[Multiplayer] Error:", err);
      };

      set({ ws });
    },

    disconnect: () => {
      const { ws } = get();
      if (ws) {
        ws.close();
        set({ ws: null, connected: false, roomState: null, chatMessages: [] });
      }
    },

    setPlayerName: (name) => set({ playerName: name }),

    createRoom: (roomName) => {
      const { playerName } = get();
      send({ type: "create_room", roomName, playerName: playerName || "Anonymous" });
    },

    joinRoom: (roomId) => {
      const { playerName } = get();
      send({ type: "join_room", roomId, playerName: playerName || "Anonymous" });
    },

    listRooms: () => {
      send({ type: "list_rooms" });
    },

    selectRole: (role) => {
      send({ type: "select_role", role });
    },

    setReady: (ready) => {
      send({ type: "ready", ready });
    },

    startRoleAssignment: () => {
      send({ type: "start_role_assignment" });
    },

    startMeeting: () => {
      send({ type: "start_meeting" });
    },

    leaveRoom: () => {
      send({ type: "leave_room" });
      set({ roomState: null, chatMessages: [] });
    },

    sendChat: (message) => {
      send({ type: "chat", message });
    },

    timerStart: (maxSeconds) => {
      send({ type: "timer_start", maxSeconds });
    },

    timerStop: () => {
      send({ type: "timer_stop" });
    },

    speakerStart: () => {
      send({ type: "speaker_start" });
    },

    speakerFinish: () => {
      send({ type: "speaker_finish" });
    },

    sendAudienceReaction: (reaction) => {
      send({ type: "audience_reaction", reaction });
    },

    sendGrammarianNote: (note) => {
      send({ type: "grammarian_note", note });
    },

    sendAhCounterUpdate: (count, word) => {
      send({ type: "ah_counter_update", count, word });
    },

    sendEvaluation: (checklist, score) => {
      send({ type: "evaluation_submit", checklist, score });
    },

    endMeeting: () => {
      send({ type: "end_meeting" });
    },

    returnToLobby: () => {
      send({ type: "return_to_lobby" });
    },

    setMultiplayerMode: (enabled) => {
      set({ multiplayerMode: enabled });
      if (enabled) {
        get().connect();
      } else {
        get().disconnect();
      }
    },

    clearError: () => set({ error: null }),
  };
});
