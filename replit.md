# Pets IQ Bot - AI Veterinary Assistant

## Overview

Pets IQ Bot is a full-stack web application that provides AI-powered veterinary guidance for pet owners. The application allows users to describe their pet's symptoms and receive triage recommendations, ranging from general care advice to emergency veterinary referrals. The system uses keyword-based symptom analysis to classify pet health issues and provide appropriate guidance while emphasizing the importance of professional veterinary care for serious conditions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with a dark theme design system using CSS variables
- **UI Components**: Comprehensive component library built on Radix UI primitives with shadcn/ui styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Design System**: Custom theme with pet-friendly branding, gradient borders, and responsive layout

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with structured JSON responses
- **Request Handling**: Express middleware for logging, JSON parsing, and error handling
- **Triage Logic**: Rule-based symptom classification using keyword matching for emergency detection
- **Development**: Vite integration for hot module replacement in development mode

### Data Storage Solutions
- **Database ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Schema Management**: Centralized schema definitions with Zod integration for validation
- **Migration System**: Drizzle Kit for database migrations and schema synchronization
- **Development Storage**: In-memory storage implementation for development and testing
- **Production Database**: PostgreSQL via Neon Database serverless platform

### Authentication and Authorization
The current implementation does not include user authentication, operating as a public advisory tool. All interactions are stateless, focusing on immediate pet health guidance rather than user account management.

### Triage and Assessment System
- **Symptom Classification**: Three-tier triage system (emergency, see_vet_soon, ok) based on keyword analysis
- **Emergency Detection**: Immediate escalation for critical symptoms like bleeding, choking, or breathing difficulties
- **Response Format**: Structured JSON responses with triage level, summary, advice steps, and disclaimers
- **Safety Measures**: Conservative approach that escalates uncertain cases to professional veterinary care

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL through Neon Database serverless platform
- **Database Driver**: `@neondatabase/serverless` for connection pooling and serverless compatibility
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Validation**: Zod for runtime type checking and schema validation

### UI and Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling Framework**: Tailwind CSS for utility-first styling with custom design tokens
- **Icons**: Lucide React for consistent iconography
- **Animations**: CSS-based animations with Tailwind animation utilities

### Development and Build Tools
- **Build Tool**: Vite for fast development server and optimized production builds
- **Development Environment**: Replit integration with runtime error overlay and cartographer plugin
- **Code Quality**: TypeScript for static type checking and enhanced developer experience
- **Package Management**: npm with lockfile for dependency consistency

### Frontend Libraries
- **HTTP Client**: Fetch API with custom wrapper for API requests and error handling
- **Date Handling**: date-fns for date manipulation and formatting
- **Carousel**: Embla Carousel for image/content carousels
- **Command Interface**: CMDK for command palette and search functionality

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout the stack, and a focus on providing reliable pet health guidance while maintaining appropriate safety boundaries.