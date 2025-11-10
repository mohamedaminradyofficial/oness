# Technology Stack & Development Guide

## Programming Languages & Versions

### Primary Language
- **Python 3.11+**: Core application language with modern features
- **HTML/CSS**: Custom styling for Arabic RTL interface
- **JavaScript**: Minimal client-side enhancements
- **SQL**: Database queries and schema management

## Core Framework & Libraries

### Web Framework
- **Streamlit 1.51.0+**: Primary web application framework
  - Real-time updates and reactive components
  - Built-in Arabic RTL support
  - Multi-page application structure
- **FastAPI 0.121.1+**: Backend API framework
  - Async request handling
  - Automatic API documentation
  - Type validation with Pydantic

### AI & Machine Learning
- **google-genai 1.49.0+**: Google Gemini API client
  - Text analysis with Gemini 2.5 Flash
  - Vision analysis with Gemini 2.5 Pro
  - JSON response formatting
- **groq 0.33.0+**: Groq API client for Llama 3.3 70B
  - Backup AI provider
  - High-speed inference

### Content Processing
- **trafilatura 2.0.0+**: Web content extraction
  - Clean text extraction from HTML
  - Metadata extraction (author, date, title)
  - Multi-language support
- **beautifulsoup4 4.14.2+**: HTML parsing and manipulation
  - Code block detection
  - Image URL extraction
  - DOM traversal and cleaning
- **yt-dlp 2025.10.22+**: Video processing
  - YouTube metadata extraction
  - Transcript downloading
  - Multi-platform video support
- **youtube-transcript-api 1.2.3+**: Transcript extraction
  - Multiple language support
  - Timestamp preservation

### Database & Storage
- **SQLAlchemy 2.0.44+**: Database ORM
  - PostgreSQL integration
  - Migration support
  - Relationship management
- **psycopg2-binary 2.9.11+**: PostgreSQL adapter
  - Connection pooling
  - Binary protocol support

### Document Processing
- **reportlab 4.4.4+**: PDF generation
  - Arabic text support with python-bidi
  - Custom layouts and styling
- **python-docx 1.2.0+**: Word document creation
  - Rich text formatting
  - Table and image support
- **markdown 3.10+**: Markdown processing
  - Export format support
  - HTML conversion

### Utility Libraries
- **requests 2.32.5+**: HTTP client
  - Image downloading
  - API requests
  - Timeout handling
- **pillow 12.0.0+**: Image processing
  - Format conversion
  - Resize and optimization
- **qrcode 8.2+**: QR code generation
  - Sharing link QR codes
  - Custom styling options
- **langdetect 1.0.9+**: Language detection
  - Content language identification
  - Multi-language support

### Arabic Language Support
- **arabic-reshaper 3.0.0+**: Arabic text reshaping
  - Proper Arabic character connection
  - PDF and document support
- **python-bidi 0.6.7+**: Bidirectional text support
  - RTL text rendering
  - Mixed language text handling

## Build System & Dependencies

### Package Management
- **uv**: Modern Python package manager
  - Fast dependency resolution
  - Lock file generation (uv.lock)
  - Virtual environment management
- **pyproject.toml**: Project configuration
  - Dependency specification
  - Build system configuration
  - Project metadata

### Development Dependencies
```toml
[project]
name = "repl-nix-workspace"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "streamlit>=1.51.0",
    "fastapi>=0.121.1",
    "google-genai>=1.49.0",
    "groq>=0.33.0",
    "trafilatura>=2.0.0",
    "beautifulsoup4>=4.14.2",
    "sqlalchemy>=2.0.44",
    "psycopg2-binary>=2.9.11",
    # ... additional dependencies
]
```

## Development Commands

### Application Startup
```bash
# Start Streamlit application
streamlit run app.py --server.port 5000

# Start FastAPI backend
uvicorn api:app --host 0.0.0.0 --port 8000

# Combined startup (main.py)
python main.py
```

### Development Tools
```bash
# Install dependencies
uv sync

# Update dependencies
uv lock --upgrade

# Run with specific Python version
uv run --python 3.11 streamlit run app.py

# Environment management
uv venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

### Database Operations
```bash
# Initialize database
python -c "from database import init_db; init_db()"

# Run migrations (if implemented)
python database.py migrate

# Clear cache
python -c "from cache_manager import clear_cache; clear_cache()"
```

## Configuration Management

### Environment Variables
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=postgresql://user:pass@host:port/db

# Development
DEBUG=true
LOG_LEVEL=INFO
```

### Streamlit Configuration (.streamlit/config.toml)
```toml
[server]
port = 5000
address = "0.0.0.0"
headless = true

[browser]
gatherUsageStats = false

[theme]
base = "light"
```

## API Integration Details

### Google Gemini API
- **Models Used**:
  - `gemini-2.5-flash`: Fast text analysis
  - `gemini-2.5-pro`: Advanced analysis and vision
- **Rate Limits**: Managed through client configuration
- **Error Handling**: Automatic retry with exponential backoff

### Groq API
- **Model**: `llama-3.3-70b-versatile`
- **Usage**: Backup AI provider
- **Configuration**: Temperature 0.7, max tokens 8000

## Performance Considerations

### Caching Strategy
- **Content Caching**: URL-based content caching
- **Analysis Caching**: AI response caching
- **Image Caching**: Processed image storage
- **Expiration**: Time-based cache invalidation

### Memory Management
- **Streaming Processing**: Large content handled in chunks
- **Resource Cleanup**: Automatic cleanup of temporary files
- **Connection Pooling**: Database connection optimization

### Optimization Techniques
- **Lazy Loading**: Components loaded on demand
- **Async Processing**: Non-blocking operations
- **Batch Operations**: Multiple requests combined
- **Compression**: Response compression for large data

## Security Considerations

### API Key Management
- Environment variable storage
- No hardcoded credentials
- Secure key rotation support

### Input Validation
- URL validation and sanitization
- Content size limits
- SQL injection prevention
- XSS protection

### Data Privacy
- No sensitive data logging
- Secure database connections
- Optional data retention policies

## Deployment Architecture

### Development Environment
- Local Streamlit server
- SQLite for development database
- File-based caching

### Production Environment
- Streamlit Cloud or similar hosting
- PostgreSQL database (Neon)
- Redis for caching (optional)
- Environment-based configuration

### Monitoring & Logging
- Streamlit built-in metrics
- Custom error tracking
- Performance monitoring
- Usage analytics (optional)