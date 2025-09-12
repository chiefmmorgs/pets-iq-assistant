#!/usr/bin/env python3
"""
Veterinary ROMA Service - A specialized agent for veterinary triage and advice.
This service uses ROMA's recursive meta-agent framework to provide sophisticated 
veterinary guidance by breaking down complex pet health assessments into specialized subtasks.
"""

import asyncio
import json
import sys
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

app = FastAPI(title="Veterinary ROMA Service", version="1.0.0")

# Enable CORS for integration with Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class VeterinaryAssessmentRequest(BaseModel):
    pet_type: str = Field(..., description="Type of pet (dog, cat, bird, etc.)")
    pet_age: str = Field(..., description="Age of the pet")
    symptoms: str = Field(..., description="Detailed description of symptoms")

class VeterinaryResponse(BaseModel):
    triage: str = Field(..., description="Triage level: emergency, see_vet_soon, or ok")
    summary: str = Field(..., description="Brief assessment summary")
    advice: List[str] = Field(..., description="Specific care instructions")
    when_to_see_vet: str = Field(..., description="Guidance on when to seek veterinary care")
    disclaimer: str = Field(..., description="Medical disclaimer")

class VeterinaryROMAgent:
    """
    ROMA-inspired veterinary agent that uses hierarchical task decomposition
    for comprehensive pet health assessment.
    """
    
    def __init__(self):
        self.emergency_keywords = [
            "bleeding", "choking", "collapsed", "seizure", "poison",
            "breathing", "blue gums", "pale gums", "heatstroke", 
            "cant urinate", "cannot urinate", "blocked",
            "struggling to breathe", "hit by car", "trauma",
            "unconscious", "severe pain", "swollen abdomen"
        ]
        
        self.urgent_keywords = [
            "lethargic", "not eating", "not drinking", "vomiting", "appetite",
            "diarrhea", "pain", "limping", "cough", "itching", "rash",
            "difficulty walking", "excessive drooling", "hiding",
            "behavioral changes", "fever", "shaking", "disoriented"
        ]
    
    async def assess_case(self, pet_type: str, pet_age: str, symptoms: str) -> VeterinaryResponse:
        """
        Main assessment method using ROMA-style recursive problem solving.
        """
        # Step 1: Atomization - Determine if this is a simple or complex case
        is_atomic = await self._atomize_case(symptoms)
        
        if is_atomic:
            # Simple case - direct execution
            return await self._execute_simple_assessment(pet_type, pet_age, symptoms)
        else:
            # Complex case - planning and decomposition
            return await self._plan_and_execute_complex_assessment(pet_type, pet_age, symptoms)
    
    async def _atomize_case(self, symptoms: str) -> bool:
        """
        Atomizer: Determines if the case is simple enough for direct assessment
        or requires planning and decomposition.
        """
        symptoms_lower = symptoms.lower()
        
        # Emergency cases are atomic - immediate response needed
        for keyword in self.emergency_keywords:
            if keyword in symptoms_lower:
                return True
        
        # Simple single-symptom cases are atomic
        symptom_indicators = ["diarrhea", "vomiting", "not eating", "limping", "cough"]
        single_symptoms = sum(1 for indicator in symptom_indicators if indicator in symptoms_lower)
        
        if single_symptoms <= 1:
            return True
            
        # Multiple symptoms or complex descriptions require planning
        return False
    
    async def _execute_simple_assessment(self, pet_type: str, pet_age: str, symptoms: str) -> VeterinaryResponse:
        """
        Executor: Handle atomic/simple cases directly.
        """
        symptoms_lower = symptoms.lower()
        
        # Emergency detection
        for keyword in self.emergency_keywords:
            if keyword in symptoms_lower:
                return VeterinaryResponse(
                    triage="emergency",
                    summary="Emergency situation detected requiring immediate veterinary attention.",
                    advice=["This is an emergency. Go to the nearest emergency vet NOW."],
                    when_to_see_vet="Immediately - do not delay",
                    disclaimer="Information only. Not a diagnosis."
                )
        
        # Single symptom cases
        if "diarrhea" in symptoms_lower:
            return self._generate_diarrhea_advice(pet_type, pet_age)
        elif "vomit" in symptoms_lower:
            return self._generate_vomiting_advice(pet_type, pet_age)
        elif "not eating" in symptoms_lower or "appetite" in symptoms_lower:
            return self._generate_appetite_advice(pet_type, pet_age)
        elif "limping" in symptoms_lower:
            return self._generate_limping_advice(pet_type, pet_age)
        elif "cough" in symptoms_lower:
            return self._generate_cough_advice(pet_type, pet_age)
        else:
            return self._generate_general_advice(pet_type, pet_age, symptoms)
    
    async def _plan_and_execute_complex_assessment(self, pet_type: str, pet_age: str, symptoms: str) -> VeterinaryResponse:
        """
        Planner + Aggregator: Handle complex cases through task decomposition.
        """
        # Planning phase: Break down the assessment into subtasks
        subtasks = await self._plan_assessment_subtasks(symptoms)
        
        # Execution phase: Process each subtask
        subtask_results = []
        for subtask in subtasks:
            result = await self._execute_subtask(pet_type, pet_age, subtask)
            subtask_results.append(result)
        
        # Aggregation phase: Combine results into comprehensive assessment
        return await self._aggregate_assessment_results(pet_type, pet_age, symptoms, subtask_results)
    
    async def _plan_assessment_subtasks(self, symptoms: str) -> List[str]:
        """
        Planning component: Break complex symptoms into analyzable components.
        """
        symptoms_lower = symptoms.lower()
        subtasks = []
        
        # Analyze each symptom category
        if any(word in symptoms_lower for word in ["diarrhea", "bowel", "stool"]):
            subtasks.append("digestive_assessment")
        
        if any(word in symptoms_lower for word in ["vomit", "nausea", "stomach"]):
            subtasks.append("gastrointestinal_assessment")
        
        if any(word in symptoms_lower for word in ["limping", "walking", "leg", "movement"]):
            subtasks.append("mobility_assessment")
        
        if any(word in symptoms_lower for word in ["breathing", "cough", "respiratory"]):
            subtasks.append("respiratory_assessment")
        
        if any(word in symptoms_lower for word in ["lethargic", "energy", "tired", "behavior"]):
            subtasks.append("behavioral_assessment")
        
        # Always include general health assessment for complex cases
        subtasks.append("general_health_assessment")
        
        return subtasks
    
    async def _execute_subtask(self, pet_type: str, pet_age: str, subtask: str) -> Dict[str, Any]:
        """
        Execute individual assessment subtasks.
        """
        if subtask == "digestive_assessment":
            return {
                "area": "digestive",
                "advice": [
                    "Monitor bowel movements frequency and consistency",
                    "Ensure adequate hydration with small, frequent water offerings",
                    "Consider temporary fasting if adult pet (12-24 hours)"
                ],
                "urgency": "moderate"
            }
        
        elif subtask == "gastrointestinal_assessment":
            return {
                "area": "gastrointestinal", 
                "advice": [
                    "Withhold food for 8-12 hours to rest the stomach",
                    "Offer small amounts of water frequently",
                    "Introduce bland diet gradually after fasting period"
                ],
                "urgency": "moderate"
            }
        
        elif subtask == "mobility_assessment":
            return {
                "area": "mobility",
                "advice": [
                    "Restrict activity and encourage rest",
                    "Avoid stairs and jumping",
                    "Apply cold compress if there's visible swelling (15 min on/off)"
                ],
                "urgency": "moderate"
            }
        
        elif subtask == "respiratory_assessment":
            return {
                "area": "respiratory",
                "advice": [
                    "Monitor breathing rate and effort",
                    "Ensure good air circulation in resting area",
                    "Keep pet calm and avoid stress"
                ],
                "urgency": "high"
            }
        
        elif subtask == "behavioral_assessment":
            return {
                "area": "behavioral",
                "advice": [
                    "Provide quiet, comfortable environment",
                    "Monitor appetite, water intake, and elimination",
                    "Note any changes in normal routines"
                ],
                "urgency": "moderate"
            }
        
        else:  # general_health_assessment
            return {
                "area": "general",
                "advice": [
                    "Document all symptoms with photos/videos if possible",
                    "Monitor vital signs (breathing, heart rate if possible)",
                    "Keep detailed notes of symptom progression"
                ],
                "urgency": "low"
            }
    
    async def _aggregate_assessment_results(self, pet_type: str, pet_age: str, symptoms: str, subtask_results: List[Dict[str, Any]]) -> VeterinaryResponse:
        """
        Aggregator: Combine subtask results into comprehensive assessment.
        """
        # Determine overall urgency
        urgency_levels = [result.get("urgency", "low") for result in subtask_results]
        
        if "high" in urgency_levels:
            triage = "see_vet_soon"
            when_to_see_vet = "Schedule veterinary appointment within 24 hours"
        elif urgency_levels.count("moderate") >= 2:
            triage = "see_vet_soon" 
            when_to_see_vet = "Schedule veterinary appointment within 24-48 hours"
        else:
            triage = "ok"
            when_to_see_vet = "Monitor symptoms and contact vet if they worsen or persist beyond 48 hours"
        
        # Combine all advice
        all_advice = []
        for result in subtask_results:
            all_advice.extend(result.get("advice", []))
        
        # Remove duplicates while preserving order
        unique_advice = list(dict.fromkeys(all_advice))
        
        summary = f"Comprehensive assessment of {pet_age} {pet_type} with multiple health concerns requiring coordinated care approach."
        
        return VeterinaryResponse(
            triage=triage,
            summary=summary,
            advice=unique_advice,
            when_to_see_vet=when_to_see_vet,
            disclaimer="Information only. Not a diagnosis."
        )
    
    def _generate_diarrhea_advice(self, pet_type: str, pet_age: str) -> VeterinaryResponse:
        return VeterinaryResponse(
            triage="see_vet_soon",
            summary=f"Digestive upset in {pet_age} {pet_type} requiring dietary management and monitoring.",
            advice=[
                "Offer small amounts of water frequently to prevent dehydration",
                "Withhold food for 8-12 hours if adult and otherwise healthy", 
                "Gradually reintroduce bland diet: boiled rice with plain chicken",
                "Monitor frequency and consistency of bowel movements"
            ],
            when_to_see_vet="See vet if diarrhea lasts beyond 24-48 hours, contains blood, or pet becomes weak",
            disclaimer="Information only. Not a diagnosis."
        )
    
    def _generate_vomiting_advice(self, pet_type: str, pet_age: str) -> VeterinaryResponse:
        return VeterinaryResponse(
            triage="see_vet_soon",
            summary=f"Gastrointestinal distress in {pet_age} {pet_type} requiring careful dietary management.",
            advice=[
                "Remove food for 8-12 hours; allow small sips of water",
                "After fasting, offer small bland meals every few hours",
                "Avoid fatty foods and new treats for 48 hours",
                "Monitor for signs of dehydration or continued vomiting"
            ],
            when_to_see_vet="See vet if vomiting repeats, contains blood, or pet becomes lethargic",
            disclaimer="Information only. Not a diagnosis."
        )
    
    def _generate_appetite_advice(self, pet_type: str, pet_age: str) -> VeterinaryResponse:
        return VeterinaryResponse(
            triage="see_vet_soon",
            summary=f"Loss of appetite in {pet_age} {pet_type} requiring attention and monitoring.",
            advice=[
                "Ensure fresh water is always available",
                "Try warming food slightly to enhance aroma and palatability", 
                "Offer high-value treats or favorite foods in small amounts",
                "Check for signs of mouth pain or dental discomfort"
            ],
            when_to_see_vet="See vet if appetite loss continues beyond 24 hours or is accompanied by lethargy",
            disclaimer="Information only. Not a diagnosis."
        )
    
    def _generate_limping_advice(self, pet_type: str, pet_age: str) -> VeterinaryResponse:
        return VeterinaryResponse(
            triage="see_vet_soon", 
            summary=f"Mobility issue in {pet_age} {pet_type} requiring rest and monitoring.",
            advice=[
                "Restrict activity and encourage rest",
                "Avoid stairs, jumping, and excessive movement",
                "Check paws for cuts, foreign objects, or swelling",
                "Apply cold compress if swelling is visible (15 minutes on/off)"
            ],
            when_to_see_vet="See vet if limping persists beyond 24 hours or if pet cannot bear weight",
            disclaimer="Information only. Not a diagnosis."
        )
    
    def _generate_cough_advice(self, pet_type: str, pet_age: str) -> VeterinaryResponse:
        return VeterinaryResponse(
            triage="see_vet_soon",
            summary=f"Respiratory symptoms in {pet_age} {pet_type} requiring monitoring and care.",
            advice=[
                "Monitor breathing rate and effort",
                "Ensure good air circulation in living area",
                "Keep pet calm and avoid stressful situations",
                "Note timing and character of cough (dry, wet, when it occurs)"
            ],
            when_to_see_vet="See vet if cough persists beyond 24 hours or if breathing becomes labored",
            disclaimer="Information only. Not a diagnosis."
        )
    
    def _generate_general_advice(self, pet_type: str, pet_age: str, symptoms: str) -> VeterinaryResponse:
        return VeterinaryResponse(
            triage="ok",
            summary=f"General health concern for {pet_age} {pet_type} requiring observation.",
            advice=[
                "Monitor appetite, water intake, energy levels, and bathroom habits",
                "Provide quiet, comfortable environment for rest",
                "Avoid introducing new foods or treats for 24-48 hours", 
                "Document symptoms with photos/videos if possible"
            ],
            when_to_see_vet="See vet if symptoms persist beyond 24-48 hours or worsen",
            disclaimer="Information only. Not a diagnosis."
        )

# Global agent instance
vet_agent = VeterinaryROMAgent()

@app.post("/assess", response_model=VeterinaryResponse)
async def assess_pet(request: VeterinaryAssessmentRequest):
    """
    Assess pet health using ROMA framework for hierarchical analysis.
    """
    try:
        result = await vet_agent.assess_case(
            pet_type=request.pet_type,
            pet_age=request.pet_age, 
            symptoms=request.symptoms
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Veterinary ROMA Service", "version": "1.0.0"}

if __name__ == "__main__":
    print("🏥 Starting Veterinary ROMA Service...")
    print("🐕 Ready to provide AI-powered veterinary guidance using recursive meta-agent framework")
    uvicorn.run(app, host="0.0.0.0", port=8000)