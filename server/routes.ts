import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { petAssessmentSchema } from "@shared/schema";
import { generateROMAAdvice } from "./roma-service";

export function registerRoutes(app: Express): Server {
  // Pet assessment endpoint
  app.post("/api/assess", async (req, res) => {
    try {
      const { petType, petAge, symptoms } = petAssessmentSchema.parse(req.body);
      
      // Generate ROMA-powered triage response
      const triageResult = await generateROMAAdvice(petType, petAge, symptoms);
      
      // Store assessment
      const assessment = await storage.createAssessment({
        petType,
        petAge,
        symptoms,
        triage: triageResult.triage,
        advice: triageResult.advice,
      });

      res.json({
        id: assessment.id,
        ...triageResult
      });
    } catch (error) {
      console.error("Assessment error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid request" 
      });
    }
  });

  // Get assessment by ID
  app.get("/api/assessment/:id", async (req, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      console.error("Get assessment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
