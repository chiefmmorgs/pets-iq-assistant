import OpenAI from "openai";

const SYSTEM_PROMPT = `You are an empathetic veterinary assistant helping pet owners understand their pet's symptoms. 
You must return ONLY valid JSON in the exact format specified below. Do not add any text outside the JSON.

Return a JSON object with these exact fields:
{
  "message": "A short, caring response explaining the condition in simple terms",
  "category": "the medical category (gastrointestinal, musculoskeletal, etc.)",
  "disease": "the most likely condition name",
  "signals": [{"name": "symptom name", "present": true/false, "weight": number}],
  "differentials": [{"name": "alternative condition", "why": "brief reason"}],
  "triage": "emergency, urgent, or home",
  "red_flags": ["any concerning signs found"],
  "actions": ["specific steps pet owner should take"],
  "confidence": number between 0.1 and 1.0
}

Rules:
- Triage: emergency if red flags or severe distress, urgent if pain/concerning symptoms, home otherwise
- Keep message under 150 characters and empathetic
- Actions should be safe, practical steps - no medications
- Be conservative with triage - when in doubt, escalate
- Confidence based on symptom clarity and match`;

export async function vetChat(apiKey, userText, species, age, knowledgeBaseContext) {
  if (!apiKey) {
    return fallback(knowledgeBaseContext);
  }
  
  const openai = new OpenAI({ apiKey });
  const content = [
    `Pet Information:`,
    `Species: ${species || 'not specified'}`,
    `Age: ${age || 'not specified'}`,
    `Symptoms: ${userText}`,
    ``,
    `Knowledge Base Context:`,
    JSON.stringify(knowledgeBaseContext, null, 2)
  ].join("\n");

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const rawResponse = resp.choices?.[0]?.message?.content?.trim();
    if (!rawResponse) {
      return fallback(knowledgeBaseContext);
    }
    
    try {
      const parsedResponse = JSON.parse(rawResponse);
      
      // Validate and sanitize the response
      return {
        message: parsedResponse.message || "Assessment completed. Please review recommendations below.",
        category: parsedResponse.category || knowledgeBaseContext?.category || "general",
        disease: parsedResponse.disease || knowledgeBaseContext?.disease || "unspecified condition",
        signals: parsedResponse.signals || knowledgeBaseContext?.signals || [],
        differentials: parsedResponse.differentials || [],
        triage: parsedResponse.triage || knowledgeBaseContext?.triage || "home",
        red_flags: parsedResponse.red_flags || knowledgeBaseContext?.red_flags || [],
        actions: parsedResponse.actions || knowledgeBaseContext?.actions || ["Monitor your pet and contact a vet if symptoms worsen"],
        confidence: Math.max(0.1, Math.min(1.0, parsedResponse.confidence || knowledgeBaseContext?.confidence || 0.5))
      };
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      return fallback(knowledgeBaseContext);
    }
  } catch (error) {
    console.error("OpenAI API error:", error.message);
    return fallback(knowledgeBaseContext);
  }
}

export function fallback(knowledgeBaseContext) {
  const category = knowledgeBaseContext?.category || "general";
  const disease = knowledgeBaseContext?.disease || "general concern";
  const triage = knowledgeBaseContext?.triage || "home";
  const confidence = knowledgeBaseContext?.confidence || 0.6;
  
  const triageMessage = 
    triage === "emergency" ? "Please seek veterinary care immediately." :
    triage === "urgent" ? "Schedule a vet visit within 24-48 hours." :
    "Monitor your pet at home and contact a vet if symptoms worsen.";
  
  return {
    message: `Based on the symptoms, this appears to be a ${disease}. ${triageMessage}`,
    category,
    disease,
    signals: knowledgeBaseContext?.signals || [],
    differentials: knowledgeBaseContext?.differentials || [],
    triage,
    red_flags: knowledgeBaseContext?.red_flags || [],
    actions: knowledgeBaseContext?.actions || ["Monitor your pet closely", "Provide comfort and rest", "Contact a vet if symptoms worsen"],
    confidence
  };
}