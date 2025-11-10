# توثيق API - الوكيل الذكي لتحليل المحتوى v2.0

## نظرة عامة

واجهة برمجية شاملة (REST API) مبنية بـ FastAPI لتحليل المحتوى من الإنترنت باستخدام الذكاء الاصطناعي.

**عنوان API**: `http://0.0.0.0:8000`

**توثيق Swagger**: `http://0.0.0.0:8000/docs`

**توثيق ReDoc**: `http://0.0.0.0:8000/redoc`

---

## المصادقة

حالياً، الـ API لا يتطلب مصادقة. جميع الـ endpoints عامة.

---

## Endpoints

### 1. Health Check

#### `GET /`
نقطة البداية - التحقق من حالة الـ API

**Response:**
```json
{
  "message": "الوكيل الذكي لتحليل المحتوى - API v2.0",
  "status": "running",
  "docs": "/docs",
  "timestamp": "2024-11-10T12:34:56"
}
```

#### `GET /health`
فحص صحة النظام والخدمات

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "gemini_api": "available",
    "groq_api": "available",
    "database": "available",
    "cache": "active"
  },
  "cache_stats": {
    "total_items": 10,
    "active_items": 8,
    "expired_items": 2
  }
}
```

---

### 2. Analysis Endpoints

#### `POST /analyze`
تحليل محتوى من رابط

**Request Body:**
```json
{
  "url": "https://example.com/article",
  "ai_provider": "gemini",
  "analyze_images": false,
  "analyze_video": false
}
```

**Parameters:**
- `url` (required): رابط الصفحة المراد تحليلها
- `ai_provider` (optional): محرك AI (gemini أو groq) - افتراضي: gemini
- `analyze_images` (optional): تحليل الصور في الصفحة - افتراضي: false
- `analyze_video` (optional): تحليل الفيديو إذا كان موجوداً - افتراضي: false

**Response:**
```json
{
  "success": true,
  "analysis_id": 123,
  "url": "https://example.com/article",
  "title": "عنوان المقال",
  "analysis": "التحليل التفصيلي...",
  "code_analysis": "تحليل الأكواد...",
  "evaluation": {
    "overall_rating": 4,
    "credibility_score": 5,
    "quality_score": 4,
    "summary": "ملخص التقييم"
  },
  "related_resources": [...],
  "has_code": true,
  "timestamp": "2024-11-10T12:34:56"
}
```

#### `GET /analyze/{analysis_id}`
الحصول على تحليل محفوظ بواسطة ID

**Response:**
```json
{
  "id": 123,
  "url": "https://example.com/article",
  "title": "عنوان المقال",
  "analysis": "التحليل...",
  "code_analysis": "تحليل الأكواد...",
  "overall_rating": 4,
  "created_at": "2024-11-10T12:34:56"
}
```

#### `GET /analyses`
الحصول على قائمة التحليلات الأخيرة

**Query Parameters:**
- `limit` (optional): عدد النتائج - افتراضي: 20، أقصى: 100

**Response:**
```json
{
  "total": 5,
  "analyses": [
    {
      "id": 123,
      "url": "https://example.com/article",
      "title": "عنوان المقال",
      "overall_rating": 4,
      "created_at": "2024-11-10T12:34:56"
    }
  ]
}
```

#### `DELETE /analyze/{analysis_id}`
حذف تحليل

**Response:**
```json
{
  "success": true,
  "message": "تم حذف التحليل"
}
```

---

### 3. Export Endpoints

#### `POST /export`
تصدير تحليل بصيغة معينة

**Request Body:**
```json
{
  "analysis_id": 123,
  "format": "pdf"
}
```

**Parameters:**
- `analysis_id` (required): معرف التحليل
- `format` (required): صيغة التصدير (pdf, word, markdown)

**Response:**
- **PDF/Word**: Binary file download
- **Markdown**: JSON مع محتوى Markdown

---

### 4. Sharing Endpoints

#### `POST /share`
إنشاء رابط مشاركة لتحليل

**Request Body:**
```json
{
  "analysis_id": 123,
  "is_public": true,
  "expires_in_days": 30
}
```

**Parameters:**
- `analysis_id` (required): معرف التحليل
- `is_public` (optional): هل الرابط عام؟ - افتراضي: true
- `expires_in_days` (optional): عدد أيام الصلاحية

**Response:**
```json
{
  "success": true,
  "share_id": "abc123def456",
  "share_url": "/shared/abc123def456",
  "qr_code_url": "/qr/abc123def456"
}
```

#### `GET /shared/{share_id}`
الحصول على تحليل مشارك

**Response:**
```json
{
  "share_id": "abc123def456",
  "url": "https://example.com/article",
  "title": "عنوان المقال",
  "analysis_data": {...},
  "views_count": 42,
  "created_at": "2024-11-10 12:34"
}
```

#### `GET /qr/{share_id}`
الحصول على QR code لرابط مشاركة

**Response:** PNG Image

#### `GET /shares`
الحصول على روابط المشاركة

**Query Parameters:**
- `limit` (optional): عدد النتائج - افتراضي: 20، أقصى: 100

**Response:**
```json
{
  "total": 5,
  "shares": [
    {
      "share_id": "abc123def456",
      "title": "عنوان المقال",
      "url": "https://example.com/article",
      "views_count": 42,
      "is_public": true,
      "created_at": "2024-11-10 12:34"
    }
  ]
}
```

#### `DELETE /share/{share_id}`
حذف رابط مشاركة

**Response:**
```json
{
  "success": true,
  "message": "تم حذف رابط المشاركة"
}
```

---

### 5. Video Processing Endpoints

#### `POST /video/analyze`
تحليل فيديو (YouTube وغيره)

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "success": true,
  "video_info": {
    "title": "عنوان الفيديو",
    "description": "الوصف",
    "duration": 600,
    "view_count": 10000,
    "uploader": "اسم القناة",
    "upload_date": "20241110"
  },
  "transcript": {
    "full_text": "النص الكامل...",
    "language": "ar",
    "length": 150
  },
  "ai_analysis": "التحليل الذكي..."
}
```

