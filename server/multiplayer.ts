import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { log } from "./index";

export type Role = "speaker" | "table_topics" | "timer" | "evaluator" | "grammarian" | "ah_counter";

export interface Player {
  id: string;
  name: string;
  role: Role | null;
  ready: boolean;
  ws: WebSocket;
}

export interface AudienceRating {
  playerId: string;
  playerName: string;
  clarity: number;
  storytelling: number;
  confidence: number;
}

export interface AggregatedRatings {
  clarity: number;
  storytelling: number;
  confidence: number;
  totalRaters: number;
  ratings: AudienceRating[];
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  players: Map<string, Player>;
  phase: "lobby" | "role_assignment" | "playing" | "feedback";
  minPlayers: number;
  timerSeconds: number;
  timerRunning: boolean;
  timerMaxSeconds: number;
  tableTopicPrompt: string;
  audienceReaction: string;
  speakerActive: boolean;
  audienceRatings: AudienceRating[];
  aggregatedRatings: AggregatedRatings | null;
  ratingOpen: boolean;
}

const TABLE_TOPIC_PROMPTS = [
  "What is the most important lesson you've learned this year?",
  "If you could have dinner with any historical figure, who would it be and why?",
  "Describe your perfect day from start to finish.",
  "What skill do you wish you had learned earlier in life?",
  "If you could change one thing about the world, what would it be?",
  "What's the best advice you've ever received?",
  "Tell us about a time when you stepped outside your comfort zone.",
  "If you could live anywhere in the world, where would it be?",
  "What does success mean to you?",
  "Describe a moment that changed your perspective on life.",
];

const BLOCKED_PATTERNS = [
  /\b(f+u+c+k+|s+h+i+t+|a+s+s+h+o+l+e|b+i+t+c+h|d+a+m+n|d+i+c+k|c+u+n+t|p+i+s+s)\b/gi,
  /\b(n+i+g+g+|f+a+g+|r+e+t+a+r+d)\b/gi,
  /\b(k+i+l+l\s*(you|your|u)|die|threat|bomb)\b/gi,
];

function moderateContent(text: string): string {
  let result = text;
  for (const pattern of BLOCKED_PATTERNS) {
    result = result.replace(pattern, (match) => "*".repeat(match.length));
  }
  return result;
}

const rooms = new Map<string, Room>();

function generateId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function broadcastToRoom(room: Room, message: any, excludeId?: string) {
  const data = JSON.stringify(message);
  room.players.forEach((player) => {
    if (player.id !== excludeId && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(data);
    }
  });
}

function sendToPlayer(player: Player, message: any) {
  if (player.ws.readyState === WebSocket.OPEN) {
    player.ws.send(JSON.stringify(message));
  }
}

function getRoomState(room: Room) {
  const players = Array.from(room.players.values()).map((p) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    ready: p.ready,
  }));

  return {
    type: "room_state",
    room: {
      id: room.id,
      name: room.name,
      hostId: room.hostId,
      phase: room.phase,
      minPlayers: room.minPlayers,
      players,
      timerSeconds: room.timerSeconds,
      timerRunning: room.timerRunning,
      timerMaxSeconds: room.timerMaxSeconds,
      tableTopicPrompt: room.tableTopicPrompt,
      audienceReaction: room.audienceReaction,
      speakerActive: room.speakerActive,
      ratingOpen: room.ratingOpen,
      aggregatedRatings: room.aggregatedRatings,
    },
  };
}

function removePlayerFromRoom(playerId: string) {
  let foundRoomId: string | null = null;
  rooms.forEach((room, roomId) => {
    if (room.players.has(playerId)) {
      foundRoomId = roomId;
    }
  });

  if (!foundRoomId) return;
  const room = rooms.get(foundRoomId);
  if (!room) return;

  room.players.delete(playerId);
  log(`Player ${playerId} left room ${foundRoomId}`, "ws");

  if (room.players.size === 0) {
    rooms.delete(foundRoomId);
    log(`Room ${foundRoomId} deleted (empty)`, "ws");
    return;
  }

  if (room.hostId === playerId) {
    const firstPlayer = room.players.values().next().value;
    if (firstPlayer) {
      room.hostId = firstPlayer.id;
    }
  }

  broadcastToRoom(room, getRoomState(room));
}

