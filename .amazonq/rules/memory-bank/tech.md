# Content Analyzer - Technology Stack

## Programming Languages
- **TypeScript** - Primary language for both frontend and backend
- **JavaScript** - Runtime execution
- **CSS** - Styling (with Material-UI)

## Runtime & Platform
- **Node.js 18+** - JavaScript runtime
- **npm** - Package management

## Frontend Stack
- **React** - UI framework
- **Material-UI** - Component library
- **TypeScript** - Type safety
- **Create React App** - Build tooling

## Backend Stack
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

## AI & External Services
- **Google Gemini API** - AI text analysis
- **Groq API** - Alternative AI provider
- **Axios** - HTTP client
- **Cheerio** - Web scraping

## Development Tools
- **TypeScript Compiler** - Type checking and compilation
- **Concurrently** - Run multiple npm scripts
- **TSConfig** - TypeScript configuration

## Build System
- **npm scripts** - Task automation
- **TypeScript compilation** - Build process
- **React build** - Frontend bundling

## Database
- **MongoDB** - Document database
- **Mongoose** - Object modeling

## Development Commands

### Installation
```bash
npm install:all              # Install all dependencies
npm run install:backend      # Backend only
npm run install:frontend     # Frontend only
```

### Development
```bash
npm run dev                  # Start both frontend and backend
npm run start:backend        # Backend development server
npm run start:frontend       # Frontend development server
```

### Building
```bash
npm run build               # Build both projects
npm run build:backend       # Build backend only
npm run build:frontend      # Build frontend only
```

### Testing
```bash
npm test                    # Run backend tests
```

## Environment Configuration

### Backend (.env)
```env
PORT=8000
DATABASE_URL=mongodb://localhost:27017/content_analyzer
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
REACT_APP_GROQ_API_KEY=your_groq_api_key
```

## Deployment Ports
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000