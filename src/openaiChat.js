import OpenAI from "openai";

const ASSESSMENT_SCHEMA = {
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "maxLength": 150,
      "description": "Short, caring response explaining the condition"
    },
    "category": {
      "type": "string",
      "enum": ["gastrointestinal", "musculoskeletal", "respiratory", "urinary", "dermatological", "neurological", "emergency", "general"]
    },
    "disease": {
      "type": "string",
      "description": "Most likely condition name"
    },
    "signals": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "present": {"type": "boolean"},
          "weight": {"type": "integer", "minimum": 1, "maximum": 10}
        },
        "required": ["name", "present", "weight"]
      }
    },
    "differentials": {
      "type": "array",
      "maxItems": 3,
      "items": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "why": {"type": "string", "maxLength": 50}
        },
        "required": ["name", "why"]
      }
    },
    "triage": {
      "type": "string",
      "enum": ["emergency", "urgent", "home"]
    },
    "red_flags": {
      "type": "array",
      "maxItems": 4,
      "items": {"type": "string"}
    },
    "actions": {
      "type": "array",
      "maxItems": 5,
      "items": {"type": "string", "maxLength": 100}
    },
    "confidence": {
      "type": "number",
      "minimum": 0.1,
      "maximum": 0.9
    }
  },
  "required": ["message", "category", "disease", "signals", "differentials", "triage", "red_flags", "actions", "confidence"]
};

const SYSTEM_PROMPT = `You are an empathetic veterinary assistant. You must analyze the symptoms and return structured JSON only.

Rules:
- Use the provided signal analysis (marked as present/absent) as your foundation
- Triage: emergency if red flags or severe distress, urgent if pain/concerning symptoms, home otherwise  
- Keep message empathetic but under 150 characters
- Actions should be safe, practical steps - no medications
- Be conservative with triage - when in doubt, escalate
- Return only valid JSON matching the required schema`;

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
      temperature: 0.2,
      max_tokens: 400,
      response_format: { 
        type: "json_schema", 
        json_schema: {
          name: "veterinary_assessment",
          schema: ASSESSMENT_SCHEMA
        }
      }
    });

    const rawResponse = resp.choices?.[0]?.message?.content?.trim();
    if (!rawResponse) {
      return fallback(knowledgeBaseContext);
    }
    
    try {
      const parsedResponse = JSON.parse(rawResponse);
      
      // Use knowledge base data as foundation, override confidence with our calculation
      return {
        message: parsedResponse.message || "Assessment completed. Please review recommendations below.",
        category: knowledgeBaseContext?.category || parsedResponse.category || "general",
        disease: knowledgeBaseContext?.disease || parsedResponse.disease || "unspecified condition",
        signals: knowledgeBaseContext?.signals || parsedResponse.signals || [],
        differentials: parsedResponse.differentials || knowledgeBaseContext?.differentials || [],
        triage: knowledgeBaseContext?.triage || parsedResponse.triage || "home",
        red_flags: knowledgeBaseContext?.red_flags || parsedResponse.red_flags || [],
        actions: parsedResponse.actions || knowledgeBaseContext?.actions || ["Monitor your pet and contact a vet if symptoms worsen"],
        confidence: knowledgeBaseContext?.confidence || 0.5 // Always use our calculated confidence
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