const ALL_ROLES: Role[] = ["speaker", "table_topics", "timer", "evaluator", "grammarian", "ah_counter"];

export function setupMultiplayer(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  log("WebSocket server initialized at /ws", "ws");

  wss.on("connection", (ws: WebSocket) => {
    let playerId = generateId();
    let currentRoomId: string | null = null;

    log(`New connection: ${playerId}`, "ws");

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        switch (msg.type) {
          case "create_room": {
            const roomId = generateId();
            const player: Player = {
              id: playerId,
              name: msg.playerName || `Player_${playerId}`,
              role: null,
              ready: false,
              ws,
            };

            const room: Room = {
              id: roomId,
              name: msg.roomName || `Room ${roomId}`,
              hostId: playerId,
              players: new Map([[playerId, player]]),
              phase: "lobby",
              minPlayers: 6,
              timerSeconds: 0,
              timerRunning: false,
              timerMaxSeconds: 300,
              tableTopicPrompt: TABLE_TOPIC_PROMPTS[Math.floor(Math.random() * TABLE_TOPIC_PROMPTS.length)],
              audienceReaction: "neutral",
              speakerActive: false,
              audienceRatings: [],
              aggregatedRatings: null,
              ratingOpen: false,
            };

            rooms.set(roomId, room);
            currentRoomId = roomId;
            log(`Room ${roomId} created by ${player.name}`, "ws");

            sendToPlayer(player, {
              type: "room_created",
              roomId,
              playerId,
            });
            sendToPlayer(player, getRoomState(room));
            break;
          }

          case "join_room": {
            const room = rooms.get(msg.roomId);
            if (!room) {
              sendToPlayer({ id: playerId, name: "", role: null, ready: false, ws }, {
                type: "error",
                message: "Room not found. Please check the code and try again.",
              });
              return;
            }

            if (room.phase !== "lobby" && room.phase !== "role_assignment") {
              sendToPlayer({ id: playerId, name: "", role: null, ready: false, ws }, {
                type: "error",
                message: "This meeting is already in progress. Please wait for the next session.",
              });
              return;
            }

            const player: Player = {
              id: playerId,
              name: msg.playerName || `Player_${playerId}`,
              role: null,
              ready: false,
              ws,
            };

            room.players.set(playerId, player);
            currentRoomId = msg.roomId;
            log(`${player.name} joined room ${msg.roomId}`, "ws");

            sendToPlayer(player, {
              type: "room_joined",
              roomId: msg.roomId,
              playerId,
            });
            broadcastToRoom(room, getRoomState(room));
            break;
          }

          case "list_rooms": {
            const roomList = Array.from(rooms.values())
              .filter((r) => r.phase === "lobby")
              .map((r) => ({
                id: r.id,
                name: r.name,
                playerCount: r.players.size,
                minPlayers: r.minPlayers,
              }));

            sendToPlayer({ id: playerId, name: "", role: null, ready: false, ws }, {
              type: "room_list",
              rooms: roomList,
            });
            break;
          }

          case "select_role": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const player = room.players.get(playerId);
            if (!player) return;

            const requestedRole = msg.role as Role;

            const roleTaken = Array.from(room.players.values()).some(
              (p) => p.id !== playerId && p.role === requestedRole
            );

            if (roleTaken) {
              sendToPlayer(player, {
                type: "error",
                message: `The ${requestedRole} role is already taken by another player.`,
              });
              return;
            }

            player.role = requestedRole;
            log(`${player.name} selected role: ${requestedRole} in room ${currentRoomId}`, "ws");
            broadcastToRoom(room, getRoomState(room));
            break;
          }

          case "ready": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const player = room.players.get(playerId);
            if (!player) return;

            player.ready = msg.ready ?? true;
            log(`${player.name} ready=${player.ready} in room ${currentRoomId}`, "ws");
            broadcastToRoom(room, getRoomState(room));
            break;
          }

          case "start_role_assignment": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room || room.hostId !== playerId) return;

            if (room.players.size < room.minPlayers) {
              sendToPlayer(room.players.get(playerId)!, {
                type: "error",
                message: `Need at least ${room.minPlayers} players to start. Currently ${room.players.size}.`,
              });
              return;
            }

            room.phase = "role_assignment";
            log(`Room ${currentRoomId} moved to role_assignment`, "ws");
            broadcastToRoom(room, getRoomState(room));
            break;
          }

          case "start_meeting": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room || room.hostId !== playerId) return;

            const allPlayersWithRoles = Array.from(room.players.values()).every((p) => p.role !== null);
            const allReady = Array.from(room.players.values()).every((p) => p.ready);

            if (!allPlayersWithRoles) {
              sendToPlayer(room.players.get(playerId)!, {
                type: "error",
                message: "All players must select a role before starting.",
              });
              return;
            }

            if (!allReady) {
              sendToPlayer(room.players.get(playerId)!, {
                type: "error",
                message: "All players must be ready before starting.",
              });
              return;
            }

            room.phase = "playing";
            room.timerSeconds = 0;
            room.timerRunning = false;
            room.speakerActive = false;
            room.tableTopicPrompt = TABLE_TOPIC_PROMPTS[Math.floor(Math.random() * TABLE_TOPIC_PROMPTS.length)];
            log(`Room ${currentRoomId} meeting started!`, "ws");
            broadcastToRoom(room, getRoomState(room));
            break;
          }

          case "timer_start": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const timerPlayer = room.players.get(playerId);
            if (!timerPlayer || timerPlayer.role !== "timer") return;

            room.timerMaxSeconds = msg.maxSeconds || 300;
            room.timerSeconds = 0;
            room.timerRunning = true;
            broadcastToRoom(room, getRoomState(room));
            break;
          }

          case "timer_stop": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            room.timerRunning = false;
            broadcastToRoom(room, getRoomState(room));
            break;
          }

          case "timer_tick": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room || !room.timerRunning) return;

            room.timerSeconds = msg.seconds;
            broadcastToRoom(room, {
              type: "timer_update",
              seconds: room.timerSeconds,
              running: room.timerRunning,
              maxSeconds: room.timerMaxSeconds,
            });
            break;
          }

          case "speaker_start": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            room.speakerActive = true;
            room.audienceReaction = "neutral";
            broadcastToRoom(room, getRoomState(room));
            break;
          }

          case "speaker_finish": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            room.speakerActive = false;
            room.audienceReaction = "applause";
            room.ratingOpen = true;
            room.audienceRatings = [];
            room.aggregatedRatings = null;
            broadcastToRoom(room, getRoomState(room));

            setTimeout(() => {
              if (rooms.has(currentRoomId!)) {
                room.audienceReaction = "neutral";
                broadcastToRoom(room, getRoomState(room));
              }
            }, 3000);
            break;
          }

          case "audience_reaction": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            room.audienceReaction = msg.reaction;
            broadcastToRoom(room, {
              type: "audience_reaction_update",
              reaction: msg.reaction,
            });
            break;
          }

          case "grammarian_note": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            broadcastToRoom(room, {
              type: "grammarian_note_added",
              note: msg.note,
              playerName: room.players.get(playerId)?.name || "Unknown",
            });
            break;
          }

          case "ah_counter_update": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            broadcastToRoom(room, {
              type: "ah_counter_updated",
              count: msg.count,
              word: msg.word,
              playerName: room.players.get(playerId)?.name || "Unknown",
            });
            break;
          }

          case "evaluation_submit": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            broadcastToRoom(room, {
              type: "evaluation_submitted",
              checklist: msg.checklist,
              score: msg.score,
              playerName: room.players.get(playerId)?.name || "Unknown",
            });
            break;
          }

          case "audience_rating": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room || !room.ratingOpen) return;

            const ratingPlayer = room.players.get(playerId);
            if (!ratingPlayer) return;
            if (ratingPlayer.role === "speaker" || ratingPlayer.role === "table_topics") return;

            const alreadyRated = room.audienceRatings.some(r => r.playerId === playerId);
            if (alreadyRated) return;

            const clamp = (v: number) => Math.max(1, Math.min(5, Math.round(v)));
            const rating: AudienceRating = {
              playerId,
              playerName: ratingPlayer.name,
              clarity: clamp(msg.clarity),
              storytelling: clamp(msg.storytelling),
              confidence: clamp(msg.confidence),
            };

            room.audienceRatings.push(rating);
            log(`${ratingPlayer.name} submitted audience rating in room ${currentRoomId}`, "ws");

            const ratings = room.audienceRatings;
            const avgClarity = ratings.reduce((s, r) => s + r.clarity, 0) / ratings.length;
            const avgStorytelling = ratings.reduce((s, r) => s + r.storytelling, 0) / ratings.length;
            const avgConfidence = ratings.reduce((s, r) => s + r.confidence, 0) / ratings.length;

            room.aggregatedRatings = {
              clarity: Math.round(avgClarity * 10) / 10,
              storytelling: Math.round(avgStorytelling * 10) / 10,
              confidence: Math.round(avgConfidence * 10) / 10,
              totalRaters: ratings.length,
              ratings: ratings.map(r => ({
                playerId: r.playerId,
                playerName: r.playerName,
                clarity: r.clarity,
                storytelling: r.storytelling,
                confidence: r.confidence,
              })),
            };

            broadcastToRoom(room, {
              type: "audience_ratings_updated",
              aggregatedRatings: room.aggregatedRatings,
            });
            break;
          }

          case "end_meeting": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            if (room.hostId !== playerId) return;

            room.phase = "feedback";
            room.timerRunning = false;
            room.speakerActive = false;
            broadcastToRoom(room, getRoomState(room));
            break;
          }

          case "return_to_lobby": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room || room.hostId !== playerId) return;

            room.phase = "lobby";
            room.timerSeconds = 0;
            room.timerRunning = false;
            room.speakerActive = false;
            room.audienceReaction = "neutral";
            room.audienceRatings = [];
            room.aggregatedRatings = null;
            room.ratingOpen = false;
            room.players.forEach((p) => {
              p.role = null;
              p.ready = false;
            });
            broadcastToRoom(room, getRoomState(room));
            break;
          }

          case "leave_room": {
            removePlayerFromRoom(playerId);
            currentRoomId = null;
            sendToPlayer({ id: playerId, name: "", role: null, ready: false, ws }, {
              type: "left_room",
            });
            break;
          }

          case "chat": {
            if (!currentRoomId) return;
            const room = rooms.get(currentRoomId);
            if (!room) return;

            const rawMessage = String(msg.message || "").trim();
            if (!rawMessage || rawMessage.length > 200) return;
            const filtered = moderateContent(rawMessage);

            const sender = room.players.get(playerId);
            broadcastToRoom(room, {
              type: "chat_message",
              playerName: sender?.name || "Unknown",
              message: filtered,
              role: sender?.role,
            });
            break;
          }

          default:
            log(`Unknown message type: ${msg.type}`, "ws");
        }
      } catch (err) {
        log(`Error processing message: ${err}`, "ws");
      }
    });

    ws.on("close", () => {
      log(`Connection closed: ${playerId}`, "ws");
      removePlayerFromRoom(playerId);
    });

    ws.on("error", (err) => {
      log(`WebSocket error for ${playerId}: ${err}`, "ws");
    });
  });

  setInterval(() => {
    rooms.forEach((room) => {
      if (room.timerRunning) {
        room.timerSeconds++;
        if (room.timerSeconds >= room.timerMaxSeconds) {
          room.timerRunning = false;
        }
        broadcastToRoom(room, {
          type: "timer_update",
          seconds: room.timerSeconds,
          running: room.timerRunning,
          maxSeconds: room.timerMaxSeconds,
        });
      }
    });
  }, 1000);
}
