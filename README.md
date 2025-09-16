# Pets IQ Bot 🐕🐱

**Advanced AI-Powered Veterinary Assistant with Multi-Source Intelligence**

Pets IQ Bot is a comprehensive web application that provides professional-grade pet health assessments using multiple AI sources, structured signal analysis, and evidence-based triage recommendations. The system combines machine learning, expert knowledge bases, and GPT-3.5-turbo to deliver reliable veterinary guidance for pet owners.

## 🌟 What Makes It Special?

- **Multi-Source Assessment**: Combines knowledge base signals, OpenAI GPT-3.5-turbo, Roma agent analysis, and ML classification
- **Structured Signal Analysis**: Precise symptom detection with weighted confidence scoring
- **Evidence-Based Triage**: Conservative escalation with red flag detection
- **JSON Schema Enforcement**: Consistent, structured responses with differential diagnoses
- **Professional UI**: Rich assessment displays with signal presence indicators

## 🧠 Intelligence Sources

### 1. **Knowledge Base Engine**
- **Weighted Signals**: 200+ veterinary symptoms with severity weights (1-10)
- **Differential Diagnoses**: Multiple possible conditions with reasoning
- **Red Flag Detection**: Automatic escalation for emergency symptoms
- **Synonym Matching**: "not eating" → "loss of appetite", "low energy" → "lethargy"

### 2. **OpenAI GPT-3.5-turbo Integration**
- **JSON Schema Enforcement**: Structured responses with validation
- **Empathetic Messaging**: Natural language explanations under 150 characters
- **Conservative Triage**: Safety-first approach to recommendations

### 3. **Roma Agent Analysis**
- **Additional Intelligence**: Supplementary veterinary insights
- **Graceful Degradation**: System continues without Roma if unavailable

### 4. **Machine Learning Classification**
- **Symptom Pattern Recognition**: Trained model for condition classification
- **Confidence Scoring**: Weighted assessment based on signal presence

## 🚦 Advanced Triage System

### 🚨 Emergency (Immediate Care)
- **Red Flags**: Breathing difficulties, seizures, bleeding, choking
- **Action**: Immediate veterinary care - do not delay
- **Confidence**: High-weight emergency signals present

### ⚠️ Urgent (24-48 Hours)  
- **Indicators**: Pain, persistent vomiting, neurological signs
- **Action**: Schedule veterinary visit within 1-2 days
- **Confidence**: Multiple concerning signals detected

### 🏠 Home Care (Monitor)
- **Indicators**: Minor symptoms, single isolated signs
- **Action**: Monitor at home with supportive care
- **Confidence**: Low-weight signals or insufficient evidence

## 📊 Assessment Response Format

```json
{
  "message": "Based on the symptoms, this appears to be gastroenteritis...",
  "category": "gastrointestinal",
  "disease": "gastroenteritis", 
  "signals": [
    {"name": "vomiting", "present": true, "weight": 9},
    {"name": "diarrhea", "present": false, "weight": 8},
    {"name": "loss of appetite", "present": true, "weight": 7}
  ],
  "differentials": [
    {"name": "dietary indiscretion", "why": "common cause"},
    {"name": "viral infection", "why": "symptom pattern match"}
  ],
  "triage": "urgent",
  "red_flags": [],
  "actions": [
    "withhold food 6-12h then small bland meals",
    "provide fresh water frequently",
    "monitor hydration status"
  ],
  "confidence": 0.72
}
```

## 🖥️ User Interface Features

### Enhanced Assessment Display
- **Signal Analysis**: Visual indicators for present/absent symptoms
- **Differential Diagnoses**: Multiple possible conditions with explanations  
- **Confidence Scoring**: Numerical confidence based on weighted signals
- **Care Instructions**: Specific, actionable steps for pet owners
- **Assessment Method**: Transparency about which AI sources were used

### User Experience
- **Mobile Responsive**: Works seamlessly on all devices
- **Real-time Analysis**: Fast symptom processing and response
- **Chat Interface**: Natural conversation flow
- **Emergency Alerts**: Prominent warnings for urgent cases

## 🔧 Technical Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with Vite for fast development
- **Styling**: Tailwind CSS with custom pet-themed design
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation

### Backend (Node.js + Express)
- **Runtime**: Node.js with TypeScript and ES modules
- **Framework**: Express.js with structured middleware
- **Validation**: Zod schemas for request/response validation
- **Rate Limiting**: Protection against system overload
- **Error Handling**: Graceful degradation and fallbacks

### AI Integration
- **OpenAI**: GPT-3.5-turbo with JSON schema enforcement
- **Knowledge Base**: Structured veterinary signal database
- **Roma Agent**: External veterinary intelligence service
- **ML Classification**: Custom-trained symptom classifier

### Database & Storage
- **ORM**: Drizzle ORM with PostgreSQL support
- **Development**: In-memory storage for fast iteration
- **Production**: Neon Database serverless PostgreSQL
- **Schema**: Type-safe database operations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- OpenAI API key for full AI responses

