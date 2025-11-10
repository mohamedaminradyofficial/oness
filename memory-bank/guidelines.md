# Development Guidelines & Standards

## Code Quality Standards Analysis

### 1. File Structure & Organization
- **Modular Design**: Each file serves a specific purpose with clear separation of concerns
- **Descriptive Naming**: Files use descriptive names that clearly indicate their functionality
  - `web_scraper.py` - Web content extraction
  - `gemini_helper.py` - AI integration
  - `export_utils.py` - Export functionality
  - `cache_manager.py` - Caching system
  - `video_processor.py` - Video processing
- **Logical Grouping**: Related functionality is grouped within single modules

### 2. Import Organization Standards
- **Standard Library First**: Python standard library imports at the top
- **Third-Party Libraries**: External dependencies grouped together
- **Local Imports**: Project-specific imports at the bottom
- **Explicit Imports**: Specific functions imported rather than entire modules where appropriate

Example pattern from `app.py`:
```python
import streamlit as st
import os
import json
from datetime import datetime
from web_scraper import extract_content_from_url, is_valid_url
from gemini_helper import analyze_content_with_gemini, detect_and_analyze_code
```

### 3. Documentation Standards
- **Module Docstrings**: Every module starts with a descriptive docstring in Arabic
- **Function Docstrings**: Functions include Arabic descriptions of their purpose
- **Inline Comments**: Arabic comments explaining complex logic
- **Type Hints**: Extensive use of type hints for function parameters and return values

Example pattern:
```python
def extract_youtube_id(url: str) -> Optional[str]:
    """
    استخراج معرف الفيديو من رابط YouTube
    """
```

### 4. Error Handling Patterns
- **Try-Catch Blocks**: Comprehensive exception handling with specific error messages
- **Graceful Degradation**: Functions return error dictionaries rather than raising exceptions
- **User-Friendly Messages**: Error messages in Arabic for end users
- **Logging Context**: Errors include contextual information

Example pattern from `video_processor.py`:
```python
try:
    transcript = transcript_list.find_transcript(['ar'])
    text_data = transcript.fetch()
    language = 'ar'
except:
    try:
        transcript = transcript_list.find_transcript(['en'])
        text_data = transcript.fetch()
        language = 'en'
    except:
        return {'error': 'لم يتم العثور على ترجمة لهذا الفيديو'}
```

## Semantic Patterns Overview

### 1. Configuration Management Pattern
- **Environment Variables**: Sensitive data stored in environment variables
- **Availability Checks**: Services checked for availability before use
- **Fallback Mechanisms**: Multiple providers with automatic fallback

Example from `app.py`:
```python
gemini_available = os.environ.get("GEMINI_API_KEY") is not None
groq_available = os.environ.get("GROQ_API_KEY") is not None

if gemini_available and groq_available:
    ai_provider = st.selectbox(...)
elif gemini_available:
    ai_provider = "Gemini (موصى به)"
```

### 2. Data Processing Pipeline Pattern
- **Sequential Processing**: Content flows through well-defined stages
- **Validation First**: Input validation before processing
- **Incremental Enhancement**: Each stage adds value to the data
- **Result Aggregation**: Final results combine all processing stages

Pipeline example from `app.py`:
```python
# 1. Extract content
content_data = extract_content_from_url(url_input)

# 2. Analyze content
analysis_text = analyze_content_with_gemini(content_data['main_content'], url_input)

# 3. Evaluate source
evaluation_data = evaluate_source_credibility(url_input, content_data['main_content'])

# 4. Find resources
resources_data = find_related_resources(content_data['main_content'][:1000], url_input)

# 5. Save results
save_analysis(...)
```

### 3. Multi-Provider Pattern
- **Provider Abstraction**: AI providers treated as interchangeable services
- **Dynamic Selection**: Provider chosen based on availability and user preference
- **Consistent Interface**: Same function signatures across providers
- **Fallback Logic**: Automatic switching when primary provider fails

Example from multiple files:
```python
use_gemini = "Gemini" in ai_provider
if use_gemini:
    analysis_text = analyze_content_with_gemini(content, url)
else:
    analysis_text = analyze_content_with_groq(content, url)
```

### 4. Caching Decorator Pattern
- **Function Decoration**: `@cache_result` decorator for automatic caching
- **TTL Management**: Time-to-live configuration for cache entries
- **Key Generation**: Automatic cache key generation from function parameters
- **Async Support**: Works with both sync and async functions

Example from `cache_manager.py`:
```python
@cache_result('analyze', ttl=7200)
def analyze_content(url):
    # Function implementation
    pass
```

### 5. Data Export Pattern
- **Format Abstraction**: Multiple export formats with consistent interface
- **Buffer Management**: BytesIO buffers for file generation
- **Arabic Text Handling**: Special processing for RTL text in PDFs
- **Metadata Preservation**: Analysis metadata included in all export formats

