# Content Analyzer - TypeScript Version

هذا التطبيق هو نسخة TypeScript من وكيل التحليل الذكي للمحتوى من الإنترنت.

## الهيكل

```
/
├── backend/          # Express.js API (TypeScript)
├── frontend/         # React + Material-UI (TypeScript)
└── shared/          # Shared types and utilities
```

## التثبيت والتشغيل

### 1. تثبيت التبعيات

```bash
npm install:all
```

أو يدوياً:
```bash
npm install
npm run install:backend
npm run install:frontend
```

### 2. إعداد المتغيرات البيئية

#### Backend (.env)
```env
PORT=8000
DATABASE_URL=mongodb://localhost:27017/content_analyzer
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
REACT_APP_GROQ_API_KEY=your_groq_api_key
```

### 3. بناء المشروع

```bash
npm run build
```

### 4. تشغيل التطبيق

```bash
npm run dev
```

سيتم تشغيل:
- Backend على: http://localhost:8000
- Frontend على: http://localhost:3000

## المتطلبات

- Node.js 18+
- MongoDB (لقاعدة البيانات)
- مفتاح API لـ Gemini أو Groq

## API Keys

### Gemini API Key
1. انتقل إلى [Google AI Studio](https://aistudio.google.com/)
2. أنشئ مفتاح API جديد
3. أضفه إلى متغيرات البيئة `GEMINI_API_KEY`

### Groq API Key
1. انتقل إلى [Groq Console](https://console.groq.com/)
2. أنشئ مفتاح API جديد
3. أضفه إلى متغيرات البيئة `GROQ_API_KEY`

## الميزات

- ✅ استخراج المحتوى من أي رابط
- ✅ تحليل النصوص باستخدام الذكاء الاصطناعي (Gemini/Groq)
- ✅ تقييم موثوقية المصادر
- ✅ كشف وتحليل الأكواد البرمجية
- ✅ البحث عن مراجع إضافية
- ✅ حفظ التحليلات في قاعدة البيانات
- ✅ واجهة عربية كاملة
- 🔄 تصدير النتائج (PDF, Word, Markdown) - قيد التطوير
- 🔄 مشاركة التحليلات - قيد التطوير

## التحويل من Python

تم تحويل هذا التطبيق من Python (Streamlit + FastAPI) إلى TypeScript (React + Express.js) مع الحفاظ على جميع الوظائف الأساسية.

### التغييرات الرئيسية:
- **Web Scraping**: من `trafilatura` إلى `axios + cheerio`
- **AI APIs**: تحديث إلى أحدث SDKs
- **Database**: من SQLAlchemy إلى Mongoose
- **Frontend**: من Streamlit إلى React + Material-UI
- **Backend**: من FastAPI إلى Express.js
