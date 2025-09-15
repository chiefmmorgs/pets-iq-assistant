import { triageResponseSchema, type TriageResponse } from "@shared/schema";
import { spawn } from "child_process";

// Type for enhanced veterinary data from VetDataHub
type EnhancedVetData = {
  breedInfo: any | null;
  symptomPatterns: any[];
  knowledgeBase: any[];
} | null;

// ROMA-powered advice generation service
export async function generateROMAAdvice(
  petType: string,
  petAge: string,
  symptoms: string,
  enhancedData?: EnhancedVetData
): Promise<TriageResponse> {
  try {
    // Call our Python ROMA service with enhanced context
    const romaResponse = await callROMAPythonService(petType, petAge, symptoms, enhancedData);
    
    if (romaResponse) {
      return triageResponseSchema.parse(romaResponse);
    }
    
    // Fallback to local processing if ROMA service is unavailable
    console.log("ROMA service unavailable, using local processing with enhanced data");
    return generateLocalAdvice(petType, petAge, symptoms, enhancedData);
  } catch (error) {
    console.error("ROMA service error:", error);
    return generateLocalAdvice(petType, petAge, symptoms, enhancedData);
  }
}

async function callROMAPythonService(petType: string, petAge: string, symptoms: string, enhancedData?: EnhancedVetData): Promise<any> {
  try {
    // First, try to get ML predictions from our FastAPI service
    const mlPredictions = await callMLService(petType, symptoms);
    
    // Prepare enhanced context for ROMA service
    const payload: any = {
      pet_type: petType,
      pet_age: petAge,
      symptoms: symptoms,
      ml_predictions: mlPredictions
    };
    
    // Add enhanced veterinary context if available
    if (enhancedData) {
      payload.enhanced_context = {
        breed_info: enhancedData.breedInfo,
        symptom_patterns: enhancedData.symptomPatterns,
        knowledge_base: enhancedData.knowledgeBase
      };
    }
    
    // For now, use the ML predictions to enhance our local processing
    // Later this could be expanded to call an actual external ROMA service
    if (mlPredictions) {
      return await generateEnhancedAdviceWithML(petType, petAge, symptoms, mlPredictions, enhancedData);
    }
    
    return null;
  } catch (error) {
    console.log("Failed to connect to ROMA service:", error);
    return null;
  }
}

async function callMLService(petType: string, symptoms: string): Promise<any> {
  try {
    // Convert symptoms to array format
    const symptomsArray = symptoms.toLowerCase().split(/[,\s]+/).filter(s => s.length > 2);
    
    const response = await fetch('http://localhost:8001/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symptoms: symptomsArray,
        pet_type: petType
      })
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.log("ML service responded with error:", response.status);
      return null;
    }
  } catch (error) {
    console.log("Failed to connect to ML service:", error);
    return null;
  }
}

async function generateEnhancedAdviceWithML(
  petType: string, 
  petAge: string, 
  symptoms: string, 
  mlPredictions: any, 
  enhancedData?: EnhancedVetData
): Promise<any> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    console.log("OpenAI API key not available, using ML predictions only");
    return generateMLBasedResponse(petType, petAge, symptoms, mlPredictions, enhancedData);
  }

  try {
    // Use OpenAI to create empathetic, grounded responses based on ML predictions
    const prompt = `You are a professional veterinary assistant. Based on the ML model predictions and clinical data provided, create a compassionate and helpful response for a pet owner.

Pet Information:
- Type: ${petType}
- Age: ${petAge}
- Symptoms: ${symptoms}

ML Model Predictions:
${JSON.stringify(mlPredictions, null, 2)}

Enhanced Veterinary Data:
${enhancedData ? JSON.stringify(enhancedData, null, 2) : 'None available'}

Please provide a response in this exact JSON format:
{
  "triage": "emergency" | "see_vet_soon" | "ok",
  "summary": "Brief, reassuring summary of the situation",
  "advice": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "when_to_see_vet": "Clear guidance on when veterinary care is needed",
  "disclaimer": "This information is for guidance only and is not a substitute for professional veterinary advice."
}

Guidelines:
- Use the ML predictions as the foundation for your assessment
- Be empathetic and reassuring while being medically accurate
- Provide 4-6 specific, actionable steps
- If ML predictions indicate high-risk diseases, set triage to "emergency" or "see_vet_soon"
- Include breed-specific advice if available in enhanced data
- Never contradict the ML model's disease predictions
- Keep language simple and supportive for worried pet owners`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (response.ok) {
      const openaiResponse = await response.json();
      const aiAdvice = JSON.parse(openaiResponse.choices[0].message.content);
      
      // Add ML prediction details for transparency
      aiAdvice.ml_insights = {
        top_predictions: mlPredictions.predictions?.slice(0, 2) || [],
        confidence_level: mlPredictions.confidence_scores?.[0] || 0
      };
      
      return aiAdvice;
    } else {
      console.log("OpenAI API error:", response.status);
      return generateMLBasedResponse(petType, petAge, symptoms, mlPredictions, enhancedData);
    }
  } catch (error) {
    console.log("OpenAI integration error:", error);
    return generateMLBasedResponse(petType, petAge, symptoms, mlPredictions, enhancedData);
  }
}

