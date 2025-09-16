import OpenAI from "openai";

const SYSTEM_PROMPT =
  "You are an empathetic veterinary assistant. You do not replace vets. Explain risks clearly, keep answers short, end with next steps. Triage: emergency = go now. see_soon = 24–48h. general = monitor at home. Avoid certainty. Use simple language.";

export async function vetChat(apiKey, userText, species, age, predicted, triage) {
  if (!apiKey) {
    return fallback(predicted, triage);
  }
  const openai = new OpenAI({ apiKey });
  const content = [
    `Symptoms: ${userText}`,
    species ? `Species: ${species}` : "",
    age ? `Age: ${age}` : "",
    `Model: ${predicted}`,
    `Triage: ${triage}`
  ].filter(Boolean).join("\n");

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content }
    ],
    temperature: 0.4,
    max_tokens: 350
  });

  return resp.choices?.[0]?.message?.content?.trim() || fallback(predicted, triage);
}

export function fallback(predicted, triage) {
  const tri =
    triage === "emergency" ? "Seek a vet now." :
    triage === "see_soon" ? "See a vet within 24–48h." :
    "Home care and monitor.";
  return `Preliminary impression: ${predicted} (${triage}). ${tri}`;
}