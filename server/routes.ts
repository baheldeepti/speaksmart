import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupMultiplayer } from "./multiplayer";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupMultiplayer(httpServer);

  return httpServer;
}
