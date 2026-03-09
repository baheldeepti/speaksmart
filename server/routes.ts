import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupMultiplayer } from "./multiplayer";
import { registerSchema, loginSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import ConnectPgSimple from "connect-pg-simple";
import pg from "pg";

const PgSession = ConnectPgSimple(session);
const pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) cb(null, true);
    else cb(new Error("Only audio files allowed"));
  },
});

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupMultiplayer(httpServer);

  app.use(
    session({
      store: new PgSession({ pool: pgPool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "toastmasters-xr-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { username, email, password } = parsed.data;

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, email, password: hashedPassword });

      req.session.userId = user.id;
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (err: any) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { email, password } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (err: any) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const stats = await storage.getUserStats(user.id);
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      ...stats,
    });
  });

  app.post("/api/sessions", requireAuth, async (req, res) => {
    try {
      const { role, score, durationSeconds, mode, metadata } = req.body;
      const session = await storage.createGameSession({
        userId: req.session.userId!,
        role,
        score: score || 0,
        durationSeconds: durationSeconds || 0,
        mode: mode || "solo",
        metadata,
      });
      res.json(session);
    } catch {
      res.status(500).json({ message: "Failed to save session" });
    }
  });

  app.get("/api/sessions", requireAuth, async (req, res) => {
    const sessions = await storage.getUserSessions(req.session.userId!);
    res.json(sessions);
  });

  app.post("/api/recordings", requireAuth, upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }
      const { role, sessionId, durationSeconds } = req.body;
      const recording = await storage.createRecording({
        userId: req.session.userId!,
        sessionId: sessionId ? parseInt(sessionId) : undefined,
        role: role || "unknown",
        filename: req.file.filename,
        sizeBytes: req.file.size,
        durationSeconds: parseInt(durationSeconds) || 0,
      });
      res.json(recording);
    } catch {
      res.status(500).json({ message: "Failed to save recording" });
    }
  });

  app.get("/api/recordings", requireAuth, async (req, res) => {
    const recs = await storage.getUserRecordings(req.session.userId!);
    res.json(recs);
  });

  app.get("/api/recordings/:id/audio", requireAuth, async (req, res) => {
    try {
      const recs = await storage.getUserRecordings(req.session.userId!);
      const rec = recs.find(r => r.id === parseInt(req.params.id as string));
      if (!rec) {
        return res.status(404).json({ message: "Recording not found" });
      }
      const filePath = path.join(uploadDir, rec.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Audio file not found" });
      }
      res.setHeader("Content-Type", "audio/webm");
      res.setHeader("Content-Disposition", `inline; filename="${rec.role}-recording.webm"`);
      fs.createReadStream(filePath).pipe(res);
    } catch {
      res.status(500).json({ message: "Failed to stream recording" });
    }
  });

  app.get("/api/scoreboard", async (_req, res) => {
    const scoreboard = await storage.getScoreboard(50);
    res.json(scoreboard);
  });

  app.post("/api/evaluate-speech", requireAuth, async (req, res) => {
    try {
      const { recordingId, sessionId, role, prompt, pathwaysProject } = req.body;

      let audioFilePath: string | null = null;
      let durationSeconds = 0;

      if (recordingId) {
        const recs = await storage.getUserRecordings(req.session.userId!);
        const rec = recs.find(r => r.id === parseInt(recordingId));
        if (!rec) {
          return res.status(404).json({ message: "Recording not found" });
        }
        audioFilePath = path.join(uploadDir, rec.filename);
        durationSeconds = rec.durationSeconds;
      } else if (sessionId) {
        const recs = await storage.getUserRecordings(req.session.userId!);
        const rec = recs.find(r => r.sessionId === parseInt(sessionId));
        if (!rec) {
          return res.status(404).json({ message: "No recording found for this session" });
        }
        audioFilePath = path.join(uploadDir, rec.filename);
        durationSeconds = rec.durationSeconds;
      }

      if (!audioFilePath || !fs.existsSync(audioFilePath)) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      const { transcribeAndAnalyze } = await import("./speechAnalysis");
      const evaluation = await transcribeAndAnalyze(
        audioFilePath,
        durationSeconds || req.body.durationSeconds || 0,
        role || "speaker",
        prompt,
        pathwaysProject
      );

      let verifiedSessionId: number | undefined;
      if (sessionId) {
        const sessions = await storage.getUserSessions(req.session.userId!, 1000);
        if (sessions.some(s => s.id === parseInt(sessionId))) {
          verifiedSessionId = parseInt(sessionId);
        }
      }

      const saved = await storage.createSpeechEvaluation({
        userId: req.session.userId!,
        sessionId: verifiedSessionId,
        transcript: evaluation.transcript,
        fillerWordCount: evaluation.fillerWordCount,
        speechPaceWPM: evaluation.speechPaceWPM,
        clarityScore: evaluation.clarityScore,
        structureScore: evaluation.structureScore,
        confidenceScore: evaluation.confidenceScore,
        engagementScore: evaluation.engagementScore,
        overallScore: evaluation.overallScore,
        aiFeedback: evaluation.aiFeedback,
        rubric: evaluation.rubric,
      });

      res.json({ ...saved, rubric: evaluation.rubric });
    } catch (err: any) {
      console.error("Speech evaluation error:", err);
      res.status(500).json({ message: "Failed to evaluate speech" });
    }
  });

  app.post("/api/evaluate-role", requireAuth, async (req, res) => {
    try {
      const { role, sessionId, metrics } = req.body;

      if (!role || !metrics) {
        return res.status(400).json({ message: "Role and metrics are required" });
      }

      let evaluation;
      const { evaluateTimerRole, evaluateEvaluatorRole, evaluateGrammarianRole, evaluateAhCounterRole } = await import("./speechAnalysis");

      switch (role) {
        case "timer":
          evaluation = evaluateTimerRole(metrics);
          break;
        case "evaluator":
          evaluation = evaluateEvaluatorRole(metrics);
          break;
        case "grammarian":
          evaluation = evaluateGrammarianRole(metrics);
          break;
        case "ah_counter":
          evaluation = evaluateAhCounterRole(metrics);
          break;
        default:
          return res.status(400).json({ message: "Invalid role for evaluation" });
      }

      let verifiedSessionId: number | undefined;
      if (sessionId) {
        const sessions = await storage.getUserSessions(req.session.userId!, 1000);
        if (sessions.some(s => s.id === parseInt(sessionId))) {
          verifiedSessionId = parseInt(sessionId);
        }
      }

      const saved = await storage.createRoleEvaluation({
        userId: req.session.userId!,
        sessionId: verifiedSessionId,
        role,
        metrics: evaluation.metrics,
        overallScore: evaluation.overallScore,
        feedback: evaluation.feedback,
      });

      res.json({ ...saved, metrics: evaluation.metrics, feedback: evaluation.feedback });
    } catch (err: any) {
      console.error("Role evaluation error:", err);
      res.status(500).json({ message: "Failed to evaluate role" });
    }
  });

  app.get("/api/evaluations/:sessionId", requireAuth, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId as string);
      const sessions = await storage.getUserSessions(req.session.userId!, 1000);
      const ownsSession = sessions.some(s => s.id === sessionId);
      if (!ownsSession) {
        return res.status(403).json({ message: "Access denied" });
      }
      const speechEval = await storage.getSessionEvaluation(sessionId);
      const roleEval = await storage.getSessionRoleEvaluation(sessionId);
      res.json({ speechEvaluation: speechEval || null, roleEvaluation: roleEval || null });
    } catch {
      res.status(500).json({ message: "Failed to fetch evaluation" });
    }
  });

  app.get("/api/progress", requireAuth, async (req, res) => {
    try {
      const progressData = await storage.getUserProgressData(req.session.userId!);
      res.json({
        roleEvaluations: progressData.roleEvals,
        speechEvaluations: progressData.speechEvals,
      });
    } catch {
      res.status(500).json({ message: "Failed to fetch progress data" });
    }
  });

  app.post("/api/engagement", requireAuth, async (req, res) => {
    try {
      const { eventType, role, durationSeconds, metadata } = req.body;
      const event = await storage.createEngagementEvent({
        userId: req.session.userId!,
        eventType,
        role,
        durationSeconds,
        metadata,
      });
      res.json(event);
    } catch {
      res.status(500).json({ message: "Failed to log engagement event" });
    }
  });

  app.get("/api/engagement/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserEngagementStats(req.session.userId!);
      res.json(stats);
    } catch {
      res.status(500).json({ message: "Failed to fetch engagement stats" });
    }
  });

  return httpServer;
}
