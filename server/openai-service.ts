import OpenAI from "openai";
import { triageResponseSchema, type TriageResponse } from "@shared/schema";

// Using OpenAI integration - the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAIAdvice(
  petType: string,
  petAge: string,
  symptoms: string
): Promise<TriageResponse> {
  try {
    const prompt = `You are a skilled veterinary assistant providing initial triage guidance for pet owners. Analyze the following case and provide structured advice.

Pet Details:
- Type: ${petType}
- Age: ${petAge}
- Symptoms: ${symptoms}

Please assess the urgency level and provide guidance:

1. TRIAGE LEVEL - Classify as exactly one of:
   - "emergency" - Immediate life-threatening conditions requiring immediate emergency vet visit
   - "see_vet_soon" - Non-emergency issues that need veterinary attention within 24-48 hours
   - "ok" - Minor issues that can be monitored at home with basic care

2. SUMMARY - Brief description of the assessment

3. ADVICE - Provide 3-5 practical, actionable steps for immediate care

4. WHEN_TO_SEE_VET - Specific guidance about when veterinary care is needed

5. DISCLAIMER - Always include a disclaimer about this being informational only

Emergency keywords to watch for: bleeding, choking, collapsed, seizure, poison, breathing difficulties, blue/pale gums, heatstroke, urinary blockage, hit by car, struggling to breathe

Respond in JSON format matching this structure:
{
  "triage": "emergency|see_vet_soon|ok",
  "summary": "Brief assessment description",
  "advice": ["Step 1", "Step 2", "Step 3"],
  "when_to_see_vet": "Specific guidance on timing",
  "disclaimer": "Information only. Not a diagnosis."
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a veterinary assistant AI providing triage advice. Always respond with valid JSON in the exact format requested. Be thorough but concise."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent medical advice
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse and validate the response
    const parsedResponse = JSON.parse(content);
    const validatedResponse = triageResponseSchema.parse(parsedResponse);

    return validatedResponse;
  } catch (error) {
    console.error("OpenAI service error:", error);
    
    // Fallback to conservative emergency response if OpenAI fails
    return {
      triage: "see_vet_soon",
      summary: "Unable to process assessment at this time. Please consult with a veterinarian for proper evaluation.",
      advice: [
        "Monitor your pet closely for any changes in condition",
        "Ensure your pet has access to fresh water",
        "Contact your veterinarian for professional assessment",
        "If symptoms worsen, seek immediate veterinary care"
      ],
      when_to_see_vet: "Contact your veterinarian as soon as possible for proper evaluation",
      disclaimer: "Information only. Not a diagnosis."
    };
  }
}