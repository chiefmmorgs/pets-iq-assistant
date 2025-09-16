import express from "express";
const app = express();
app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true, service: "ROMA mock" }));
app.post("/api/infer", (req, res) => {
  const { input } = req.body || {};
  res.json({ ok: true, plan: [`Analyze: ${input}`, "Cross-check symptoms", "Recommend triage flow"] });
});
const PORT = 8000;
app.listen(PORT, "0.0.0.0", () => console.log(`ROMA mock on ${PORT}`));