Example from `export_utils.py`:
```python
def export_to_pdf(analysis_data: dict) -> BytesIO:
    buffer = BytesIO()
    # PDF generation logic
    return buffer

def export_to_word(analysis_data: dict) -> BytesIO:
    buffer = BytesIO()
    # Word generation logic
    return buffer
```

## Internal API Usage Patterns

### 1. Streamlit UI Patterns
- **Page Configuration**: Consistent page setup with Arabic RTL support
- **Sidebar Navigation**: Mode selection through radio buttons
- **Column Layouts**: Responsive layouts using `st.columns()`
- **Progress Indicators**: `st.spinner()` for long-running operations
- **State Management**: Session state for maintaining user data

Example patterns:
```python
# Page configuration
st.set_page_config(
    page_title="الوكيل الذكي لتحليل المحتوى",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Column layouts
col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    analyze_button = st.button("🚀 ابدأ التحليل", use_container_width=True)

# Progress indicators
with st.spinner("🔄 جاري استخراج المحتوى..."):
    content_data = extract_content_from_url(url_input)
```

### 2. FastAPI Patterns
- **Pydantic Models**: Request/response validation with Pydantic
- **Dependency Injection**: Service dependencies injected through FastAPI
- **Exception Handling**: HTTPException for API error responses
- **CORS Configuration**: Cross-origin resource sharing setup
- **Documentation**: Automatic OpenAPI documentation generation

Example from `api.py`:
```python
class AnalysisRequest(BaseModel):
    url: HttpUrl
    ai_provider: str = "gemini"
    analyze_images: bool = False

@app.post("/analyze", tags=["Analysis"])
async def analyze_content(request: AnalysisRequest):
    if not is_valid_url(str(request.url)):
        raise HTTPException(status_code=400, detail="رابط غير صالح")
```

### 3. Database ORM Patterns
- **SQLAlchemy Models**: Declarative base classes for database tables
- **Session Management**: Context managers for database sessions
- **Query Patterns**: Consistent query patterns with error handling
- **Migration Support**: Database schema evolution support

Example patterns:
```python
# Model definition
class AnalysisHistory(Base):
    __tablename__ = "analysis_history"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)

# Session usage
db = SessionLocal()
try:
    new_analysis = AnalysisHistory(...)
    db.add(new_analysis)
    db.commit()
finally:
    db.close()
```

## Frequently Used Code Idioms

### 1. Safe Dictionary Access
```python
# Consistent use of .get() with defaults
title = analysis_data.get('title', 'غير متوفر')
rating = evaluation_data.get('overall_rating', 0)
```

### 2. List Comprehension for Data Processing
```python
# Clean and efficient data transformation
code_content = [code.get_text() for code in code_blocks]
image_urls = [img.get('src') for img in images if img.get('src')]
```

### 3. Context Managers for Resource Management
```python
# Proper resource cleanup
with st.spinner("🔄 جاري المعالجة..."):
    result = process_data()

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(url, download=False)
```

### 4. Conditional Processing Chains
```python
# Graceful fallback processing
try:
    transcript = transcript_list.find_transcript(['ar'])
    language = 'ar'
except:
    try:
        transcript = transcript_list.find_transcript(['en'])
        language = 'en'
    except:
        return None
```

### 5. Data Validation Patterns
```python
# Input validation before processing
if not url_input:
    st.error("⚠️ الرجاء إدخال رابط أولاً")
elif not is_valid_url(url_input):
    st.error("⚠️ الرابط غير صحيح")
elif ai_provider is None:
    st.error("⚠️ لا يمكن التحليل بدون مفتاح API")
```

## Popular Annotations & Type Hints

### 1. Function Type Annotations
```python
def extract_content_from_url(url: str) -> dict:
def get_cache(key: str) -> Optional[Any]:
def process_video_url(url: str) -> Dict:
def format_duration(seconds: int) -> str:
```

### 2. Pydantic Model Annotations
```python
class AnalysisRequest(BaseModel):
    url: HttpUrl
    ai_provider: str = "gemini"
    analyze_images: bool = False
    analyze_video: bool = False
```

### 3. Import Type Annotations
```python
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, HttpUrl
```

## Best Practices Summary

### 1. Code Organization
- Use descriptive module and function names
- Group related functionality in single files
- Maintain clear separation of concerns
- Follow consistent import organization

### 2. Error Handling
- Implement comprehensive exception handling
- Provide user-friendly error messages in Arabic
- Use graceful degradation patterns
- Include contextual error information

### 3. Data Processing
- Validate inputs before processing
- Use type hints for better code clarity
- Implement caching for performance optimization
- Follow consistent data transformation patterns

### 4. UI/UX Patterns
- Use consistent Streamlit component patterns
- Implement proper loading indicators
- Maintain responsive layouts
- Support Arabic RTL text properly

### 5. API Design
- Use Pydantic for request/response validation
- Implement proper HTTP status codes
- Provide comprehensive API documentation
- Follow RESTful design principles