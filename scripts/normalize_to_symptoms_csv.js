import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { stringify } from "csv-stringify/sync";

const RAW_DIR = "tmp/vethub_raw";
const OUT_CSV = "data/symptoms.csv";

const TEXT_KEYS = ["symptom","symptoms","text","notes","description"];
const LABEL_KEYS = ["disease","diagnosis","label","condition"];
const SPECIES_KEYS = ["species","animal","pet_type"];
const AGE_KEYS = ["age","age_years","years"];
const TRIAGE_KEYS = ["triage","urgency","severity"];

function pickKey(obj, keys) {
  for (const k of keys) {
    if (k in obj && String(obj[k]).trim().length) return k;
  }
  return null;
}

function speciesFromPath(p) {
  const lower = p.toLowerCase();
  if (lower.includes("dog") || lower.includes("canine")) return "dog";
  if (lower.includes("cat") || lower.includes("feline")) return "cat";
  if (lower.includes("companion")) return "companion";
  return "";
}

async function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true }))
      .on("data", r => rows.push(r))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

function triageFromLabel(label) {
  const l = String(label).toLowerCase();
  if (/(bloat|gdv|torsion|seizure|poison|hemorrhage|collapse|dyspnea|blood vomit)/.test(l)) return "emergency";
  if (/(respiratory|pneumonia|fever|dehydration|urinary|retention|fracture)/.test(l)) return "see_soon";
  return "general";
}

async function* allFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* allFiles(p);
    else yield p;
  }
}

(async () => {
  const outRows = [];
  for await (const fp of allFiles(RAW_DIR)) {
    if (!fp.toLowerCase().endsWith(".csv")) continue;
    try {
      const csvRows = await readCsv(fp);
      if (!csvRows.length) continue;
      const sample = csvRows[0];

      const kText = pickKey(sample, TEXT_KEYS);
      const kLabel = pickKey(sample, LABEL_KEYS);
      if (!kText || !kLabel) continue;

      const kSpecies = pickKey(sample, SPECIES_KEYS);
      const kAge = pickKey(sample, AGE_KEYS);
      const kTriage = pickKey(sample, TRIAGE_KEYS);

      const inferredSpecies = speciesFromPath(fp);

      for (const r of csvRows) {
        const text = String(r[kText] || "").trim();
        const label = String(r[kLabel] || "").trim();
        if (!text || !label) continue;

        const species = String(r[kSpecies] || inferredSpecies || "").toLowerCase();
        const age = String(r[kAge] || "").trim();
        const triage = String(r[kTriage] || "").trim().toLowerCase() || triageFromLabel(label);

        outRows.push({ text, species, age, label, triage });
      }
      console.log("OK:", fp);
    } catch (e) {
      console.log("Skip:", fp, e.message);
    }
  }

  await fs.promises.mkdir(path.dirname(OUT_CSV), { recursive: true });
  const csv = stringify(outRows, { header: true, columns: ["text","species","age","label","triage"] });
  await fs.promises.writeFile(OUT_CSV, csv);
  console.log(`Wrote ${outRows.length} rows -> ${OUT_CSV}`);
})();