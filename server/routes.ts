import type { Express } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  // Minimal API endpoint - ready for your custom implementation
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Backend ready for your implementation" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
