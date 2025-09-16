import fs from "fs";
import { parse } from "csv-parse";
import natural from "natural";

const MODEL_PATH = "data/classifier.json";

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

export async function trainAndSave(path = "data/symptoms.csv") {
  const rows = await loadDataset(path);
  if (!rows.length) throw new Error("No rows in data/symptoms.csv");
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

if (process.argv.includes("--train")) {
  trainAndSave().catch(e => {
    console.error(e);
    process.exit(1);
  });
}