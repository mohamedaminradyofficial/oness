# Content Analyzer - Project Structure

## Directory Organization

```
/
├── backend/          # Express.js API server (TypeScript)
├── frontend/         # React client application (TypeScript)
├── shared/           # Shared types and utilities
└── .amazonq/rules/   # Amazon Q development rules
```

## Core Components

### Backend (`/backend/`)
Express.js API server with TypeScript:
- `src/index.ts` - Main server entry point
- `src/routes/` - API route handlers
  - `analysis.ts` - Content analysis endpoints
  - `cache.ts` - Caching functionality
  - `export.ts` - Export functionality
  - `image.ts` - Image processing
  - `sharing.ts` - Sharing features
  - `video.ts` - Video analysis
- `src/utils/` - Core utilities
  - `database.ts` - MongoDB connection and models
  - `geminiHelper.ts` - Google Gemini AI integration
  - `groqHelper.ts` - Groq AI integration
  - `sourceEvaluator.ts` - Source credibility evaluation
  - `webScraper.ts` - Web content extraction

### Frontend (`/frontend/`)
React application with Material-UI:
- `src/App.tsx` - Main application component
- `src/index.tsx` - Application entry point
- `src/components/` - Reusable UI components
  - `Sidebar.tsx` - Navigation sidebar
- `src/pages/` - Page components
  - `AnalysisPage.tsx` - Main content analysis interface
  - `HistoryPage.tsx` - Analysis history view
  - `StatsPage.tsx` - Statistics dashboard
  - `VideoPage.tsx` - Video analysis interface

### Shared (`/shared/`)
- `types.ts` - TypeScript type definitions shared between frontend and backend

## Architectural Patterns

### Client-Server Architecture
- **Frontend**: React SPA communicating via REST API
- **Backend**: Express.js REST API server
- **Database**: MongoDB for persistent storage

### Modular Design
- Route-based API organization
- Utility-based service layer
- Component-based UI architecture
- Shared type system

### AI Integration Pattern
- Multiple AI provider support (Gemini, Groq)
- Helper classes for AI service abstraction
- Configurable AI provider selection

### Data Flow
1. User submits URL via React frontend
2. Frontend sends request to Express.js backend
3. Backend uses webScraper to extract content
4. Content analyzed by AI services (Gemini/Groq)
5. Source credibility evaluated
6. Results stored in MongoDB
7. Response sent back to frontend for display