function generateMLBasedResponse(
  petType: string, 
  petAge: string, 
  symptoms: string, 
  mlPredictions: any, 
  enhancedData?: EnhancedVetData
): any {
  // Fallback response using ML predictions
  const topPrediction = mlPredictions.predictions?.[0];
  const confidence = mlPredictions.confidence_scores?.[0] || 0;
  
  let triage: "emergency" | "see_vet_soon" | "ok" = "ok";
  if (topPrediction?.urgency === "emergency" || confidence > 0.8) {
    triage = "emergency";
  } else if (topPrediction?.urgency === "moderate" || confidence > 0.5) {
    triage = "see_vet_soon";
  }
  
  const summary = topPrediction 
    ? `Based on the symptoms, your ${petType} may have ${topPrediction.disease} (${Math.round(confidence * 100)}% confidence).`
    : `Your ${petType}'s symptoms require careful monitoring and assessment.`;
  
  const advice = mlPredictions.recommended_actions || [
    "Monitor your pet closely for any changes",
    "Ensure fresh water is available",
    "Keep your pet comfortable and calm",
    "Document any new symptoms"
  ];
  
  return {
    triage,
    summary,
    advice,
    when_to_see_vet: triage === "emergency" 
      ? "Seek immediate veterinary care" 
      : "Contact your veterinarian if symptoms persist or worsen",
    disclaimer: "This information is for guidance only and is not a substitute for professional veterinary advice.",
    ml_insights: {
      top_predictions: mlPredictions.predictions || [],
      confidence_level: confidence
    }
  };
}