---

### 6. Image Analysis Endpoints

#### `POST /image/analyze`
تحليل صورة من رابط

**Request Body:**
```json
{
  "image_url": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "image_url": "https://example.com/image.jpg",
  "analysis": "تحليل الصورة..."
}
```

---

### 7. Cache Management Endpoints

#### `GET /cache/stats`
إحصائيات الـ Cache

**Response:**
```json
{
  "total_items": 10,
  "active_items": 8,
  "expired_items": 2,
  "memory_keys": [...]
}
```

#### `POST /cache/clear`
مسح الـ Cache

**Response:**
```json
{
  "success": true,
  "message": "تم مسح الـ Cache"
}
```

#### `POST /cache/cleanup`
تنظيف العناصر المنتهية الصلاحية

**Response:**
```json
{
  "success": true,
  "removed_items": 3
}
```

---

## أكواد الحالة (Status Codes)

- `200 OK`: نجاح الطلب
- `400 Bad Request`: خطأ في البيانات المرسلة
- `404 Not Found`: المورد غير موجود
- `410 Gone`: انتهت صلاحية الرابط
- `500 Internal Server Error`: خطأ في الخادم

---

## أمثلة الاستخدام

### Python
```python
import requests

# تحليل محتوى
response = requests.post('http://localhost:8000/analyze', json={
    'url': 'https://example.com/article',
    'ai_provider': 'gemini'
})
data = response.json()
print(data['analysis'])

# تصدير PDF
response = requests.post('http://localhost:8000/export', json={
    'analysis_id': 123,
    'format': 'pdf'
})
with open('analysis.pdf', 'wb') as f:
    f.write(response.content)
```

### cURL
```bash
# تحليل محتوى
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article", "ai_provider": "gemini"}'

# الحصول على QR code
curl http://localhost:8000/qr/abc123def456 --output qr.png
```

### JavaScript
```javascript
// تحليل محتوى
fetch('http://localhost:8000/analyze', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    url: 'https://example.com/article',
    ai_provider: 'gemini'
  })
})
.then(res => res.json())
.then(data => console.log(data.analysis));
```

---

## ملاحظات مهمة

1. **الـ Caching**: النتائج تُخزن مؤقتاً لمدة ساعتين لتحسين الأداء
2. **CORS**: مفعّل للسماح بالوصول من أي مصدر
3. **المفاتيح السرية**: يجب تعيين `GEMINI_API_KEY` أو `GROQ_API_KEY` في المتغيرات البيئية
4. **قاعدة البيانات**: يجب تعيين `DATABASE_URL` للتخزين الدائم
5. **الحد الأقصى**: بعض endpoints لها حد أقصى للنتائج (100)

---

## الدعم والمساعدة

للحصول على توثيق تفاعلي كامل، قم بزيارة:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