### Quick Start
```bash
# Clone the repository
git clone https://github.com/chiefmmorgs/pets-iq-assistant

# Install dependencies  
npm install

# Set up environment variables
echo "OPENAI_API_KEY=your-key-here" > .env

# Start the application
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
pets-iq-assistant/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # UI components (forms, chat, etc.)
│   │   ├── pages/          # Application pages
│   │   ├── assets/         # Images and static assets
│   │   └── lib/           # Utilities and configurations
├── server/                 # Express backend server
│   ├── routes.ts          # API endpoint definitions
│   └── index.ts           # Server configuration
├── src/                   # AI and assessment logic
│   ├── knowledgeBase.js   # Veterinary knowledge engine
│   ├── openaiChat.js      # GPT-3.5-turbo integration
│   └── ml.js              # Machine learning classifier
├── utils/                 # Shared utilities
│   ├── symptoms.js        # Symptom analysis and matching
│   └── format.js          # Response formatting
├── data/                  # Knowledge base data
│   └── signals.json       # Veterinary signals database
├── shared/                # Shared TypeScript schemas
│   └── schema.ts          # Request/response types
└── README.md              # This documentation
```

## 🔌 API Endpoints

### Assessment Endpoints
- `POST /api/chat` - Complete AI assessment with structured analysis
- `POST /api/predict` - Quick symptom classification and triage
- `GET /api/health` - System health check

### Request Format
```javascript
// Complete assessment
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "My dog is vomiting and won't eat, seems lethargic",
    species: "dog", 
    age: "3 years"
  })
})
```

### Response Features
- **Structured JSON**: Consistent format across all endpoints
- **Signal Analysis**: Present/absent symptom indicators
- **Confidence Scoring**: Numerical assessment reliability
- **Multiple Differentials**: Alternative diagnoses considered
- **Actionable Instructions**: Specific care recommendations

## ⚡ Advanced Features

### Signal Detection & Analysis
- **Synonym Recognition**: Advanced text matching for symptoms
- **Weight-Based Scoring**: Clinical significance of each symptom
- **Presence Marking**: Clear indication of detected vs. absent signals
- **Confidence Calculation**: Mathematical assessment of diagnostic certainty

### Safety & Reliability
- **Conservative Escalation**: Bias toward veterinary care when uncertain
- **Red Flag System**: Automatic emergency detection
- **Fallback Responses**: System continues if AI services unavailable
- **Rate Limiting**: Protection against system abuse
- **Input Validation**: Comprehensive request sanitization

### Multi-Modal Assessment
- **Text Analysis**: Natural language symptom processing
- **Structured Data**: JSON responses for programmatic use
- **Visual Indicators**: UI elements showing assessment confidence
- **Historical Context**: Assessment method transparency

## 🎨 User Experience

### Visual Design
- **Pet-Friendly Theme**: Warm colors and friendly iconography
- **Gradient Borders**: Modern glass-morphism effects
- **Responsive Layout**: Optimized for desktop and mobile
- **Dark Mode Support**: Comprehensive theming system

### Interaction Design
- **Chat Interface**: Natural conversation flow
- **Progressive Disclosure**: Information revealed as needed
- **Loading States**: Clear feedback during processing
- **Error Handling**: Graceful failure with helpful messages

### Branding & Attribution
- **Logo Integration**: Custom branding in bottom-right corner
- **Social Links**: GitHub repository and X profile links
- **Professional Footer**: Contact and legal information
- **Powered By**: Clear attribution and credits

## ⚠️ Important Disclaimers

### Medical Limitations
- **Guidance Only**: This tool provides information, not medical advice
- **Veterinary Consultation**: Always consult qualified professionals for serious concerns
- **Emergency Protocol**: For true emergencies, seek immediate veterinary care
- **Owner Judgment**: Use your knowledge of your pet's normal behavior

### Technical Limitations
- **AI Reliability**: Responses generated by AI may contain errors
- **Connectivity**: Requires internet connection for full functionality
- **Service Availability**: Dependent on third-party AI services
- **Data Privacy**: Symptom descriptions are processed by external APIs

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Set up environment variables
5. Run tests: `npm test`
6. Start development server: `npm run dev`

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits
- Comprehensive testing

## 📈 Future Roadmap

### Enhanced AI Capabilities
- **Vision Analysis**: Photo-based symptom assessment
- **Voice Input**: Speech-to-text symptom description
- **Multi-Language**: Support for additional languages
- **Specialized Models**: Species-specific AI training

### Extended Features  
- **Health History**: Pet medical record tracking
- **Vet Integration**: Direct scheduling with local clinics
- **Medication Tracking**: Dosage and timing reminders
- **Community Features**: Pet owner support networks

### Technical Improvements
- **Offline Mode**: Local assessment capabilities
- **Performance**: Enhanced speed and reliability
- **Analytics**: Assessment accuracy tracking
- **API Expansion**: Third-party integrations

## 📝 License

This project is developed for educational and pet welfare purposes. Use responsibly and always prioritize professional veterinary care for your pets.

## 🔗 Links

- **GitHub Repository**: https://github.com/chiefmmorgs/pets-iq-assistant
- **Developer**: [@chief_mmorgs](https://x.com/chief_mmorgs)
- **Live Demo**: [View Application](https://pets-iq-assistant.replit.app)

---

**Remember**: This tool enhances but never replaces professional veterinary care. When in doubt, always consult with a qualified veterinarian! 🏥

Made with ❤️ for pets and their humans by [@chief_mmorgs](https://x.com/chief_mmorgs)