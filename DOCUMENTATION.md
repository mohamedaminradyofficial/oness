# 📚 دليل توثيق شامل - الوكيل الذكي لتحليل المحتوى

## 📋 جدول المحتويات
1. [نظرة عامة على المشروع](#نظرة-عامة-على-المشروع)
2. [البنية المعمارية](#البنية-المعمارية)
3. [الإضافات والتكاملات المستخدمة](#الإضافات-والتكاملات-المستخدمة)
4. [دليل الاستخدام الكامل](#دليل-الاستخدام-الكامل)
5. [الإعداد والتثبيت](#الإعداد-والتثبيت)
6. [شرح الأكواد والوظائف](#شرح-الأكواد-والوظائف)
7. [قاعدة البيانات](#قاعدة-البيانات)
8. [استكشاف الأخطاء](#استكشاف-الأخطاء)
9. [التحسينات المستقبلية](#التحسينات-المستقبلية)

---

## 🎯 نظرة عامة على المشروع

### ما هو هذا التطبيق؟
الوكيل الذكي لتحليل المحتوى هو تطبيق ويب تفاعلي متقدم مبني بـ **Streamlit** يقوم بتحليل وشرح المحتوى من أي رابط على الإنترنت باللغة العربية بشكل شامل ومبسط.

### المشكلة التي يحلها
- **تحدي فهم المحتوى التقني**: العديد من المقالات والمصادر التقنية معقدة وصعبة الفهم
- **تقييم موثوقية المصادر**: صعوبة تحديد مدى موثوقية المحتوى على الإنترنت
- **اللغة العربية**: قلة الأدوات التي تقدم تحليلاً شاملاً بالعربية
- **الأكواد البرمجية**: شرح الأكواد الموجودة في المقالات بطريقة مبسطة

### الحل المقدم
تطبيق ذكي يستخدم تقنيات الذكاء الاصطناعي لـ:
1. استخراج المحتوى من أي رابط تلقائياً
2. تحليل المحتوى بعمق باستخدام نماذج AI متقدمة
3. شرح المحتوى بلغة عربية بسيطة ومفهومة
4. تقييم موثوقية المصدر بشكل موضوعي
5. اقتراح مصادر إضافية للقراءة والتعلم
6. حفظ جميع التحليلات للرجوع إليها لاحقاً

---

## 🏗️ البنية المعمارية

### نظرة عامة على الملفات

```
المشروع/
├── app.py                    # التطبيق الرئيسي (واجهة Streamlit)
├── web_scraper.py           # استخراج المحتوى من الويب
├── gemini_helper.py         # التكامل مع Gemini API
├── groq_helper.py           # التكامل مع Groq API (احتياطي)
├── source_evaluator.py      # تقييم موثوقية المصادر
├── image_processor.py       # معالجة وتحليل الصور
├── database.py              # إدارة قاعدة البيانات
├── replit.md               # وثائق المشروع
└── DOCUMENTATION.md        # هذا الملف
```

### تدفق العمل (Workflow)

```
المستخدم يدخل الرابط
    ↓
استخراج المحتوى (web_scraper.py)
    ↓
تحليل المحتوى (gemini_helper.py / groq_helper.py)
    ↓
كشف وتحليل الأكواد
    ↓
تقييم موثوقية المصدر (source_evaluator.py)
    ↓
البحث عن مراجع إضافية
    ↓
معالجة الصور (إن وجدت) (image_processor.py)
    ↓
حفظ النتائج في قاعدة البيانات (database.py)
    ↓
عرض النتائج للمستخدم (app.py)
```

---

## 🔌 الإضافات والتكاملات المستخدمة

### 1. Gemini Blueprint (`blueprint:python_gemini`)

#### ما هو Gemini؟
Gemini هو نموذج ذكاء اصطناعي متعدد الوسائط من Google، يتميز بـ:
- قدرة على فهم النصوص والصور والفيديوهات
- دعم ممتاز للغة العربية
- سرعة عالية في المعالجة
- دقة في التحليل والشرح

#### كيف نستخدمه في المشروع؟

**في `gemini_helper.py`:**
```python
from google import genai
from google.genai import types
import os

# إنشاء عميل Gemini
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# تحليل النصوص
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt
)

# تحليل الصور (Gemini Vision)
response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
        "اشرح هذه الصورة بالتفصيل"
    ]
)
```

#### النماذج المستخدمة:
- **gemini-2.5-flash**: للتحليل السريع للنصوص
- **gemini-2.5-pro**: للتحليل المتقدم والصور

#### المفتاح السري المطلوب:
```bash
GEMINI_API_KEY=your_api_key_here
```

**كيفية الحصول على المفتاح:**
1. اذهب إلى [Google AI Studio](https://aistudio.google.com/app/apikey)
2. سجل الدخول بحساب Google
3. انقر على "Get API Key"
4. انسخ المفتاح واحفظه في Secrets

---

### 2. Web Scraper Blueprint (`blueprint:web_scraper`)

#### ما هو Web Scraper؟
نظام متقدم لاستخراج المحتوى من مواقع الويب بشكل ذكي ونظيف.

#### المكتبات المستخدمة:

**1. Trafilatura:**
- استخراج النص الرئيسي من الصفحات
- إزالة الإعلانات والعناصر غير المرغوبة
- الحصول على البيانات الوصفية (العنوان، التاريخ، الكاتب)

**2. BeautifulSoup:**
- تحليل HTML بدقة
- استخراج الأكواد البرمجية
- استخراج الصور

#### كيف نستخدمه في المشروع؟

**في `web_scraper.py`:**
```python
import trafilatura
from bs4 import BeautifulSoup

def extract_content_from_url(url: str) -> dict:
    # تحميل الصفحة
    downloaded = trafilatura.fetch_url(url)
    
    # استخراج النص الرئيسي
    main_text = trafilatura.extract(downloaded)
    
    # استخراج البيانات الوصفية
    metadata = trafilatura.extract_metadata(downloaded)
    
    # تحليل HTML للحصول على الأكواد
    soup = BeautifulSoup(downloaded, 'html.parser')
    code_blocks = soup.find_all(['code', 'pre'])
    
    return {
        "url": url,
        "title": metadata.title,
        "main_content": main_text,
        "code_blocks": [code.get_text() for code in code_blocks],
        "has_code": len(code_blocks) > 0
    }
```

#### مميزات:
- سريع وفعّال
- يدعم معظم المواقع
- نظيف ومنظم
- لا يحتاج مفاتيح API

---

### 3. Groq API (نظام احتياطي)

#### لماذا نحتاج نظام احتياطي؟
- ضمان استمرارية الخدمة
- في حالة تعطل Gemini API
- تنويع مصادر الذكاء الاصطناعي

#### كيف يعمل؟

**في `groq_helper.py`:**
```python
from groq import Groq
import os

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

chat_completion = client.chat.completions.create(
    messages=[{"role": "user", "content": prompt}],
    model="llama-3.3-70b-versatile",
    temperature=0.7,
    max_tokens=8000
)
```

#### النموذج المستخدم:
- **llama-3.3-70b-versatile**: نموذج قوي من Meta

#### المفتاح السري المطلوب:
```bash
GROQ_API_KEY=your_groq_key_here
```

**كيفية الحصول على المفتاح:**
1. اذهب إلى [Groq Console](https://console.groq.com/)
2. سجل حساب جديد
3. اذهب إلى API Keys
4. أنشئ مفتاح جديد

---

### 4. PostgreSQL Database (Neon)

#### ما هي قاعدة البيانات؟
قاعدة بيانات PostgreSQL مدارة بواسطة Neon، تستخدم لـ:
- حفظ سجل جميع التحليلات
- إمكانية الرجوع للتحليلات السابقة
- البحث في السجل
- حذف التحليلات

#### البنية:

**جدول `analysis_history`:**
```sql
CREATE TABLE analysis_history (
    id SERIAL PRIMARY KEY,
    url VARCHAR NOT NULL,
    title VARCHAR,
    content_preview TEXT,
    analysis_result TEXT NOT NULL,
    code_analysis TEXT,
    overall_rating FLOAT,
    credibility_score FLOAT,
    quality_score FLOAT,
    evaluation_summary TEXT,
    related_resources TEXT,
    ai_provider VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### كيف نستخدمها؟

**في `database.py`:**
```python
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.environ.get("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"
    id = Column(Integer, primary_key=True)
    url = Column(String, nullable=False)
    # ... باقي الحقول
```

#### المفتاح السري:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```
(يتم إنشاؤه تلقائياً بواسطة Replit)

---

## 📖 دليل الاستخدام الكامل

### الخطوة 1: إعداد المفاتيح السرية

1. افتح قسم Secrets في Replit
2. أضف المفاتيح التالية:
   - `GEMINI_API_KEY`: مفتاح Google AI Studio (إلزامي)
   - `GROQ_API_KEY`: مفتاح Groq API (اختياري)
   - `DATABASE_URL`: يتم إنشاؤه تلقائياً

### الخطوة 2: تشغيل التطبيق

```bash
streamlit run app.py --server.port 5000
```

### الخطوة 3: استخدام التطبيق

#### الوضع 1: تحليل جديد 🔍

1. **اختر "تحليل جديد" من القائمة الجانبية**
2. **أدخل الرابط** الذي تريد تحليله:
   - مقالات
   - مدونات
   - وثائق تقنية
   - صفحات تعليمية

3. **انقر على "ابدأ التحليل"**

4. **انتظر النتائج** (قد يستغرق 30-60 ثانية):
   - استخراج المحتوى ✓
   - تحليل المحتوى ✓
   - تحليل الأكواد (إن وجدت) ✓
   - تقييم موثوقية المصدر ✓
   - البحث عن مراجع إضافية ✓
   - معالجة الصور (إن وجدت) ✓

5. **اقرأ النتائج**:
   - **الملخص العام**: نظرة سريعة على المحتوى
   - **الشرح التفصيلي**: شرح شامل ومبسط
   - **تحليل الأكواد**: شرح الأكواد البرمجية
   - **تقييم المصدر**: 
     - تقييم عام (من 5)
     - تقييم الموثوقية
     - تقييم الجودة
     - نقاط القوة والضعف
     - توصية نهائية
   - **مراجع إضافية**: 5 مصادر موثوقة للقراءة

#### الوضع 2: السجل السابق 📚

1. **اختر "السجل السابق" من القائمة الجانبية**
2. **تصفح التحليلات السابقة**:
   - مرتبة من الأحدث للأقدم
   - تعرض العنوان والتاريخ
   - معلومات عن AI المستخدم
3. **انقر على "عرض التفاصيل"** لأي تحليل
4. **احذف التحليلات** غير المرغوبة

---

## 🛠️ الإعداد والتثبيت

### المتطلبات الأساسية

#### 1. المكتبات المثبتة:

```toml
[project]
dependencies = [
    "streamlit",              # واجهة التطبيق
    "google-genai",           # Gemini API
    "groq",                   # Groq API
    "trafilatura",            # استخراج المحتوى
    "beautifulsoup4",         # تحليل HTML
    "lxml",                   # معالجة XML/HTML
    "requests",               # طلبات HTTP
    "langdetect",             # كشف اللغة
    "markdownify",            # تحويل HTML لـ Markdown
    "pillow",                 # معالجة الصور
    "sqlalchemy",             # ORM للبيانات
    "psycopg2-binary",        # PostgreSQL driver
    "pydantic",               # التحقق من البيانات
    "sift-stack-py"           # أدوات إضافية
]
```

#### 2. الإعدادات (`.streamlit/config.toml`):

```toml
[server]
port = 5000
address = "0.0.0.0"
headless = true

[browser]
gatherUsageStats = false
```

### خطوات التثبيت من الصفر

```bash
# 1. استنساخ المشروع
git clone <repository_url>
cd project

# 2. تثبيت المكتبات (تلقائي في Replit)
# يتم التثبيت من pyproject.toml

# 3. إعداد المفاتيح السرية
# في Replit Secrets، أضف:
# GEMINI_API_KEY=your_key
# GROQ_API_KEY=your_key (اختياري)

# 4. تشغيل التطبيق
streamlit run app.py --server.port 5000
```

---

## 💻 شرح الأكواد والوظائف

### 1. app.py - التطبيق الرئيسي

#### الهيكل العام:

```python
import streamlit as st
from web_scraper import extract_content_from_url
from gemini_helper import analyze_content_with_gemini
from groq_helper import analyze_content_with_groq
from source_evaluator import evaluate_source_credibility, find_related_resources
from image_processor import extract_and_analyze_images
from database import save_analysis, get_recent_analyses

# إعداد الصفحة
st.set_page_config(
    page_title="الوكيل الذكي",
    page_icon="🤖",
    layout="wide"
)

# CSS مخصص للعربية
st.markdown("""
<style>
    .main {
        direction: rtl;
        text-align: right;
    }
</style>
""", unsafe_allow_html=True)
```

#### الوظيفة الرئيسية للتحليل:

```python
def analyze_url():
    url = st.session_state.url_input
    
    # 1. استخراج المحتوى
    with st.spinner("🔄 جاري استخراج المحتوى..."):
        content_data = extract_content_from_url(url)
    
    # 2. تحليل المحتوى
    with st.spinner("🧠 جاري التحليل..."):
        if use_gemini:
            analysis = analyze_content_with_gemini(
                content_data['main_content'], 
                url
            )
        else:
            analysis = analyze_content_with_groq(
                content_data['main_content'], 
                url
            )
    
    # 3. تحليل الأكواد
    if content_data['has_code']:
        code_analysis = analyze_code_blocks(content_data['code_blocks'])
    
    # 4. تقييم المصدر
    evaluation = evaluate_source_credibility(
        url, 
        content_data['main_content']
    )
    
    # 5. البحث عن مراجع
    resources = find_related_resources(
        content_data['main_content'], 
        url
    )
    
    # 6. معالجة الصور
    images_analysis = extract_and_analyze_images(url)
    
    # 7. حفظ في قاعدة البيانات
    save_analysis(
        url=url,
        title=content_data['title'],
        analysis_result=analysis,
        evaluation_summary=evaluation,
        related_resources=resources
    )
```

### 2. web_scraper.py - استخراج المحتوى

#### الوظيفة الرئيسية:

```python
import trafilatura
from bs4 import BeautifulSoup
import requests

def extract_content_from_url(url: str) -> dict:
    """
    استخراج محتوى شامل من أي رابط
    """
    # تحميل الصفحة باستخدام trafilatura
    downloaded = trafilatura.fetch_url(url)
    
    if not downloaded:
        raise Exception("فشل تحميل المحتوى")
    
    # استخراج النص الرئيسي
    main_text = trafilatura.extract(downloaded)
    
    # استخراج البيانات الوصفية
    metadata = trafilatura.extract_metadata(downloaded)
    
    # تحليل HTML
    soup = BeautifulSoup(downloaded, 'html.parser')
    
    # إزالة السكريبتات والأنماط
    for script in soup(["script", "style"]):
        script.decompose()
    
    # استخراج الأكواد
    code_blocks = soup.find_all(['code', 'pre'])
    code_content = [code.get_text() for code in code_blocks]
    
    # استخراج الصور
    images = soup.find_all('img')
    image_urls = [img.get('src') for img in images if img.get('src')]
    
    return {
        "url": url,
        "title": metadata.title if metadata else soup.title.string,
        "main_content": main_text or "",
        "code_blocks": code_content,
        "has_code": len(code_content) > 0,
        "images": image_urls,
        "author": metadata.author if metadata else "",
        "date": metadata.date if metadata else ""
    }

def is_valid_url(url: str) -> bool:
    """
    التحقق من صحة الرابط
    """
    import re
    regex = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return url is not None and regex.search(url) is not None
```

### 3. gemini_helper.py - Gemini AI

#### تحليل النصوص:

```python
from google import genai
from google.genai import types
import os

def get_gemini_client():
    """إنشاء عميل Gemini"""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY غير موجود")
    return genai.Client(api_key=api_key)

def analyze_content_with_gemini(content: str, url: str, language: str = "ar") -> str:
    """تحليل المحتوى باستخدام Gemini"""
    
    prompt = f"""أنت وكيل ذكي متخصص في تحليل وشرح المحتوى بشكل شامل ومبسط.

المحتوى المستخرج من الرابط: {url}

{content}

المهمة:
1. قم بتحليل هذا المحتوى بدقة
2. قدم ملخصاً عاماً أولاً
3. ثم اشرح المحتوى بشكل تفصيلي ومبسط باللغة العربية
4. استخدم أسلوباً محترماً ولطيفاً بدون مصطلحات معقدة
5. إذا وجدت أكواد برمجية، اشرح كل كود مع خطوات التنفيذ
6. ركز على موضوعات الذكاء الاصطناعي إذا كانت موجودة
7. قدم النتيجة بتنسيق Markdown جميل ومنظم
8. أضف أمثلة توضيحية عند الحاجة

الرجاء تقديم الشرح الكامل باللغة العربية فقط."""

    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text or "عذراً، حدث خطأ في التحليل"
    except Exception as e:
        raise Exception(f"فشل التحليل: {str(e)}")
```

#### تحليل الأكواد:

```python
def detect_and_analyze_code(code_blocks: list) -> str:
    """كشف وتحليل الأكواد البرمجية"""
    
    if not code_blocks:
        return ""
    
    codes_text = "\n\n---\n\n".join(code_blocks)
    
    prompt = f"""أنت خبير في البرمجة. قم بتحليل الأكواد التالية:

{codes_text}

المطلوب:
1. حدد لغة البرمجة لكل كود
2. اشرح ماذا يفعل الكود بشكل مبسط
3. وضح خطوات التنفيذ
4. اذكر أي ملاحظات مهمة
5. قدم أمثلة على الاستخدام إن أمكن

قدم الإجابة باللغة العربية بتنسيق منظم."""

    client = get_gemini_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text
```

### 4. image_processor.py - معالجة الصور

```python
from google import genai
from google.genai import types
import requests
from PIL import Image
from io import BytesIO
import os

def analyze_image_with_gemini(image_url: str) -> str:
    """تحليل صورة باستخدام Gemini Vision"""
    
    try:
        # تحميل الصورة
        response = requests.get(image_url, timeout=10)
        image_bytes = response.content
        
        # تحليل باستخدام Gemini Vision
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        
        ai_response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type="image/jpeg"
                ),
                "قم بوصف هذه الصورة بالتفصيل باللغة العربية. اشرح ما تحتويه، وأي معلومات مهمة أو رسوم بيانية أو نصوص ظاهرة."
            ]
        )
        
        return ai_response.text
        
    except Exception as e:
        return f"خطأ في تحليل الصورة: {str(e)}"

def extract_and_analyze_images(url: str, max_images: int = 3) -> list:
    """استخراج وتحليل الصور من صفحة ويب"""
    
    from bs4 import BeautifulSoup
    import trafilatura
    
    downloaded = trafilatura.fetch_url(url)
    soup = BeautifulSoup(downloaded, 'html.parser')
    
    images = soup.find_all('img')
    results = []
    
    count = 0
    for img in images:
        if count >= max_images:
            break
            
        img_url = img.get('src')
        if not img_url:
            continue
            
        # التعامل مع الروابط النسبية
        if img_url.startswith('//'):
            img_url = 'https:' + img_url
        elif img_url.startswith('/'):
            from urllib.parse import urljoin
            img_url = urljoin(url, img_url)
        
        # تحليل الصورة
        analysis = analyze_image_with_gemini(img_url)
        
        results.append({
            "url": img_url,
            "analysis": analysis
        })
        
        count += 1
    
    return results
```

### 5. source_evaluator.py - تقييم المصادر

```python
from google import genai
from google.genai import types
import json
import os

def evaluate_source_credibility(url: str, content: str, use_gemini: bool = True) -> dict:
    """تقييم موثوقية المصدر"""
    
    prompt = f"""قم بتقييم موثوقية المصدر التالي:

الرابط: {url}
المحتوى: {content[:2000]}...

قيّم المصدر على المعايير التالية (من 1 إلى 5 نجوم):
1. الموثوقية العامة
2. جودة المحتوى
3. الحداثة
4. المصادر والمراجع
5. الموضوعية

قدم النتيجة بتنسيق JSON:
{{
  "overall_rating": <1-5>,
  "credibility_score": <1-5>,
  "quality_score": <1-5>,
  "recency_score": <1-5>,
  "sources_score": <1-5>,
  "objectivity_score": <1-5>,
  "summary": "<ملخص بالعربية>",
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "weaknesses": ["نقطة ضعف 1"],
  "recommendation": "<توصية نهائية>"
}}"""

    try:
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        return {
            "overall_rating": 3,
            "summary": f"خطأ في التقييم: {str(e)}"
        }

def find_related_resources(topic: str, url: str) -> list:
    """البحث عن مراجع إضافية"""
    
    prompt = f"""بناءً على الموضوع: {topic[:1000]}

اقترح 5 مصادر إضافية موثوقة:

{{
  "resources": [
    {{
      "title": "<العنوان>",
      "url": "<الرابط>",
      "type": "<مقال/كتاب/دورة>",
      "description": "<وصف>",
      "relevance": "<سبب الفائدة>"
    }}
  ]
}}"""

    try:
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        result = json.loads(response.text)
        return result.get("resources", [])
    except:
        return []
```

### 6. database.py - قاعدة البيانات

```python
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.environ.get("DATABASE_URL")
database_available = DATABASE_URL is not None

if database_available:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
else:
    engine = None
    SessionLocal = None

Base = declarative_base()

class AnalysisHistory(Base):
    """جدول سجل التحليلات"""
    __tablename__ = "analysis_history"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    title = Column(String, nullable=True)
    content_preview = Column(Text, nullable=True)
    analysis_result = Column(Text, nullable=False)
    code_analysis = Column(Text, nullable=True)
    overall_rating = Column(Float, nullable=True)
    credibility_score = Column(Float, nullable=True)
    quality_score = Column(Float, nullable=True)
    evaluation_summary = Column(Text, nullable=True)
    related_resources = Column(Text, nullable=True)
    ai_provider = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    """إنشاء الجداول"""
    if not database_available:
        return False
    try:
        Base.metadata.create_all(bind=engine)
        return True
    except:
        return False

def save_analysis(...):
    """حفظ تحليل جديد"""
    db = SessionLocal()
    try:
        new_analysis = AnalysisHistory(...)
        db.add(new_analysis)
        db.commit()
        return new_analysis.id
    finally:
        db.close()

def get_recent_analyses(limit: int = 10):
    """جلب التحليلات الأخيرة"""
    db = SessionLocal()
    try:
        return db.query(AnalysisHistory)\
            .order_by(AnalysisHistory.created_at.desc())\
            .limit(limit)\
            .all()
    finally:
        db.close()
```

---

## 🗄️ قاعدة البيانات

### البنية التفصيلية

```sql
CREATE TABLE analysis_history (
    id SERIAL PRIMARY KEY,
    url VARCHAR NOT NULL,
    title VARCHAR,
    content_preview TEXT,
    analysis_result TEXT NOT NULL,
    code_analysis TEXT,
    overall_rating FLOAT,
    credibility_score FLOAT,
    quality_score FLOAT,
    evaluation_summary TEXT,
    related_resources TEXT,
    ai_provider VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_created_at ON analysis_history(created_at DESC);
CREATE INDEX idx_url ON analysis_history(url);
```

### العمليات المتاحة

#### 1. حفظ تحليل جديد:
```python
analysis_id = save_analysis(
    url="https://example.com",
    title="عنوان المقال",
    content_preview="ملخص قصير...",
    analysis_result="التحليل الكامل...",
    code_analysis="تحليل الأكواد...",
    overall_rating=4.5,
    credibility_score=4.0,
    quality_score=5.0,
    evaluation_summary="تقييم المصدر...",
    related_resources='[{"title": "..."}]',
    ai_provider="gemini"
)
```

#### 2. جلب التحليلات الأخيرة:
```python
recent = get_recent_analyses(limit=10)
for analysis in recent:
    print(analysis.title, analysis.created_at)
```

#### 3. البحث بالمعرف:
```python
analysis = get_analysis_by_id(analysis_id=5)
print(analysis.analysis_result)
```

#### 4. حذف تحليل:
```python
delete_analysis(analysis_id=5)
```

---

## 🔧 استكشاف الأخطاء

### المشاكل الشائعة والحلول

#### 1. خطأ "GEMINI_API_KEY غير موجود"

**السبب:** المفتاح السري غير مضاف

**الحل:**
```
1. افتح Secrets في Replit
2. أضف GEMINI_API_KEY
3. أعد تشغيل التطبيق
```

#### 2. خطأ في استخراج المحتوى

**السبب:** 
- الرابط غير صحيح
- الموقع محمي
- مشكلة في الاتصال

**الحل:**
```python
# تحقق من صحة الرابط
if is_valid_url(url):
    # جرب الاستخراج
else:
    st.error("الرابط غير صحيح")
```

#### 3. بطء في التحليل

**السبب:** المحتوى طويل جداً

**الحل:**
```python
# اقتصر على أول 10000 حرف
content = content[:10000]
```

#### 4. قاعدة البيانات غير متاحة

**السبب:** DATABASE_URL غير موجود

**الحل:**
```
1. أنشئ قاعدة بيانات في Replit
2. تأكد من وجود DATABASE_URL
3. أعد تشغيل التطبيق
```

#### 5. خطأ في تحليل الصور

**السبب:** 
- صورة كبيرة جداً
- تنسيق غير مدعوم

**الحل:**
```python
# ضغط الصورة قبل التحليل
from PIL import Image

img = Image.open(image_path)
img.thumbnail((1024, 1024))
img.save("compressed.jpg")
```

---

## 🚀 التحسينات المستقبلية

### قصيرة المدى (شهر واحد)

1. **تصدير التحليلات**
   - تصدير PDF
   - تصدير Word
   - تصدير Markdown

2. **مشاركة التحليلات**
   - روابط مشاركة عامة
   - QR codes

3. **تحسين الأداء**
   - Caching للنتائج
   - معالجة متوازية

### متوسطة المدى (3 أشهر)

1. **مصادقة المستخدمين**
   - تسجيل دخول
   - ملفات شخصية
   - سجل خاص لكل مستخدم

2. **تحليل الفيديوهات**
   - استخراج النصوص
   - تحليل المحتوى المرئي
   - شرح الفيديوهات

3. **واجهة API**
   - REST API
   - WebSocket للبث المباشر
   - توثيق Swagger

### طويلة المدى (6 أشهر+)

1. **تطبيق الهاتف**
   - iOS
   - Android
   - مزامنة السحابة

2. **ذكاء اصطناعي متقدم**
   - تدريب نموذج خاص
   - تحليل أعمق
   - توصيات ذكية

3. **مجتمع المستخدمين**
   - تعليقات
   - تقييمات
   - مشاركة التحليلات

---

## 📊 إحصائيات الأداء

### زمن التنفيذ المتوقع:

| العملية | الزمن المتوقع |
|---------|---------------|
| استخراج المحتوى | 2-5 ثواني |
| تحليل النص (Gemini) | 10-20 ثانية |
| تحليل الأكواد | 5-10 ثواني |
| تقييم المصدر | 8-15 ثانية |
| البحث عن مراجع | 10-15 ثانية |
| معالجة الصور | 5-10 ثواني لكل صورة |
| **المجموع** | **40-75 ثانية** |

### استهلاك API:

| النموذج | التكلفة التقريبية |
|---------|-------------------|
| Gemini 2.5 Flash | $0.0002 لكل طلب |
| Gemini 2.5 Pro | $0.001 لكل طلب |
| Groq Llama 3.3 | مجاني (محدود) |

---

## 🔐 الأمان والخصوصية

### ممارسات الأمان المطبقة:

1. **عدم تخزين المفاتيح السرية في الكود**
   ```python
   # ✅ صحيح
   api_key = os.environ.get("GEMINI_API_KEY")
   
   # ❌ خطأ
   api_key = "AIzaSy..."
   ```

2. **التحقق من صحة المدخلات**
   ```python
   if not is_valid_url(url):
       raise ValueError("رابط غير صحيح")
   ```

3. **معالجة آمنة للأخطاء**
   ```python
   try:
       result = analyze_content(...)
   except Exception as e:
       logging.error(f"Error: {e}")
       return "عذراً، حدث خطأ"
   ```

4. **عدم تنفيذ أكواد غير آمنة**
   - لا يوجد `eval()` أو `exec()`
   - الأكواد تُعرض فقط للقراءة

---

## 📞 الدعم والمساعدة

### كيفية الحصول على المساعدة:

1. **الوثائق**: اقرأ هذا الملف أولاً
2. **الأخطاء الشائعة**: راجع قسم استكشاف الأخطاء
3. **التواصل**: افتح issue في GitHub

### الموارد المفيدة:

- [Streamlit Documentation](https://docs.streamlit.io/)
- [Google Gemini API](https://ai.google.dev/)
- [Groq API Documentation](https://console.groq.com/docs)
- [Trafilatura Docs](https://trafilatura.readthedocs.io/)

---

## 📝 ملاحظات ختامية

### أفضل الممارسات:

1. **اختبر الروابط قبل التحليل**
   - تأكد من صحة الرابط
   - تحقق من إمكانية الوصول

2. **راقب استهلاك API**
   - استخدم Gemini Flash للتحليلات السريعة
   - احتفظ بـ Pro للمهام المعقدة

3. **احفظ التحليلات المهمة**
   - قاعدة البيانات تحفظ كل شيء
   - لكن يمكن تصدير PDF للأهم

4. **شارك الملاحظات**
   - ساعدنا في التحسين
   - أبلغ عن الأخطاء

### شكر خاص:

- **Google** على Gemini API الرائع
- **Groq** على النموذج الاحتياطي
- **Streamlit** على الإطار السهل
- **المجتمع** على الدعم المستمر

---

**تم التوثيق بتاريخ:** نوفمبر 10، 2025

**الإصدار:** 1.0.0

**المطور:** Replit AI Agent

**الترخيص:** MIT License

---

## نهاية التوثيق
هذا الملف يحتوي على كل ما تحتاج معرفته حول المشروع. إذا كان لديك أي أسئلة، راجع الأقسام المناسبة أو تواصل معنا.

**حظاً موفقاً في استخدام الوكيل الذكي! 🚀**
