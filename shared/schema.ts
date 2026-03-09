import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull(),
  score: integer("score").notNull().default(0),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  mode: text("mode").notNull().default("solo"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

export const recordings = pgTable("recordings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => gameSessions.id),
  role: text("role").notNull(),
  filename: text("filename").notNull(),
  sizeBytes: integer("size_bytes").notNull().default(0),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const speechEvaluations = pgTable("speech_evaluations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => gameSessions.id),
  transcript: text("transcript"),
  fillerWordCount: integer("filler_word_count").default(0),
  speechPaceWPM: integer("speech_pace_wpm").default(0),
  clarityScore: integer("clarity_score").default(0),
  structureScore: integer("structure_score").default(0),
  confidenceScore: integer("confidence_score").default(0),
  engagementScore: integer("engagement_score").default(0),
  overallScore: integer("overall_score").default(0),
  aiFeedback: text("ai_feedback"),
  rubric: jsonb("rubric"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const roleEvaluations = pgTable("role_evaluations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => gameSessions.id),
  role: text("role").notNull(),
  metrics: jsonb("metrics"),
  overallScore: integer("overall_score").default(0),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const engagementEvents = pgTable("engagement_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  eventType: text("event_type").notNull(),
  role: text("role"),
  durationSeconds: integer("duration_seconds").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  username: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(6),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type Recording = typeof recordings.$inferSelect;
export type SpeechEvaluation = typeof speechEvaluations.$inferSelect;
export type RoleEvaluation = typeof roleEvaluations.$inferSelect;
export type EngagementEvent = typeof engagementEvents.$inferSelect;
