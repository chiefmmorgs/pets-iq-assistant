import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import { trainAndSave, loadModel, bucketAge, type Classifier, predictWithKnowledgeBase } from "../src/ml.js";
import { DISEASE_TRIAGE } from "../src/triageMap.js";
import { vetChat } from "../src/openaiChat.js";
import { askRoma } from "../src/romaClient.js";
import { predictSchema, parseBody } from "../src/validators.js";

let classifier: Classifier | null = null;
let triageMap: Record<string, string> = { ...DISEASE_TRIAGE };

// Initialize ML model
async function initializeModel() {
  try {
    if (fs.existsSync("data/triage.json")) {
      triageMap = JSON.parse(fs.readFileSync("data/triage.json", "utf-8"));
    }
    classifier = await loadModel();
    if (!classifier) {
      console.log("No saved model found. Training from CSV…");
      classifier = await trainAndSave();
      if (fs.existsSync("data/triage.json")) {
        triageMap = JSON.parse(fs.readFileSync("data/triage.json", "utf-8"));
      }
    }
    console.log("Model ready");
  } catch (e) {
    console.error("Startup error:", e);
  }
}

// Start model initialization
initializeModel();

export function registerRoutes(app: Express): Server {
  // Health check for Docker (simple)
  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  // Detailed health check
  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      hasModel: Boolean(classifier),
      hasTriageMap: Object.keys(triageMap).length > 0
    });
  });

  // Retrain model (protected endpoint - requires admin access)
  app.post("/api/train", async (req, res, next) => {
    try {
      // Basic protection - require admin token in production
      const adminToken = process.env.ADMIN_TOKEN;
      if (process.env.NODE_ENV === "production" && adminToken) {
        const providedToken = req.headers.authorization?.replace("Bearer ", "");
        if (!providedToken || providedToken !== adminToken) {
          return res.status(401).json({ ok: false, error: "Unauthorized" });
        }
      }
      
      classifier = await trainAndSave();
      if (fs.existsSync("data/triage.json")) {
        triageMap = JSON.parse(fs.readFileSync("data/triage.json", "utf-8"));
      }
      res.json({ ok: true, message: "Model retrained" });
    } catch (e) { next(e); }
  });

  // Predict endpoint - Enhanced with knowledge base
  app.post("/api/predict", async (req, res, next) => {
    try {
      const { text, species, age } = parseBody(predictSchema, req.body || {});
      
      // Use enhanced prediction with knowledge base
      const assessment = await predictWithKnowledgeBase(text, species, age);
      
      res.json({ 
        ok: true, 
        ...assessment
      });
    } catch (e) { next(e); }
  });

  // Chat endpoint - Enhanced with knowledge base, OpenAI, and Roma agent integration
  app.post("/api/chat", async (req, res, next) => {
    try {
      const { text, species, age } = parseBody(predictSchema, req.body || {});
      
      // Get knowledge base assessment
      const kbAssessment = await predictWithKnowledgeBase(text, species, age);
      
      // Get Roma agent analysis (parallel with other assessments)
      let romaAnalysis = null;
      try {
        const romaResult = await askRoma(text);
        if (romaResult.ok !== false) {
          romaAnalysis = romaResult;
        }
      } catch (romaError) {
        const errorMessage = romaError instanceof Error ? romaError.message : String(romaError);
        console.log("Roma agent not available:", errorMessage);
      }
      
      // Get structured AI response with knowledge base context
      let aiResponse;
      try {
        aiResponse = await vetChat(process.env.OPENAI_API_KEY, text, species, age, kbAssessment);
      } catch (openaiError) {
        console.warn("OpenAI API failed, using fallback:", openaiError);
        // Import fallback function
        const { fallback } = await import("../src/openaiChat.js");
        aiResponse = fallback(kbAssessment);
      }

      // Combine all assessment sources
      const response = { 
        ok: true, 
        ...aiResponse,
        roma_analysis: romaAnalysis, // Include Roma insights when available
        request_id: Math.random().toString(36).substr(2, 8)
      };

      res.json(response);
    } catch (e) { next(e); }
  });

  // Roma proxy
  app.post("/api/roma", async (req, res, next) => {
    try {
      const { text } = parseBody(predictSchema.pick({ text: true }), req.body || {});
      const roma = await askRoma(text);
      res.json({ ok: true, roma });
    } catch (e) { next(e); }
  });

  const httpServer = createServer(app);
  return httpServer;
}
