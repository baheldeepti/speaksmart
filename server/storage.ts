import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc, sql } from "drizzle-orm";
import {
  users, gameSessions, recordings,
  type User, type InsertUser, type GameSession, type Recording,
} from "@shared/schema";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createGameSession(data: { userId: number; role: string; score: number; durationSeconds: number; mode: string; metadata?: any }): Promise<GameSession>;
  getUserSessions(userId: number, limit?: number): Promise<GameSession[]>;
  createRecording(data: { userId: number; sessionId?: number; role: string; filename: string; sizeBytes: number; durationSeconds: number }): Promise<Recording>;
  getUserRecordings(userId: number, limit?: number): Promise<Recording[]>;
  getScoreboard(limit?: number): Promise<{ username: string; totalScore: number; sessionsPlayed: number }[]>;
  getUserStats(userId: number): Promise<{ totalScore: number; sessionsPlayed: number; totalRecordings: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createGameSession(data: { userId: number; role: string; score: number; durationSeconds: number; mode: string; metadata?: any }): Promise<GameSession> {
    const [session] = await db.insert(gameSessions).values(data).returning();
    return session;
  }

  async getUserSessions(userId: number, limit = 50): Promise<GameSession[]> {
    return db.select().from(gameSessions)
      .where(eq(gameSessions.userId, userId))
      .orderBy(desc(gameSessions.completedAt))
      .limit(limit);
  }

  async createRecording(data: { userId: number; sessionId?: number; role: string; filename: string; sizeBytes: number; durationSeconds: number }): Promise<Recording> {
    const [recording] = await db.insert(recordings).values(data).returning();
    return recording;
  }

  async getUserRecordings(userId: number, limit = 50): Promise<Recording[]> {
    return db.select().from(recordings)
      .where(eq(recordings.userId, userId))
      .orderBy(desc(recordings.createdAt))
      .limit(limit);
  }

  async getScoreboard(limit = 50): Promise<{ username: string; totalScore: number; sessionsPlayed: number }[]> {
    const result = await db
      .select({
        username: users.username,
        totalScore: sql<number>`COALESCE(SUM(${gameSessions.score}), 0)::int`,
        sessionsPlayed: sql<number>`COUNT(${gameSessions.id})::int`,
      })
      .from(users)
      .leftJoin(gameSessions, eq(users.id, gameSessions.userId))
      .groupBy(users.id, users.username)
      .having(sql`COUNT(${gameSessions.id}) > 0`)
      .orderBy(sql`SUM(${gameSessions.score}) DESC`)
      .limit(limit);
    return result;
  }

  async getUserStats(userId: number): Promise<{ totalScore: number; sessionsPlayed: number; totalRecordings: number }> {
    const [sessionStats] = await db
      .select({
        totalScore: sql<number>`COALESCE(SUM(${gameSessions.score}), 0)::int`,
        sessionsPlayed: sql<number>`COUNT(${gameSessions.id})::int`,
      })
      .from(gameSessions)
      .where(eq(gameSessions.userId, userId));

    const [recStats] = await db
      .select({
        totalRecordings: sql<number>`COUNT(${recordings.id})::int`,
      })
      .from(recordings)
      .where(eq(recordings.userId, userId));

    return {
      totalScore: sessionStats?.totalScore || 0,
      sessionsPlayed: sessionStats?.sessionsPlayed || 0,
      totalRecordings: recStats?.totalRecordings || 0,
    };
  }
}

export const storage = new DatabaseStorage();
