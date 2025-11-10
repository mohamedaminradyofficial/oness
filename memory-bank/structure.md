# Project Structure & Architecture

## Directory Structure

```
k:\onees/
├── .amazonq/                    # Amazon Q configuration
│   └── rules/
│       └── memory-bank/         # Memory bank documentation
├── .streamlit/                  # Streamlit configuration
│   └── config.toml             # Server and UI settings
├── app.py                      # Main Streamlit application
├── api.py                      # FastAPI backend service
├── cache_manager.py            # Caching system management
├── database.py                 # Database models and operations
├── export_utils.py             # Export functionality (PDF, Word, Markdown)
├── gemini_helper.py            # Google Gemini API integration
├── groq_helper.py              # Groq API integration
├── image_processor.py          # Image analysis and processing
├── main.py                     # Application entry point
├── sharing_utils.py            # Content sharing functionality
├── source_evaluator.py         # Source credibility assessment
├── video_processor.py          # Video content processing
├── web_scraper.py              # Web content extraction
├── pyproject.toml              # Project dependencies and metadata
├── uv.lock                     # Dependency lock file
└── Documentation files         # Various documentation files
```

## Core Components & Relationships

### 1. Application Layer
- **app.py**: Main Streamlit interface with multi-page navigation
- **api.py**: FastAPI backend for API endpoints and services
- **main.py**: Application bootstrap and configuration

### 2. AI Integration Layer
- **gemini_helper.py**: Primary AI engine using Google Gemini 2.5
- **groq_helper.py**: Backup AI engine using Groq Llama 3.3
- **image_processor.py**: Visual content analysis with Gemini Vision

### 3. Content Processing Layer
- **web_scraper.py**: URL content extraction using Trafilatura and BeautifulSoup
- **video_processor.py**: YouTube and video platform processing
- **source_evaluator.py**: Multi-criteria source credibility assessment

### 4. Data Management Layer
- **database.py**: PostgreSQL integration with SQLAlchemy ORM
- **cache_manager.py**: Redis-like caching for performance optimization
- **sharing_utils.py**: Public sharing and link generation

### 5. Utility Layer
- **export_utils.py**: Multi-format export (PDF, Word, Markdown)

## Architectural Patterns

### 1. Modular Design
- **Separation of Concerns**: Each module handles specific functionality
- **Loose Coupling**: Modules interact through well-defined interfaces
- **High Cohesion**: Related functionality grouped within modules

### 2. Service-Oriented Architecture
- **AI Services**: Gemini and Groq as interchangeable AI providers
- **Content Services**: Web scraping, video processing, image analysis
- **Data Services**: Database operations, caching, export functionality

### 3. Multi-Provider Pattern
- **AI Provider Abstraction**: Seamless switching between Gemini and Groq
- **Fallback Mechanisms**: Automatic failover when primary services unavailable
- **Configuration-Driven**: Provider selection through environment variables

### 4. Event-Driven Processing
- **Asynchronous Operations**: Non-blocking content processing
- **Progress Tracking**: Real-time status updates during analysis
- **Error Propagation**: Graceful error handling with user feedback

## Data Flow Architecture

### 1. Content Analysis Flow
```
URL Input → Web Scraper → Content Extraction → AI Analysis → Database Storage → UI Display
```

### 2. Video Processing Flow
```
Video URL → Video Processor → Transcript Extraction → AI Analysis → Result Display
```

### 3. Image Analysis Flow
```
Image URLs → Image Processor → Gemini Vision → Analysis Results → Integration
```

### 4. Export Flow
```
Analysis Data → Export Utils → Format Generation → File Download
```

## Component Dependencies

### Core Dependencies
- **Streamlit**: Web application framework
- **FastAPI**: API backend framework
- **SQLAlchemy**: Database ORM
- **Trafilatura**: Content extraction
- **BeautifulSoup**: HTML parsing

### AI Dependencies
- **google-genai**: Google Gemini API client
- **groq**: Groq API client
- **Pillow**: Image processing

### Utility Dependencies
- **ReportLab**: PDF generation
- **python-docx**: Word document creation
- **qrcode**: QR code generation
- **yt-dlp**: Video processing

## Configuration Management

### Environment Variables
- **GEMINI_API_KEY**: Google Gemini API authentication
- **GROQ_API_KEY**: Groq API authentication (optional)
- **DATABASE_URL**: PostgreSQL connection string

### Configuration Files
- **.streamlit/config.toml**: Streamlit server configuration
- **pyproject.toml**: Project metadata and dependencies

## Scalability Considerations

### 1. Horizontal Scaling
- **Stateless Design**: Application components maintain no session state
- **Database Separation**: Data layer separated from application logic
- **API-First Approach**: Backend services accessible via REST API

### 2. Performance Optimization
- **Caching Layer**: Intelligent caching for repeated requests
- **Async Processing**: Non-blocking operations for better responsiveness
- **Resource Management**: Efficient memory and API usage

### 3. Reliability Features
- **Error Handling**: Comprehensive exception management
- **Fallback Systems**: Multiple AI providers for redundancy
- **Data Persistence**: Reliable storage with PostgreSQL

## Integration Points

### External Services
- **Google Gemini API**: Primary AI analysis engine
- **Groq API**: Backup AI analysis engine
- **PostgreSQL Database**: Data persistence (via Neon or similar)

### Internal Interfaces
- **Module Interfaces**: Well-defined function signatures
- **Data Models**: Consistent data structures across components
- **Error Interfaces**: Standardized error handling and reporting