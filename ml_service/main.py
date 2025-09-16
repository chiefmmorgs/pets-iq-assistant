import os
import json
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from typing import List, Dict, Any
import requests
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Pets ML Service", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SymptomsRequest(BaseModel):
    symptoms: List[str]
    pet_type: str = "dog"

class PredictionResponse(BaseModel):
    predictions: List[Dict[str, Any]]
    confidence_scores: List[float]
    recommended_actions: List[str]

# Global variables for model components
vectorizer = None
classifier = None
label_encoder = None
disease_actions = {}

# Pet disease dataset (simplified for demo)
DISEASE_DATA = {
    "Parvovirus": {
        "symptoms": ["vomiting", "diarrhea", "lethargy", "loss of appetite", "fever", "dehydration"],
        "urgency": "emergency",
        "actions": ["Seek immediate veterinary care", "Keep pet hydrated", "Isolate from other pets"]
    },
    "Kennel Cough": {
        "symptoms": ["dry cough", "honking cough", "retching", "mild fever", "runny nose"],
        "urgency": "moderate",
        "actions": ["Rest and isolation", "Honey for cough relief", "See vet if worsening"]
    },
    "Gastroenteritis": {
        "symptoms": ["vomiting", "diarrhea", "stomach pain", "loss of appetite", "dehydration"],
        "urgency": "moderate",
        "actions": ["Fast for 12-24 hours", "Gradual reintroduction of bland food", "Monitor hydration"]
    },
    "Dental Disease": {
        "symptoms": ["bad breath", "yellow tartar", "difficulty eating", "pawing at mouth", "drooling"],
        "urgency": "low",
        "actions": ["Schedule dental cleaning", "Provide dental chews", "Brush teeth regularly"]
    },
    "Ear Infection": {
        "symptoms": ["head shaking", "ear scratching", "odor from ears", "discharge", "redness"],
        "urgency": "moderate",
        "actions": ["Clean ears gently", "Avoid water in ears", "Veterinary examination needed"]
    },
    "Arthritis": {
        "symptoms": ["limping", "stiffness", "difficulty rising", "reluctance to jump", "decreased activity"],
        "urgency": "low",
        "actions": ["Weight management", "Gentle exercise", "Joint supplements", "Pain management"]
    },
    "Upper Respiratory Infection": {
        "symptoms": ["sneezing", "runny nose", "watery eyes", "coughing", "mild fever"],
        "urgency": "moderate",
        "actions": ["Rest and warmth", "Steam therapy", "Monitor breathing", "Vet visit if severe"]
    },
    "Skin Allergies": {
        "symptoms": ["itching", "red skin", "hair loss", "hot spots", "excessive licking"],
        "urgency": "low",
        "actions": ["Identify allergens", "Oatmeal baths", "Antihistamines", "Dietary changes"]
    }
}

def initialize_model():
    """Initialize and train the ML model with disease data"""
    global vectorizer, classifier, label_encoder, disease_actions
    
    # Prepare training data
    symptoms_list = []
    diseases = []
    actions_map = {}
    
    for disease, data in DISEASE_DATA.items():
        symptom_text = " ".join(data["symptoms"])
        symptoms_list.append(symptom_text)
        diseases.append(disease)
        actions_map[disease] = {
            "actions": data["actions"],
            "urgency": data["urgency"]
        }
    
    # Create additional training samples by combining symptoms
    for disease, data in DISEASE_DATA.items():
        symptoms = data["symptoms"]
        # Create partial symptom combinations
        for i in range(2, min(len(symptoms), 4)):
            symptom_combination = " ".join(symptoms[:i])
            symptoms_list.append(symptom_combination)
            diseases.append(disease)
    
    # Initialize vectorizer and label encoder
    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
    label_encoder = LabelEncoder()
    
    # Transform data
    X = vectorizer.fit_transform(symptoms_list)
    y = label_encoder.fit_transform(diseases)
    
    # Train classifier
    classifier = RandomForestClassifier(n_estimators=100, random_state=42)
    classifier.fit(X, y)
    
    # Store disease actions
    disease_actions = actions_map
    
    print("ML model initialized and trained successfully")

@app.on_event("startup")
async def startup_event():
    """Initialize the ML model on startup"""
    initialize_model()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "pets-ml-service"}

@app.post("/predict", response_model=PredictionResponse)
async def predict_disease(request: SymptomsRequest):
    """Predict diseases based on symptoms"""
    try:
        if not vectorizer or not classifier or not label_encoder:
            raise HTTPException(status_code=500, detail="Model not initialized")
        
        # Prepare symptoms text
        symptoms_text = " ".join(request.symptoms)
        
        if not symptoms_text.strip():
            raise HTTPException(status_code=400, detail="No symptoms provided")
        
        # Vectorize symptoms
        X = vectorizer.transform([symptoms_text])
        
        # Get predictions and probabilities
        predictions = classifier.predict(X)
        probabilities = classifier.predict_proba(X)
        if probabilities is not None and len(probabilities) > 0:
            probabilities = probabilities[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to get prediction probabilities")
        
        # Get all disease classes
        classes = label_encoder.classes_
        
        # Sort by probability and get top predictions
        sorted_indices = np.argsort(probabilities)[::-1]
        top_predictions = []
        confidence_scores = []
        all_actions = []
        
        for i in sorted_indices[:3]:  # Top 3 predictions
            if i < len(classes) and i < len(probabilities):
                disease = classes[i]
                confidence = float(probabilities[i])
            
            if confidence > 0.1:  # Only include predictions with reasonable confidence
                prediction_data = {
                    "disease": disease,
                    "probability": confidence,
                    "urgency": disease_actions.get(disease, {}).get("urgency", "moderate")
                }
                
                top_predictions.append(prediction_data)
                confidence_scores.append(confidence)
                
                # Add recommended actions
                actions = disease_actions.get(disease, {}).get("actions", [])
                all_actions.extend(actions)
        
        # Remove duplicate actions
        unique_actions = list(dict.fromkeys(all_actions))
        
        return PredictionResponse(
            predictions=top_predictions,
            confidence_scores=confidence_scores,
            recommended_actions=unique_actions[:5]  # Limit to top 5 actions
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/diseases")
async def get_diseases():
    """Get list of all known diseases"""
    return {
        "diseases": list(DISEASE_DATA.keys()),
        "total_count": len(DISEASE_DATA)
    }

@app.get("/symptoms")
async def get_symptoms():
    """Get list of all known symptoms"""
    all_symptoms = set()
    for disease_data in DISEASE_DATA.values():
        all_symptoms.update(disease_data["symptoms"])
    
    return {
        "symptoms": sorted(list(all_symptoms)),
        "total_count": len(all_symptoms)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)