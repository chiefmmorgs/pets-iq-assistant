# Pets IQ Bot

## Overview

Pets IQ Bot is an advanced AI-powered veterinary assistant that provides professional-grade pet health assessments. The application combines multiple intelligence sources including ROMA (Real-time Optimized Multi-Agent) reasoning, OpenAI GPT-3.5-turbo, knowledge-based signal analysis, and machine learning classification to deliver comprehensive pet care guidance with evidence-based triage recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **UI Library**: shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **State Management**: React Hook Form for form handling, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Layout**: Responsive design with header, main content area, sidebar, and footer

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful endpoints with structured JSON responses
- **Request Validation**: Zod schemas for type-safe request/response validation
- **Error Handling**: Centralized error handling with appropriate HTTP status codes
- **Rate Limiting**: Express-rate-limit for API protection
- **Security**: Helmet for security headers, CORS configuration

### Multi-Intelligence Assessment System
- **ROMA Integration**: External reasoning agent service running on separate FastAPI container
- **Knowledge Base Engine**: JSON-based symptom database with weighted signal analysis
- **OpenAI Integration**: GPT-3.5-turbo with JSON schema enforcement for structured responses
- **ML Classification**: Natural language processing for symptom pattern recognition
- **Confidence Scoring**: Weighted assessment based on signal presence and strength

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Knowledge Base**: JSON files for veterinary signals and triage mappings
- **ML Models**: Serialized classifier models stored as JSON
- **Static Assets**: File system storage for images and configuration

### Triage System
- **Emergency**: Immediate veterinary care required (red flags detected)
- **Urgent**: Veterinary visit needed within 24-48 hours
- **Home Care**: Monitoring and home treatment recommendations

## External Dependencies

### AI Services
- **OpenAI API**: GPT-3.5-turbo for natural language processing and structured assessment generation
- **ROMA Agent**: External GitHub repository integration (sentient-agi/ROMA) for advanced veterinary reasoning

### Database & Infrastructure
- **Neon Database**: PostgreSQL hosting via @neondatabase/serverless
- **Drizzle ORM**: Type-safe database operations and migrations
- **Vercel**: Deployment platform with serverless functions

### Development & Build Tools
- **Vite**: Frontend build tool with React plugin support
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Backend bundling for production builds
- **Tailwind CSS**: Utility-first CSS framework

### Third-Party Libraries
- **Natural**: Node.js natural language processing for ML classification
- **Axios**: HTTP client for external API communication
- **Express Middleware**: Helmet, CORS, Morgan, Rate Limiting
- **UI Components**: Radix UI primitives, Lucide React icons
- **Form Handling**: React Hook Form with Zod resolvers

### Containerization
- **Docker**: Multi-container setup with separate services for API and ROMA agent
- **Docker Compose**: Service orchestration with health checks and dependency management