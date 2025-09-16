const axios = require("axios");
const ROMA_HOST = process.env.ROMA_HOST || "roma";
const ROMA_PORT = process.env.ROMA_PORT || 8001;
const BASE = `http://${ROMA_HOST}:${ROMA_PORT}`;

async function health() {
  const r = await axios.get(`${BASE}/health`, { timeout: 2000 });
  return r.data;
}

async function reason(messages) {
  const r = await axios.post(`${BASE}/reason`, { messages }, { timeout: 15000 });
  return r.data;
}

module.exports = { health, reason };