import axios from "axios";

const ROMA_HOST = process.env.ROMA_HOST || "roma";
const ROMA_PORT = process.env.ROMA_PORT || 8001;
const BASE = `http://${ROMA_HOST}:${ROMA_PORT}`;

export async function health() {
  try {
    const r = await axios.get(`${BASE}/health`, { timeout: 2000 });
    return r.data;
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function reason(messages) {
  try {
    // Try different possible ROMA endpoints
    let response;
    try {
      response = await axios.post(`${BASE}/reason`, { messages }, { timeout: 15000 });
    } catch (firstError) {
      // Fallback to alternative endpoint patterns
      response = await axios.post(`${BASE}/api/reason`, { messages }, { timeout: 15000 });
    }
    return response.data;
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Legacy function for backward compatibility
export async function askRoma(input) {
  try {
    // Convert input to messages format for ROMA
    const messages = [
      { role: "system", content: "You are a veterinary reasoning agent." },
      { role: "user", content: input }
    ];
    return await reason(messages);
  } catch (e) {
    return { ok: false, error: e.message };
  }
}