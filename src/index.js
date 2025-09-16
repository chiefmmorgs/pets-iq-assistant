import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { trainAndSave, loadModel, bucketAge } from "./ml.js";
import { DISEASE_TRIAGE } from "./triageMap.js";
import { vetChat } from "./openaiChat.js";
import { askRoma } from "./romaClient.js";
import { predictSchema, parseBody } from "./validators.js";

const app = express();

// security + logging
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

let classifier = null;
let triageMap = { ...DISEASE_TRIAGE };

// Serve static files from client/dist in production
if (process.env.NODE_ENV !== "development") {
  app.use(express.static(path.join(process.cwd(), "dist/public")));
}

// boot
(async () => {
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
})();

// health
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    hasModel: Boolean(classifier),
    hasTriageMap: Object.keys(triageMap).length > 0
  });
});

// retrain
app.post("/api/train", async (_req, res, next) => {
  try {
    classifier = await trainAndSave();
    if (fs.existsSync("data/triage.json")) {
      triageMap = JSON.parse(fs.readFileSync("data/triage.json", "utf-8"));
    }
    res.json({ ok: true, message: "Model retrained" });
  } catch (e) { next(e); }
});

// predict
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

// chat
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

// roma proxy
app.post("/api/roma", async (req, res, next) => {
  try {
    const { text } = parseBody(predictSchema.pick({ text: true }), req.body || {});
    const roma = await askRoma(text);
    res.json({ ok: true, roma });
  } catch (e) { next(e); }
});

// Catch-all handler for SPA
if (process.env.NODE_ENV !== "development") {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "dist/public/index.html"));
  });
}

// errors
app.use((err, _req, res, _next) => {
  const code = err.status || 500;
  res.status(code).json({ ok: false, error: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Pets IQ API listening on ${PORT}`);
});