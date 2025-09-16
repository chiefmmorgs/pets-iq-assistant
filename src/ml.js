import fs from "fs";
import { parse } from "csv-parse";
import natural from "natural";
import { assessSymptoms } from "./knowledgeBase.js";

const MODEL_PATH = "data/classifier.json";

// Legacy CSV dataset loading (kept for backward compatibility)
export async function loadDataset(path = "data/symptoms.csv") {
  return new Promise((resolve, reject) => {
    const rows = [];
    if (!fs.existsSync(path)) return resolve(rows);
    fs.createReadStream(path)
      .pipe(parse({ columns: true, trim: true }))
      .on("data", r => rows.push(r))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

// Enhanced ML prediction that combines knowledge base with traditional ML
export async function predictWithKnowledgeBase(symptoms, species, age) {
  // First get knowledge base assessment
  const kbAssessment = assessSymptoms(symptoms);
  
  // Try to get traditional ML prediction as additional context
  let mlPrediction = null;
  let hasMLModel = false;
  try {
    const classifier = await loadModel();
    if (classifier) {
      hasMLModel = true;
      const ageBucket = age ? `age_${bucketAge(age)}` : "";
      const speciesTag = species ? `species_${species}` : "";
      const text = `${symptoms} ${speciesTag} ${ageBucket}`.toLowerCase();
      mlPrediction = classifier.classify(text);
    }
  } catch (error) {
    console.warn("ML classifier not available:", error.message);
  }
  
  // Combine knowledge base assessment with ML prediction
  const result = {
    ...kbAssessment,
    ml_prediction: mlPrediction, // Additional context from traditional ML
    assessment_method: hasMLModel ? "hybrid" : "knowledge_base"
  };
  
  // Adjust confidence if ML agrees with knowledge base
  if (mlPrediction && mlPrediction.toLowerCase().includes(kbAssessment.disease.toLowerCase())) {
    result.confidence = Math.min(1.0, result.confidence + 0.1);
  }
  
  return result;
}

// Simple prediction function that returns basic classification
export async function predict(symptoms, species, age) {
  const result = await predictWithKnowledgeBase(symptoms, species, age);
  return {
    label: result.disease,
    triage: result.triage,
    confidence: result.confidence
  };
}

// Legacy training function (kept for backward compatibility)
export async function trainAndSave(path = "data/symptoms.csv") {
  const rows = await loadDataset(path);
  if (!rows.length) {
    console.log("No CSV training data found. Using knowledge base only.");
    return null;
  }
  
  const classifier = new natural.BayesClassifier();
  for (const r of rows) {
    const ageBucket = r.age ? `age_${bucketAge(r.age)}` : "";
    const species = r.species ? `species_${r.species}` : "";
    const text = `${r.text} ${species} ${ageBucket}`.toLowerCase();
    classifier.addDocument(text, r.label);
  }
  classifier.train();
  
  await new Promise((res, rej) =>
    classifier.save(MODEL_PATH, err => (err ? rej(err) : res()))
  );
  
  if (rows[0] && "triage" in rows[0]) {
    const triMap = {};
    rows.forEach(r => {
      if (r.label && r.triage) triMap[r.label] = r.triage;
    });
    fs.writeFileSync("data/triage.json", JSON.stringify(triMap, null, 2));
  }
  
  console.log("Model saved to", MODEL_PATH);
  return classifier;
}

export async function loadModel() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(MODEL_PATH)) return resolve(null);
    natural.BayesClassifier.load(MODEL_PATH, null, (err, clf) => {
      if (err) reject(err);
      else resolve(clf);
    });
  });
}

export function bucketAge(a) {
  const n = Number(a);
  if (Number.isNaN(n)) return "unknown";
  if (n <= 1) return "infant";
  if (n <= 7) return "adult";
  return "senior";
}

// Initialize with knowledge base on startup
console.log("ML system initialized with knowledge base support");

if (process.argv.includes("--train")) {
  trainAndSave().catch(e => {
    console.error(e);
    process.exit(1);
  });
}