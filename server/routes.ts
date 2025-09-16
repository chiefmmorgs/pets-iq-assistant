import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import { trainAndSave, loadModel, bucketAge, type Classifier } from "../src/ml.js";
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
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      hasModel: Boolean(classifier),
      hasTriageMap: Object.keys(triageMap).length > 0
    });
  });

  // Retrain model
  app.post("/api/train", async (req, res, next) => {
    try {
      classifier = await trainAndSave();
      if (fs.existsSync("data/triage.json")) {
        triageMap = JSON.parse(fs.readFileSync("data/triage.json", "utf-8"));
      }
      res.json({ ok: true, message: "Model retrained" });
    } catch (e) { next(e); }
  });

  // Predict endpoint
  app.post("/api/predict", (req, res, next) => {
    try {
      if (!classifier) {
        return res.status(503).json({ ok: false, error: "Model not ready" });
      }
      
      const { text, species, age } = parseBody(predictSchema, req.body || {});
      const features = [
        String(text),
        species ? `species_${species}` : "",
        age ? `age_${bucketAge(age)}` : ""
      ].filter(Boolean).join(" ").toLowerCase();

      const label = classifier.classify(features);
      const scores = classifier.getClassifications(features);
      const triage = triageMap[label] || "see_soon";

      res.json({ ok: true, label, triage, scores: scores.slice(0, 5) });
    } catch (e) { next(e); }
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res, next) => {
    try {
      if (!classifier) {
        return res.status(503).json({ ok: false, error: "Model not ready" });
      }
      
      const { text, species, age } = parseBody(predictSchema, req.body || {});
      const features = [
        String(text),
        species ? `species_${species}` : "",
        age ? `age_${bucketAge(age)}` : ""
      ].filter(Boolean).join(" ").toLowerCase();

      const label = classifier.classify(features);
      const triage = triageMap[label] || "see_soon";
      const message = await vetChat(process.env.OPENAI_API_KEY, text, species, age, label, triage);

      res.json({ ok: true, model_label: label, triage, message });
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
