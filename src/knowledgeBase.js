import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let knowledgeBase = null;

// Load knowledge base
function loadKnowledgeBase() {
  if (!knowledgeBase) {
    const dataPath = join(__dirname, '..', 'data', 'signals.json');
    knowledgeBase = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
  return knowledgeBase;
}

// Simple text matching for symptom detection
function matchSymptoms(text, signals) {
  const lowerText = text.toLowerCase();
  const matchedSignals = [];
  
  for (const signal of signals) {
    const signalName = signal.name.toLowerCase();
    let present = false;
    
    // Check for direct matches or common variations
    if (lowerText.includes(signalName)) {
      present = true;
    } else {
      // Check for synonyms and variations
      const variations = getSignalVariations(signalName);
      present = variations.some(variation => lowerText.includes(variation));
    }
    
    matchedSignals.push({
      name: signal.name,
      weight: signal.weight,
      present
    });
  }
  
  // Sort by weight descending
  return matchedSignals.sort((a, b) => b.weight - a.weight);
}

// Get common variations and synonyms for signals
function getSignalVariations(signalName) {
  const variations = {
    'vomiting': ['vomit', 'throwing up', 'sick', 'nausea'],
    'diarrhea': ['loose stool', 'runny poop', 'soft stool', 'watery stool'],
    'limping': ['favoring leg', 'not walking normally', 'hopping'],
    'lethargy': ['tired', 'sleepy', 'low energy', 'inactive', 'sluggish'],
    'loss of appetite': ['not eating', 'refusing food', 'no appetite', 'won\'t eat'],
    'coughing': ['cough', 'hacking'],
    'itching': ['scratching', 'licking', 'biting skin'],
    'frequent urination': ['peeing a lot', 'urinating often', 'many bathroom trips'],
    'difficulty breathing': ['breathing hard', 'panting', 'labored breathing', 'gasping']
  };
  
  return variations[signalName] || [];
}

// Check for red flags in symptoms
function checkRedFlags(text, redFlags) {
  const lowerText = text.toLowerCase();
  const presentFlags = [];
  
  for (const flag of redFlags) {
    if (lowerText.includes(flag.toLowerCase())) {
      presentFlags.push(flag);
    }
  }
  
  return presentFlags;
}

// Determine triage level based on signals and red flags
function determineTriage(matchedSignals, redFlags, category) {
  // Emergency if red flags present
  if (redFlags.length > 0 || category === 'emergency') {
    return 'emergency';
  }
  
  // Calculate weighted score from present signals
  const presentSignals = matchedSignals.filter(s => s.present);
  const totalWeight = presentSignals.reduce((sum, s) => sum + s.weight, 0);
  const highWeightSignals = presentSignals.filter(s => s.weight >= 8);
  
  // Urgent if high-weight symptoms or high total score
  if (highWeightSignals.length >= 2 || totalWeight >= 20) {
    return 'urgent';
  }
  
  // Home care for everything else
  return 'home';
}

// Find best matching condition from knowledge base
export function assessSymptoms(symptoms) {
  const kb = loadKnowledgeBase();
  let bestMatch = null;
  let bestScore = 0;
  
  for (const condition of kb) {
    const matchedSignals = matchSymptoms(symptoms, condition.signals);
    const presentSignals = matchedSignals.filter(s => s.present);
    const score = presentSignals.reduce((sum, s) => sum + s.weight, 0);
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        ...condition,
        matchedSignals,
        score
      };
    }
  }
  
  if (!bestMatch) {
    // Fallback to general assessment
    return {
      category: 'general',
      disease: 'general concern',
      matchedSignals: [],
      red_flags: [],
      home_care: ['monitor pet closely', 'contact vet if symptoms worsen'],
      differentials: ['various conditions possible'],
      score: 0
    };
  }
  
  // Check for red flags
  const presentRedFlags = checkRedFlags(symptoms, bestMatch.red_flags);
  
  // Determine triage level
  const triage = determineTriage(bestMatch.matchedSignals, presentRedFlags, bestMatch.category);
  
  // Calculate confidence based on matching signals
  const totalPossibleWeight = bestMatch.signals.reduce((sum, s) => sum + s.weight, 0);
  const confidence = Math.min(bestScore / totalPossibleWeight, 1.0);
  
  return {
    category: bestMatch.category,
    disease: bestMatch.disease,
    signals: bestMatch.matchedSignals,
    differentials: bestMatch.differentials.map(d => ({ name: d, why: 'possible based on symptoms' })),
    triage,
    red_flags: presentRedFlags,
    actions: bestMatch.home_care,
    confidence: Math.round(confidence * 100) / 100,
    score: bestScore
  };
}