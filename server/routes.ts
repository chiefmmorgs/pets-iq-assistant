import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { petAssessmentSchema } from "@shared/schema";
import { generateROMAAdvice } from "./roma-service";
import { integrateVetDataHub, getEnhancedTriageData } from "./vetdatahub-integration";

export function registerRoutes(app: Express): Server {
  // Pet assessment endpoint
  app.post("/api/assess", async (req, res) => {
    try {
      const { petType, petAge, symptoms } = petAssessmentSchema.parse(req.body);
      
      // Get enhanced veterinary data from VetDataHub integration
      const symptomWords = symptoms.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const enhancedData = await getEnhancedTriageData(petType, symptomWords);
      
      // Generate ROMA-powered triage response with enhanced context
      const triageResult = await generateROMAAdvice(petType, petAge, symptoms, enhancedData);
      
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
        ...triageResult,
        // Include enhanced data info for debugging (optional)
        ...(enhancedData && {
          enhancedDataUsed: {
            breedInfo: !!enhancedData.breedInfo,
            symptomPatterns: enhancedData.symptomPatterns?.length || 0,
            knowledgeBase: enhancedData.knowledgeBase?.length || 0
          }
        })
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

  // VetDataHub Integration Routes
  
  // Populate database with VetDataHub data (Development only - remove in production)
  app.post("/api/vetdatahub/integrate", async (req, res) => {
    // Security: Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        message: "VetDataHub integration is only available in development mode" 
      });
    }

    try {
      console.log("🚀 Starting VetDataHub integration...");
      const result = await integrateVetDataHub();
      
      if (result.success) {
        res.json({ 
          message: "VetDataHub integration completed successfully!",
          details: result.message 
        });
      } else {
        res.status(500).json({ 
          message: "VetDataHub integration failed",
          error: result.error 
        });
      }
    } catch (error) {
      console.error("VetDataHub integration error:", error);
      res.status(500).json({ 
        message: "Internal server error during VetDataHub integration",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get enhanced triage data (for debugging/testing)
  app.post("/api/vetdatahub/triage", async (req, res) => {
    try {
      const { petType, symptoms, breed } = req.body;
      
      if (!petType || !symptoms) {
        return res.status(400).json({ message: "petType and symptoms are required" });
      }
      
      const enhancedData = await getEnhancedTriageData(
        petType,
        Array.isArray(symptoms) ? symptoms : [symptoms],
        breed
      );
      
      res.json(enhancedData || { message: "No enhanced data available" });
    } catch (error) {
      console.error("Enhanced triage data error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
