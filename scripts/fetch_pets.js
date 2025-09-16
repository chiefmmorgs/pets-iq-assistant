import fs from "fs";
import path from "path";
import axios from "axios";
import AdmZip from "adm-zip";

const OWNER = "Vetdatahub";
const REPO = "VetDataHub";
const BRANCH = "main";
const ROOT_PATH = "Datasets";
const OUT_DIR = "tmp/vethub_raw";

const PET_KEYWORDS = ["pet","pets","dog","dogs","cat","cats","canine","feline","companion"];

const token = process.env.GITHUB_TOKEN;
const api = axios.create({
  baseURL: "https://api.github.com",
  headers: token ? { Authorization: `Bearer ${token}` } : {}
});

async function listDir(repoPath) {
  const url = `/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(repoPath)}?ref=${BRANCH}`;
  const { data } = await api.get(url);
  return data;
}

function isPetPath(p) {
  const lower = p.toLowerCase();
  return PET_KEYWORDS.some(k => lower.includes(k));
}

async function ensureDir(d) {
  await fs.promises.mkdir(d, { recursive: true });
}

async function downloadFile(rawUrl, outPath) {
  const { data } = await axios.get(rawUrl, { responseType: "arraybuffer" });
  await ensureDir(path.dirname(outPath));
  await fs.promises.writeFile(outPath, data);
}

async function downloadZipFromGitUrl(gitUrl, outDir) {
  const { data } = await api.get(gitUrl);
  if (data.download_url && data.name.match(/\.(zip|rar)$/i)) {
    const outPath = path.join(outDir, data.name);
    await downloadFile(data.download_url, outPath);
    if (outPath.endsWith(".zip")) {
      const zip = new AdmZip(outPath);
      zip.extractAllTo(path.join(outDir, data.name.replace(/\.zip$/i, "")), true);
    }
  }
}

async function walk(repoPath) {
  try {
    const items = await listDir(repoPath);
    for (const it of items) {
      if (it.type === "dir") {
        if (repoPath === ROOT_PATH || isPetPath(it.path)) {
          await walk(it.path);
        }
      } else if (it.type === "file") {
        if (!isPetPath(it.path)) continue;
        const outPath = path.join(OUT_DIR, it.path.replace(`${ROOT_PATH}/`, ""));
        if (/\.(zip|rar)$/i.test(it.name)) {
          await downloadZipFromGitUrl(it.url, path.dirname(outPath));
        } else {
          await downloadFile(it.download_url, outPath);
        }
      }
    }
  } catch (e) {
    console.error("Walk error at", repoPath, e.message);
  }
}

(async () => {
  console.log("Fetching pets-only datasets from VetDataHub…");
  await ensureDir(OUT_DIR);
  await walk(ROOT_PATH);
  console.log("Done. Raw files in", OUT_DIR);
})();