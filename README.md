# Pets IQ Bot 🐕🐱

**Advanced AI-Powered Veterinary Assistant with ROMA Integration**

Pets IQ Bot is a comprehensive web application that provides professional-grade pet health assessments using multiple AI sources, structured signal analysis, and evidence-based triage recommendations. The system combines machine learning, expert knowledge bases, GPT-3.5-turbo, and ROMA reasoning agents to deliver reliable veterinary guidance for pet owners.

## 🌟 What Makes It Special?

- **ROMA Integration**: Real-time connection to https://github.com/sentient-agi/ROMA for advanced veterinary reasoning
- **Multi-Source Assessment**: Combines knowledge base signals, OpenAI GPT-3.5-turbo, Roma agent analysis, and ML classification
- **Docker Containerization**: Complete containerized setup with ROMA FastAPI service and Node.js API
- **Structured Signal Analysis**: Precise symptom detection with weighted confidence scoring
- **Evidence-Based Triage**: Conservative escalation with red flag detection
- **JSON Schema Enforcement**: Consistent, structured responses with differential diagnoses
- **Professional UI**: Rich assessment displays with signal presence indicators
- **Brand-Free Interface**: Clean, professional interface with no third-party branding

## 🧠 Intelligence Sources

### 1. **ROMA Reasoning Agent**
- **Integration**: Direct connection to sentient-agi/ROMA repository
- **Veterinary Reasoning**: Advanced AI reasoning for complex symptom analysis
- **Docker Service**: Runs as separate FastAPI container for optimal performance
- **Health Monitoring**: Built-in health checks and graceful fallback

### 2. **Knowledge Base Engine**
- **Weighted Signals**: 200+ veterinary symptoms with severity weights (1-10)
- **Differential Diagnoses**: Multiple possible conditions with reasoning
- **Red Flag Detection**: Automatic escalation for emergency symptoms
- **Synonym Matching**: "not eating" → "loss of appetite", "low energy" → "lethargy"

### 3. **OpenAI GPT-3.5-turbo Integration**
- **JSON Schema Enforcement**: Structured responses with validation
- **Empathetic Messaging**: Natural language explanations under 150 characters
- **Conservative Triage**: Safety-first approach to recommendations

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

## 🐳 Docker Deployment (Recommended)

### Container Architecture
```yaml
# docker-compose.yml
services:
  roma:
    # ROMA FastAPI service on port 8001
    image: pets-iq-roma
    healthcheck: /health endpoint monitoring
    
  api:
    # Node.js Express API on port 8000
    image: pets-iq-api
    depends_on: roma service health
    environment: ROMA_HOST=roma, ROMA_PORT=8001
```

### Quick Docker Setup
```bash
# Build and start services
docker compose up -d --build

# Monitor logs
docker compose logs -f api
docker compose logs -f roma

# Health checks
curl http://localhost:8000/health
curl http://localhost:8001/health
```

### ROMA Integration Details
- **Repository**: Cloned from https://github.com/sentient-agi/ROMA at build time
- **Communication**: Internal Docker network (roma:8001)
- **Endpoints**: `/health` for monitoring, `/reason` for analysis
- **Fallback**: Graceful degradation when ROMA service unavailable

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
  "confidence": 0.72,
  "roma_analysis": {
    "reasoning": "ROMA agent insights...",
    "confidence": 0.85
  }
}
```

## 🖥️ User Interface Features

### Enhanced Assessment Display
- **ROMA Insights**: Real-time reasoning from ROMA agent
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
- **Clean Interface**: Professional design with no external branding

## 🔧 Technical Architecture

### Container Services
- **ROMA Service**: FastAPI container running sentient-agi/ROMA
- **API Service**: Node.js Express application
- **Health Monitoring**: Automated health checks and service dependencies
- **Network Isolation**: Secure internal container communication

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
- **ROMA Agent**: Direct integration with sentient-agi/ROMA service
- **OpenAI**: GPT-3.5-turbo with JSON schema enforcement
- **Knowledge Base**: Structured veterinary signal database
- **ML Classification**: Custom-trained symptom classifier

### Database & Storage
- **ORM**: Drizzle ORM with PostgreSQL support
- **Development**: In-memory storage for fast iteration
- **Production**: PostgreSQL with connection pooling
- **Schema**: Type-safe database operations

## 🚀 Getting Started

### Development Setup
```bash
# Clone the repository
git clone https://github.com/chiefmmorgs/pets-iq-assistant
cd pets-iq-assistant

# Install dependencies  
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys:
# OPENAI_API_KEY=your-openai-key
# ROMA_HOST=localhost
# ROMA_PORT=8001

# Start the application
npm run dev
```

### Production Deployment with Docker
```bash
# Build and deploy with ROMA integration
docker compose up -d --build

