import type { Express } from "express";
import { storage } from "./storage";
import { petAssessmentSchema } from "../shared/schema";

// Triage rules ported from Python backend
const TRIAGE_RULES = {
  emergency_keywords: [
    "bleeding", "choking", "collapsed", "seizure", "poison",
    "breathing", "blue gums", "pale gums", "heatstroke",
    "cant urinate", "cannot urinate", "blocked",
    "struggling to breathe", "hit by car"
  ],
  see_vet_soon_keywords: [
    "lethargic", "not eating", "not drinking", "vomiting", "appetite",
    "diarrhea", "pain", "limping", "cough", "itching", "rash"
  ]
};

function classifySymptoms(text: string): "emergency" | "see_vet_soon" | "ok" {
  const lowerText = text.toLowerCase();
  
  for (const keyword of TRIAGE_RULES.emergency_keywords) {
    if (lowerText.includes(keyword)) {
      return "emergency";
    }
  }
  
  for (const keyword of TRIAGE_RULES.see_vet_soon_keywords) {
    if (lowerText.includes(keyword)) {
      return "see_vet_soon";
    }
  }
  
  return "ok";
}

function generateAdvice(query: string) {
  const status = classifySymptoms(query);
  const lowerQuery = query.toLowerCase();
  
  // Emergency detection with immediate escalation
  if (status === "emergency") {
    return {
      triage: "emergency" as const,
      summary: "Emergency situation detected requiring immediate veterinary attention.",
      advice: ["This is an emergency. Go to the nearest emergency vet now."],
      when_to_see_vet: "Immediately",
      disclaimer: "Information only. Not a diagnosis."
    };
  }

  let steps: string[] = [];
  let when = "";

  // Hardcoded advice system for common issues
  if (lowerQuery.includes("diarrhea")) {
    steps = [
      "Offer small amounts of water often to prevent dehydration",
      "Withhold food for 8–12 hours if adult and otherwise healthy",
      "Reintroduce bland diet: boiled rice with plain chicken, small portions",
      "Keep the litter box or yard clean to monitor frequency and consistency"
    ];
    when = "See a vet if diarrhea lasts beyond 24–48 hours, there is blood, or your pet becomes weak";
  } else if (lowerQuery.includes("vomit")) {
    steps = [
      "Remove food for 8–12 hours; allow small sips of water",
      "If no more vomiting, start small bland meals after fasting period",
      "Avoid fatty or new foods for 48 hours to prevent further upset"
    ];
    when = "See a vet if vomiting repeats, there is blood, your pet is lethargic, or not drinking";
  } else if (lowerQuery.includes("not eating") || lowerQuery.includes("appetite")) {
    steps = [
      "Ensure fresh water is always available",
      "Try warming the food slightly to enhance aroma",
      "Offer high-value treats or favorite foods in small amounts",
      "Check for any obvious mouth pain or dental issues"
    ];
    when = "See a vet if loss of appetite continues beyond 24 hours or if accompanied by lethargy";
  } else {
    steps = [
      "Monitor appetite, water intake, energy levels, and bathroom habits closely",
      "Provide a quiet, comfortable place for your pet to rest",
      "Avoid new foods or treats for 24 hours to rule out dietary causes",
      "Take photos or videos of symptoms to show your veterinarian if needed"
    ];
    when = "See a vet if symptoms persist beyond 24–48 hours or your pet seems worse";
  }

  return {
    triage: status,
    summary: "Pet issue assessed and guidance provided based on symptoms described.",
    advice: steps,
    when_to_see_vet: when,
    disclaimer: "Information only. Not a diagnosis."
  };
}

export function registerApiRoutes(app: Express): void {
  // Pet assessment endpoint
  app.post("/api/assess", async (req, res) => {
    try {
      const { petType, petAge, symptoms } = petAssessmentSchema.parse(req.body);
      
      // Generate triage response
      const triageResult = generateAdvice(symptoms);
      
      // Store assessment
      const assessment = await storage.createAssessment({
        petType,
        petAge,
        symptoms,
        triage: triageResult.triage,
        advice: triageResult.advice,
      });

      res.json({
        id: assessment.id,
        ...triageResult
      });
    } catch (error) {
      console.error("Assessment error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid request" 
      });
    }
  });

  // Get assessment by ID
  app.get("/api/assessment/:id", async (req, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      console.error("Get assessment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}