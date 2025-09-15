/**
 * VetDataHub Integration System
 * Populates database with veterinary knowledge from VetDataHub repository
 */

import { db } from './db';
import { breedCharacteristics, symptomPatterns, vetKnowledgeBase } from '@shared/schema';
import { and, or, eq, ilike } from 'drizzle-orm';

// Sample breed characteristics data (from VetDataHub datasets)
const sampleBreedData = [
  {
    species: 'dog',
    breed: 'Golden Retriever',
    size: 'large',
    intelligence: 4,
    lifespan: '10-12 years',
    commonConditions: ['hip dysplasia', 'cancer', 'heart disease'],
    traits: {
      temperament: 'friendly, intelligent, devoted',
      exercise: 'high',
      grooming: 'moderate',
      training: 'easy'
    },
    vetAdvice: 'Regular hip screening recommended. Prone to cancer in later years. Requires daily exercise.'
  },
  {
    species: 'dog',
    breed: 'German Shepherd',
    size: 'large',
    intelligence: 5,
    lifespan: '9-13 years',
    commonConditions: ['hip dysplasia', 'elbow dysplasia', 'bloat'],
    traits: {
      temperament: 'confident, courageous, smart',
      exercise: 'very high',
      grooming: 'high',
      training: 'easy'
    },
    vetAdvice: 'Watch for bloat symptoms - emergency condition. Regular joint health monitoring essential.'
  },
  {
    species: 'cat',
    breed: 'Persian',
    size: 'medium',
    intelligence: 3,
    lifespan: '10-17 years',
    commonConditions: ['respiratory issues', 'eye problems', 'kidney disease'],
    traits: {
      temperament: 'quiet, sweet, calm',
      exercise: 'low',
      grooming: 'very high',
      training: 'moderate'
    },
    vetAdvice: 'Daily grooming essential. Monitor breathing due to flat face. Regular eye cleaning needed.'
  }
];

// Sample symptom patterns (based on VetDataHub animal condition data)
const sampleSymptomData = [
  {
    species: 'dog',
    symptom: 'difficulty breathing',
    severity: 'emergency',
    ageGroup: 'all',
    relatedConditions: ['bloat', 'heart failure', 'respiratory distress'],
    triageAdvice: 'EMERGENCY: Seek immediate veterinary care. Could indicate life-threatening condition.',
    vetRequired: true
  },
  {
    species: 'dog',
    symptom: 'vomiting',
    severity: 'urgent',
    ageGroup: 'all',
    relatedConditions: ['dietary indiscretion', 'obstruction', 'pancreatitis'],
    triageAdvice: 'Monitor frequency. If continuous or with blood, see vet immediately.',
    vetRequired: true
  },
  {
    species: 'cat',
    symptom: 'not eating',
    severity: 'urgent',
    ageGroup: 'all',
    relatedConditions: ['dental issues', 'kidney disease', 'stress'],
    triageAdvice: 'Cats can develop serious liver issues if not eating. See vet within 24 hours.',
    vetRequired: true
  },
  {
    species: 'dog',
    symptom: 'limping',
    severity: 'mild',
    ageGroup: 'senior',
    breedSpecific: 'German Shepherd',
    relatedConditions: ['arthritis', 'hip dysplasia', 'muscle strain'],
    triageAdvice: 'Common in large breeds. Rest and monitor. If persistent, schedule vet visit.',
    vetRequired: false
  }
];

// Sample veterinary knowledge base entries
const sampleKnowledgeData = [
  {
    topic: 'Canine Hip Dysplasia',
    category: 'orthopedic',
    species: 'dog',
    content: {
      description: 'Genetic condition affecting hip joint development',
      symptoms: ['limping', 'difficulty rising', 'decreased activity'],
      breeds_affected: ['German Shepherd', 'Golden Retriever', 'Labrador'],
      age_onset: 'typically 6 months - 2 years',
      treatment: 'weight management, exercise modification, surgery in severe cases',
      prognosis: 'good with proper management'
    },
    source: 'VetDataHub - Canine Orthopedic Dataset'
  },
  {
    topic: 'Feline Kidney Disease',
    category: 'internal medicine',
    species: 'cat',
    content: {
      description: 'Progressive kidney function decline, common in senior cats',
      symptoms: ['increased thirst', 'increased urination', 'weight loss', 'decreased appetite'],
      risk_factors: ['age', 'genetics', 'dental disease'],
      stages: 4,
      treatment: 'special diet, fluid therapy, medications',
      monitoring: 'regular blood work and urinalysis'
    },
    source: 'VetDataHub - Feline Internal Medicine Dataset'
  }
];

/**
 * Populate breed characteristics table
 */
export async function populateBreedData() {
  console.log('🐕 Populating breed characteristics...');
  
  for (const breed of sampleBreedData) {
    await db.insert(breedCharacteristics).values(breed);
  }
  
  console.log(`✅ Added ${sampleBreedData.length} breed records`);
}

/**
 * Populate symptom patterns table
 */
export async function populateSymptomData() {
  console.log('🩺 Populating symptom patterns...');
  
  for (const symptom of sampleSymptomData) {
    await db.insert(symptomPatterns).values(symptom);
  }
  
  console.log(`✅ Added ${sampleSymptomData.length} symptom pattern records`);
}

/**
 * Populate veterinary knowledge base
 */
export async function populateKnowledgeBase() {
  console.log('📚 Populating veterinary knowledge base...');
  
  for (const knowledge of sampleKnowledgeData) {
    await db.insert(vetKnowledgeBase).values(knowledge);
  }
  
  console.log(`✅ Added ${sampleKnowledgeData.length} knowledge base records`);
}

/**
 * Full VetDataHub integration - populate all tables
 */
export async function integrateVetDataHub() {
  try {
    console.log('🚀 Starting VetDataHub integration...');
    
    await populateBreedData();
    await populateSymptomData();
    await populateKnowledgeBase();
    
    console.log('🎉 VetDataHub integration complete!');
    return { success: true, message: 'All veterinary data imported successfully' };
  } catch (error) {
    console.error('❌ VetDataHub integration failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Query enhanced triage data for better assessments
 */
export async function getEnhancedTriageData(petType: string, symptoms: string[], breed?: string) {
  try {
    // Get breed-specific information if available
    const breedInfo = breed ? await db
      .select()
      .from(breedCharacteristics)
      .where(
        and(
          eq(breedCharacteristics.species, petType),
          eq(breedCharacteristics.breed, breed)
        )
      )
      .limit(1) : null;

    // Get relevant symptom patterns
    const symptomInfo = symptoms.length > 0 ? await db
      .select()
      .from(symptomPatterns)
      .where(
        and(
          eq(symptomPatterns.species, petType),
          or(
            ...symptoms.map(symptom => ilike(symptomPatterns.symptom, `%${symptom}%`))
          )
        )
      ) : [];

    // Get relevant knowledge base entries
    const knowledgeInfo = await db
      .select()
      .from(vetKnowledgeBase)
      .where(eq(vetKnowledgeBase.species, petType))
      .limit(5);

    return {
      breedInfo: breedInfo?.[0] || null,
      symptomPatterns: symptomInfo,
      knowledgeBase: knowledgeInfo
    };
  } catch (error) {
    console.error('Error querying enhanced triage data:', error);
    return null;
  }
}