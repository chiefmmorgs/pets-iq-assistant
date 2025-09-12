export const TRIAGE_RULES = {
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

export function classifySymptoms(text: string): "emergency" | "see_vet_soon" | "ok" {
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

export const QUICK_HELP_ITEMS = [
  {
    icon: "🐕",
    title: "Dog not eating",
    description: "Loss of appetite guidance",
    query: "My dog is not eating and seems to have lost appetite"
  },
  {
    icon: "🐱", 
    title: "Cat vomiting",
    description: "Digestive issue help",
    query: "My cat is vomiting and seems unwell"
  },
  {
    icon: "🦴",
    title: "Pet limping", 
    description: "Injury assessment",
    query: "My pet is limping and seems to be in pain"
  }
];
