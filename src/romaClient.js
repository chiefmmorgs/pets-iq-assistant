import axios from "axios";
const BASE = process.env.ROMA_URL || "http://localhost:8000";

export async function askRoma(input) {
  try {
    const { data } = await axios.post(`${BASE}/api/infer`, { input });
    return data;
  } catch (e) {
    return { ok: false, error: e.message };
  }
}