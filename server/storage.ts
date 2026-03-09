import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc, sql, and } from "drizzle-orm";
import {
  users, gameSessions, recordings, speechEvaluations, roleEvaluations, engagementEvents,
  type User, type InsertUser, type GameSession, type Recording,
  type SpeechEvaluation, type RoleEvaluation, type EngagementEvent,
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
  createSpeechEvaluation(data: Partial<SpeechEvaluation> & { userId: number }): Promise<SpeechEvaluation>;
  getSessionEvaluation(sessionId: number): Promise<SpeechEvaluation | undefined>;
  getUserSpeechEvaluations(userId: number, limit?: number): Promise<SpeechEvaluation[]>;
  createRoleEvaluation(data: { userId: number; sessionId?: number; role: string; metrics: any; overallScore: number; feedback: string }): Promise<RoleEvaluation>;
  getSessionRoleEvaluation(sessionId: number): Promise<RoleEvaluation | undefined>;
  getUserRoleEvaluations(userId: number, limit?: number): Promise<RoleEvaluation[]>;
  getUserProgressData(userId: number): Promise<{ speechEvals: SpeechEvaluation[]; roleEvals: RoleEvaluation[] }>;
  createEngagementEvent(data: { userId: number; eventType: string; role?: string; durationSeconds?: number; metadata?: any }): Promise<EngagementEvent>;
  getUserEngagementStats(userId: number): Promise<{
    totalSessions: number;
    totalSpeakingTime: number;
    multiplayerGames: number;
    rolesCompleted: string[];
    practiceStreak: number;
    sessionsPerWeek: number;
    challengesCompleted: number;
  }>;
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

  async createSpeechEvaluation(data: Partial<SpeechEvaluation> & { userId: number }): Promise<SpeechEvaluation> {
    const [evaluation] = await db.insert(speechEvaluations).values(data).returning();
    return evaluation;
  }

  async getSessionEvaluation(sessionId: number): Promise<SpeechEvaluation | undefined> {
    const [evaluation] = await db.select().from(speechEvaluations).where(eq(speechEvaluations.sessionId, sessionId));
    return evaluation;
  }

  async getUserSpeechEvaluations(userId: number, limit = 50): Promise<SpeechEvaluation[]> {
    return db.select().from(speechEvaluations)
      .where(eq(speechEvaluations.userId, userId))
      .orderBy(desc(speechEvaluations.createdAt))
      .limit(limit);
  }

  async createRoleEvaluation(data: { userId: number; sessionId?: number; role: string; metrics: any; overallScore: number; feedback: string }): Promise<RoleEvaluation> {
    const [evaluation] = await db.insert(roleEvaluations).values(data).returning();
    return evaluation;
  }

  async getSessionRoleEvaluation(sessionId: number): Promise<RoleEvaluation | undefined> {
    const [evaluation] = await db.select().from(roleEvaluations).where(eq(roleEvaluations.sessionId, sessionId));
    return evaluation;
  }

  async getUserRoleEvaluations(userId: number, limit = 50): Promise<RoleEvaluation[]> {
    return db.select().from(roleEvaluations)
      .where(eq(roleEvaluations.userId, userId))
      .orderBy(desc(roleEvaluations.createdAt))
      .limit(limit);
  }

  async getUserProgressData(userId: number): Promise<{ speechEvals: SpeechEvaluation[]; roleEvals: RoleEvaluation[] }> {
    const speechEvals = await db.select().from(speechEvaluations)
      .where(eq(speechEvaluations.userId, userId))
      .orderBy(speechEvaluations.createdAt);

    const roleEvals = await db.select().from(roleEvaluations)
      .where(eq(roleEvaluations.userId, userId))
      .orderBy(roleEvaluations.createdAt);

    return { speechEvals, roleEvals };
  }

  async createEngagementEvent(data: { userId: number; eventType: string; role?: string; durationSeconds?: number; metadata?: any }): Promise<EngagementEvent> {
    const [event] = await db.insert(engagementEvents).values(data).returning();
    return event;
  }

  async getUserEngagementStats(userId: number): Promise<{
    totalSessions: number;
    totalSpeakingTime: number;
    multiplayerGames: number;
    rolesCompleted: string[];
    practiceStreak: number;
    sessionsPerWeek: number;
    challengesCompleted: number;
  }> {
    const [sessionStats] = await db
      .select({
        totalSessions: sql<number>`COUNT(*)::int`,
        totalSpeakingTime: sql<number>`COALESCE(SUM(${gameSessions.durationSeconds}), 0)::int`,
      })
      .from(gameSessions)
      .where(eq(gameSessions.userId, userId));

    const [multiplayerStats] = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(gameSessions)
      .where(and(eq(gameSessions.userId, userId), eq(gameSessions.mode, "multiplayer")));

    const rolesResult = await db
      .select({
        role: gameSessions.role,
      })
      .from(gameSessions)
      .where(eq(gameSessions.userId, userId))
      .groupBy(gameSessions.role);

    const [challengeStats] = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(engagementEvents)
      .where(and(eq(engagementEvents.userId, userId), eq(engagementEvents.eventType, "challenge_complete")));

    const recentEvents = await db
      .select({
        date: sql<string>`DATE(${engagementEvents.createdAt})`,
      })
      .from(engagementEvents)
      .where(eq(engagementEvents.userId, userId))
      .groupBy(sql`DATE(${engagementEvents.createdAt})`)
      .orderBy(sql`DATE(${engagementEvents.createdAt}) DESC`)
      .limit(30);

    let practiceStreak = 0;
    if (recentEvents.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let currentDate = today;

      for (const event of recentEvents) {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((currentDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          practiceStreak++;
          currentDate = eventDate;
        } else {
          break;
        }
      }
    }

    const [weeklyStats] = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(gameSessions)
      .where(and(
        eq(gameSessions.userId, userId),
        sql`${gameSessions.completedAt} > NOW() - INTERVAL '7 days'`
      ));

    return {
      totalSessions: sessionStats?.totalSessions || 0,
      totalSpeakingTime: sessionStats?.totalSpeakingTime || 0,
      multiplayerGames: multiplayerStats?.count || 0,
      rolesCompleted: rolesResult.map(r => r.role),
      practiceStreak,
      sessionsPerWeek: weeklyStats?.count || 0,
      challengesCompleted: challengeStats?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