# Monitor services
docker compose ps
docker compose logs -f
```

### Cloud Deployment Options
The application can be deployed to any cloud platform that supports:
- **Docker containers** (AWS ECS, Google Cloud Run, Azure Container Instances)
- **Node.js applications** (Heroku, Vercel, Netlify, Railway, Render)
- **Static hosting + API** (Cloudflare Pages, AWS S3 + Lambda)

The application will be available at the configured port (default: 8000 for Docker, 5000 for development)

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
│   ├── romaClient.js      # ROMA service integration
│   └── ml.js              # Machine learning classifier
├── utils/                 # Shared utilities
│   ├── symptoms.js        # Symptom analysis and matching
│   └── format.js          # Response formatting
├── data/                  # Knowledge base data
│   └── signals.json       # Veterinary signals database
├── shared/                # Shared TypeScript schemas
│   └── schema.ts          # Request/response types
├── docker-compose.yml     # Container orchestration
├── Dockerfile.api         # Node.js API container
├── Dockerfile.roma        # ROMA service container
└── README.md              # This documentation
```

## 🔌 API Endpoints

### Assessment Endpoints
- `POST /api/chat` - Complete AI assessment with ROMA integration
- `POST /api/predict` - Quick symptom classification and triage
- `POST /api/roma` - Direct ROMA agent proxy
- `GET /api/health` - System health with service status
- `GET /health` - Simple health check for Docker

### Container Health Checks
```bash
# API service health
curl http://localhost:8000/health

# ROMA service health  
curl http://localhost:8001/health

# Complete assessment test
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text":"dog vomiting, not eating","species":"dog","age":"adult"}'
```

### ROMA Integration Examples
```javascript
// Direct ROMA reasoning
const romaResponse = await fetch('/api/roma', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "My cat is limping and seems in pain"
  })
});

// Full assessment with ROMA insights
const assessment = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "My dog is vomiting and won't eat, seems lethargic",
    species: "dog", 
    age: "3 years"
  })
});
```

## ⚡ Advanced Features

### ROMA Service Integration
- **Real-time Communication**: Direct connection to ROMA reasoning service
- **Health Monitoring**: Continuous service availability checks
- **Graceful Fallback**: System continues without ROMA if unavailable
- **Container Networking**: Secure internal Docker communication
- **Timeout Handling**: Configurable request timeouts (15s reasoning, 2s health)

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
- **Professional Interface**: Clean design without external branding

### Interaction Design
- **Chat Interface**: Natural conversation flow
- **Progressive Disclosure**: Information revealed as needed
- **Loading States**: Clear feedback during processing
- **Error Handling**: Graceful failure with helpful messages

### Branding & Attribution
- **Custom Branding**: Personal logo integration
- **Social Links**: GitHub repository and developer profile links
- **Professional Footer**: Contact and legal information
- **Independent Identity**: No third-party platform branding

## ⚠️ Important Disclaimers

### Medical Limitations
- **Guidance Only**: This tool provides information, not medical advice
- **Veterinary Consultation**: Always consult qualified professionals for serious concerns
- **Emergency Protocol**: For true emergencies, seek immediate veterinary care
- **Owner Judgment**: Use your knowledge of your pet's normal behavior

### Technical Limitations
- **AI Reliability**: Responses generated by AI may contain errors
- **Service Dependencies**: Requires ROMA and OpenAI service availability
- **Connectivity**: Requires internet connection for full functionality
- **Data Privacy**: Symptom descriptions are processed by external APIs

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Set up environment variables (OPENAI_API_KEY, ROMA_HOST, ROMA_PORT)
5. Run tests: `npm test`
6. Start development server: `npm run dev`

### Docker Development
1. Build containers: `docker compose build`
2. Start services: `docker compose up -d`
3. Monitor logs: `docker compose logs -f`
4. Test endpoints: Use curl commands above

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

### ROMA Enhancements
- **Advanced Reasoning**: More sophisticated ROMA integration
- **Caching**: Response caching for improved performance
- **Load Balancing**: Multiple ROMA instances for scalability
- **Custom Training**: Pet-specific ROMA model training

### Extended Features  
- **Health History**: Pet medical record tracking
- **Vet Integration**: Direct scheduling with local clinics
- **Medication Tracking**: Dosage and timing reminders
- **Community Features**: Pet owner support networks

### Technical Improvements
- **Kubernetes**: Container orchestration for production
- **Monitoring**: Advanced service monitoring and alerts
- **Analytics**: Assessment accuracy tracking
- **API Expansion**: Third-party integrations

## 📝 License

This project is developed for educational and pet welfare purposes. Use responsibly and always prioritize professional veterinary care for your pets.

## 🔗 Links

- **GitHub Repository**: https://github.com/chiefmmorgs/pets-iq-assistant
- **ROMA Integration**: https://github.com/sentient-agi/ROMA
- **Developer**: [@chief_mmorgs](https://x.com/chief_mmorgs)
- **Fellow Developer**: [@ui_anon](https://x.com/ui_anon)
- **Live Demo**: [View Application](https://pets-iq-assistant.onrender.com/)

---

**Remember**: This tool enhances but never replaces professional veterinary care. When in doubt, always consult with a qualified veterinarian! 🏥

Made with ❤️ for pets and their humans by [@chief_mmorgs](https://x.com/chief_mmorgs) and [@ui_anon](https://x.com/ui_anon)

*Powered by [ROMA](https://github.com/sentient-agi/ROMA) - Advanced AI Reasoning*