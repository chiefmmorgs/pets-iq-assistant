# Pets IQ Bot 🐕🐱

**AI-Powered Veterinary Assistant for Pet Owners**

Pets IQ Bot is a smart web application that helps pet owners assess their pets' symptoms and get guidance on what to do next. The system uses artificial intelligence to analyze symptoms and provide three levels of care recommendations.

## 🌟 What Does It Do?

- **Symptom Analysis**: Describe what's wrong with your pet in plain language
- **Smart Triage**: Get instant recommendations on urgency level
- **AI Responses**: Receive empathetic, helpful guidance from GPT-3.5-turbo
- **Safety First**: Conservative approach that prioritizes your pet's health

## 🚦 Three-Level Care System

### 🚨 Emergency (Red)
- **When**: Serious symptoms like bleeding, choking, or breathing problems
- **Action**: Go to the vet immediately - don't wait!

### ⚠️ See Vet Soon (Yellow)  
- **When**: Concerning symptoms that need attention
- **Action**: Schedule a vet visit within 24-48 hours

### ✅ General Care (Green)
- **When**: Minor issues that can be monitored
- **Action**: Watch your pet at home and provide basic care

## 🖥️ How to Use

1. **Open the app** - Visit your Pets IQ Bot website
2. **Describe symptoms** - Tell us what you've noticed about your pet
3. **Add pet details** - Include species (dog/cat) and age if you know it
4. **Get guidance** - Receive instant triage and care recommendations
5. **Follow advice** - Take the recommended next steps for your pet

## 🔧 Technology Behind the Scenes

### Smart AI Brain
- **Machine Learning**: Trained model classifies symptoms automatically
- **OpenAI GPT-3.5-turbo**: Provides empathetic, detailed responses
- **Backup System**: Works even when AI services are busy

### Built With Modern Tools
- **Frontend**: React with beautiful, responsive design
- **Backend**: Node.js server with Express
- **Database**: PostgreSQL for data storage
- **Security**: Rate limiting and protected endpoints

## 🚀 Getting Started (For Developers)

### Prerequisites
- Node.js installed on your computer
- OpenAI API key (for full AI responses)

### Installation
```bash
# Install dependencies
npm install

# Start the application
npm run dev
```

The app will be available at `http://localhost:5000`

### Environment Setup
Create a `.env` file with:
```
OPENAI_API_KEY=your-openai-api-key-here
```

## 📁 Project Structure

```
pets-iq-bot/
├── client/               # Frontend React app
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # App pages
│   │   └── assets/       # Images and logos
├── server/               # Backend API
│   ├── routes.ts         # API endpoints
│   └── index.ts          # Server setup
├── src/                  # AI and ML logic
│   ├── openaiChat.js     # GPT-3.5-turbo integration
│   └── ml.js             # Machine learning model
├── shared/               # Shared types and schemas
└── README.md             # This file!
```

## 🔌 API Endpoints

### Main Endpoints
- `POST /api/chat` - Get full AI response with triage
- `POST /api/predict` - Quick symptom classification only
- `GET /api/health` - Check if system is working

### Example Usage
```javascript
// Get AI response
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "My dog is limping and won't eat",
    species: "dog",
    age: "5 years"
  })
})
```

## ⚡ Features

### User Experience
- **Simple Interface**: Easy-to-use chat-style input
- **Mobile Friendly**: Works great on phones and tablets
- **Fast Responses**: Quick analysis and recommendations
- **Beautiful Design**: Pet-themed colors and friendly interface

### Safety & Reliability
- **Conservative Approach**: When in doubt, recommends seeing a vet
- **Fallback System**: Works even when AI is unavailable
- **Rate Limiting**: Prevents system overload
- **Error Handling**: Graceful handling of problems

## ⚠️ Important Disclaimers

### Not a Replacement for Vets
- This tool provides guidance only
- Always consult a real veterinarian for serious concerns
- Use your judgment as a pet owner
- When in doubt, see a professional

### Emergency Situations
- For true emergencies, go directly to the vet
- Don't rely solely on any app for critical decisions
- Trust your instincts about your pet's health

## 🤝 Support

If you encounter any issues:
1. Check that the app is running properly
2. Verify your internet connection
3. Try refreshing the page
4. Contact support if problems persist

## 📈 Future Improvements

- Support for more pet species (birds, rabbits, etc.)
- Photo analysis of symptoms
- Integration with local veterinary clinics
- Pet health history tracking
- Multi-language support

## 📝 License

This project is created for educational and helpful purposes. Please use responsibly and always prioritize your pet's health and safety.

---

**Remember**: This tool is designed to help, not replace professional veterinary care. When in doubt, always consult with a qualified veterinarian! 🏥

Made with ❤️ for pets and their humans.