function generateLocalAdvice(petType: string, petAge: string, symptoms: string, enhancedData?: EnhancedVetData): TriageResponse {
  // Local fallback processing
  const lowerSymptoms = symptoms.toLowerCase();
    
    // Emergency detection logic
    const emergencyKeywords = [
      "bleeding", "choking", "collapsed", "seizure", "poison",
      "breathing", "blue gums", "pale gums", "heatstroke",
      "cant urinate", "cannot urinate", "blocked",
      "struggling to breathe", "hit by car"
    ];

    const urgentKeywords = [
      "lethargic", "not eating", "not drinking", "vomiting", "appetite",
      "diarrhea", "pain", "limping", "cough", "itching", "rash"
    ];

    let triage: "emergency" | "see_vet_soon" | "ok" = "ok";
    
    for (const keyword of emergencyKeywords) {
      if (lowerSymptoms.includes(keyword)) {
        triage = "emergency";
        break;
      }
    }
    
    if (triage !== "emergency") {
      for (const keyword of urgentKeywords) {
        if (lowerSymptoms.includes(keyword)) {
          triage = "see_vet_soon";
          break;
        }
      }
    }

    // Generate contextual advice based on pet type, age, symptoms, and enhanced VetDataHub data
    let advice: string[] = [];
    let when_to_see_vet = "";
    let summary = "";

    // Check for enhanced VetDataHub insights first
    let enhancedAdvice: string[] = [];
    if (enhancedData) {
      // Add breed-specific insights
      if (enhancedData.breedInfo) {
        const breedConditions = enhancedData.breedInfo.commonConditions || [];
        if (breedConditions.length > 0) {
          enhancedAdvice.push(`🧬 ${enhancedData.breedInfo.breed}s are prone to: ${breedConditions.join(', ')}`);
        }
        if (enhancedData.breedInfo.vetAdvice) {
          enhancedAdvice.push(`📋 Breed-specific note: ${enhancedData.breedInfo.vetAdvice}`);
        }
      }

      // Add symptom pattern insights
      for (const pattern of enhancedData.symptomPatterns || []) {
        if (pattern.triageAdvice) {
          enhancedAdvice.push(`⚕️ ${pattern.triageAdvice}`);
        }
        if (pattern.severity === 'emergency' && triage !== 'emergency') {
          triage = 'emergency'; // Upgrade triage based on VetDataHub data
        }
      }

      // Add relevant knowledge base insights
      for (const knowledge of enhancedData.knowledgeBase?.slice(0, 2) || []) {
        if (knowledge.content?.treatment) {
          enhancedAdvice.push(`💡 Treatment insight: ${knowledge.content.treatment}`);
        }
      }
    }

    if (triage === "emergency") {
      summary = "Emergency situation detected requiring immediate veterinary attention.";
      advice = ["This is an emergency. Go to the nearest emergency vet now."];
      when_to_see_vet = "Immediately";
    } else if (lowerSymptoms.includes("diarrhea")) {
      summary = `${petType} experiencing digestive issues that need monitoring and care.`;
      advice = [
        "Offer small amounts of water frequently to prevent dehydration",
        "Withhold food for 8-12 hours if adult and otherwise healthy",
        "Gradually reintroduce bland diet: boiled rice with plain chicken",
        "Monitor frequency and consistency of bowel movements"
      ];
      when_to_see_vet = "See a vet if diarrhea lasts beyond 24-48 hours, contains blood, or your pet becomes weak";
    } else if (lowerSymptoms.includes("vomit")) {
      summary = `${petType} showing signs of nausea/digestive upset requiring careful monitoring.`;
      advice = [
        "Remove food for 8-12 hours; allow small sips of water",
        "After fasting, offer small bland meals every few hours",
        "Avoid fatty foods and new treats for 48 hours",
        "Monitor for signs of dehydration or lethargy"
      ];
      when_to_see_vet = "See a vet if vomiting repeats, contains blood, or your pet becomes lethargic";
    } else if (lowerSymptoms.includes("not eating") || lowerSymptoms.includes("appetite")) {
      summary = `Loss of appetite in ${petAge} ${petType} requires attention and monitoring.`;
      advice = [
        "Ensure fresh water is always available",
        "Try warming food slightly to enhance aroma and palatability",
        "Offer high-value treats or favorite foods in small amounts",
        "Check for signs of mouth pain or dental discomfort"
      ];
      when_to_see_vet = "See a vet if appetite loss continues beyond 24 hours or is accompanied by lethargy";
    } else {
      summary = `General health concern for ${petAge} ${petType} requiring observation.`;
      advice = [
        "Monitor appetite, water intake, energy levels, and bathroom habits",
        "Provide a quiet, comfortable environment for rest",
        "Avoid introducing new foods or treats for 24-48 hours",
        "Document symptoms with photos/videos if possible"
      ];
      when_to_see_vet = "See a vet if symptoms persist beyond 24-48 hours or worsen";
    }

    // Append enhanced VetDataHub insights to advice
    if (enhancedAdvice.length > 0) {
      advice = [...advice, ...enhancedAdvice];
    }

    const response: TriageResponse = {
      triage,
      summary,
      advice,
      when_to_see_vet,
      disclaimer: "Information only. Not a diagnosis."
    };

    return triageResponseSchema.parse(response);
}