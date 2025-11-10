# دليل الاختبارات - Content Analyzer

## 📋 نظرة عامة

هذا المجلد يحتوي على جميع الاختبارات للمشروع، مقسمة إلى ثلاث فئات رئيسية:

- **Unit Tests** - اختبارات الوحدة (80+ اختبار)
- **Integration Tests** - اختبارات التكامل (20+ اختبار)  
- **E2E Tests** - اختبارات شاملة (10+ سيناريو)

## 🏗️ هيكل الاختبارات

```
tests/
├── unit/                    # اختبارات الوحدة
│   ├── utils/              # اختبار المساعدات
│   ├── routes/             # اختبار المسارات
│   ├── models/             # اختبار النماذج
│   └── middleware/         # اختبار الوسطاء
├── integration/            # اختبارات التكامل
│   └── api/               # اختبار APIs
├── e2e/                   # اختبارات شاملة
│   └── scenarios/         # سيناريوهات المستخدم
├── mocks/                 # البيانات الوهمية
└── setup.ts              # إعداد بيئة الاختبار
```

## 🚀 تشغيل الاختبارات

### جميع الاختبارات
```bash
npm test
```

### اختبارات محددة
```bash
# اختبارات الوحدة فقط
npm run test:unit

# اختبارات التكامل فقط
npm run test:integration

# اختبارات E2E فقط
npm run test:e2e

# مع مراقبة التغييرات
npm run test:watch
```

### تقرير التغطية
```bash
# تشغيل مع تقرير التغطية
npm run test:coverage

# من المجلد الرئيسي
npm run test:coverage
```

## 📊 متطلبات التغطية

- **الحد الأدنى**: 80% لجميع المقاييس
- **الخطوط**: 80%+
- **الوظائف**: 80%+
- **الفروع**: 80%+
- **البيانات**: 80%+

## 🧪 أنواع الاختبارات

### 1. Unit Tests (اختبارات الوحدة)

تختبر وظائف فردية ومعزولة:

```typescript
describe('WebScraper Utils', () => {
  it('should extract content from valid URL', async () => {
    const result = await extractContentFromUrl('https://example.com');
    expect(result).toBeDefined();
  });
});
```

**الملفات المشمولة:**
- `utils/webScraper.test.ts` - استخراج المحتوى
- `utils/geminiHelper.test.ts` - تكامل Gemini AI
- `utils/groqHelper.test.ts` - تكامل Groq AI
- `utils/sourceEvaluator.test.ts` - تقييم المصادر
- `utils/database.test.ts` - عمليات قاعدة البيانات
- `utils/validation.test.ts` - التحقق من البيانات
- `utils/logger.test.ts` - نظام السجلات
- `routes/analysis.test.ts` - مسارات التحليل
- `models/Analysis.test.ts` - نموذج التحليل
- `middleware/auth.test.ts` - المصادقة والأمان

### 2. Integration Tests (اختبارات التكامل)

تختبر تفاعل المكونات مع بعضها:

```typescript
describe('Analysis API Integration', () => {
  it('should complete full analysis workflow', async () => {
    const response = await request(app)
      .post('/api/analysis/analyze')
      .send({ url: 'https://example.com', provider: 'gemini' });
    
    expect(response.status).toBe(200);
  });
});
```

**الملفات المشمولة:**
- `api/analysis.integration.test.ts` - تدفق التحليل الكامل
- `api/cache.integration.test.ts` - نظام التخزين المؤقت
- `api/security.integration.test.ts` - الأمان والحماية

### 3. E2E Tests (اختبارات شاملة)

تختبر سيناريوهات المستخدم الكاملة:

```typescript
describe('Complete Analysis E2E', () => {
  it('should complete full user journey', async () => {
    await page.goto('http://localhost:3000');
    await page.type('[data-testid="url-input"]', 'https://example.com');
    await page.click('[data-testid="analyze-button"]');
    await page.waitForSelector('[data-testid="analysis-results"]');
  });
});
```

**الملفات المشمولة:**
- `scenarios/complete-analysis.e2e.test.ts` - رحلة المستخدم الكاملة
- `scenarios/error-handling.e2e.test.ts` - معالجة الأخطاء

## 🔧 إعداد بيئة الاختبار

### المتطلبات
- Node.js 18+
- MongoDB (للاختبارات)
- Chrome/Chromium (للاختبارات E2E)

### متغيرات البيئة
```env
NODE_ENV=test
TEST_DATABASE_URL=mongodb://localhost:27017/test
GEMINI_API_KEY=test-key
GROQ_API_KEY=test-key
```

### قاعدة البيانات
يتم استخدام MongoDB في الذاكرة للاختبارات:
- تُنشأ قاعدة بيانات جديدة لكل اختبار
- تُمحى البيانات بعد كل اختبار
- لا تؤثر على قاعدة البيانات الرئيسية

## 📝 كتابة اختبارات جديدة

### قواعد الكتابة

1. **أسماء وصفية**: استخدم أسماء واضحة للاختبارات
2. **ترتيب AAA**: Arrange, Act, Assert
3. **اختبار واحد لكل it()**: اختبر شيء واحد فقط
4. **تنظيف البيانات**: امحُ البيانات بعد كل اختبار

### مثال على اختبار جديد

```typescript
describe('New Feature', () => {
  beforeEach(() => {
    // إعداد البيانات
  });

  afterEach(() => {
    // تنظيف البيانات
  });

  it('should handle specific scenario', () => {
    // Arrange - إعداد
    const input = 'test-input';
    
    // Act - تنفيذ
    const result = newFunction(input);
    
    // Assert - تحقق
    expect(result).toBe('expected-output');
  });
});
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

1. **فشل الاتصال بقاعدة البيانات**
   ```bash
   # تأكد من تشغيل MongoDB
   mongod --dbpath ./data
   ```

2. **فشل اختبارات E2E**
   ```bash
   # تأكد من تشغيل التطبيق
   npm run dev
   ```

3. **مشاكل التبعيات**
   ```bash
   # إعادة تثبيت التبعيات
   rm -rf node_modules package-lock.json
   npm install
   ```

### تشغيل اختبار واحد
```bash
# اختبار ملف محدد
npm test -- webScraper.test.ts

# اختبار وصف محدد
npm test -- --testNamePattern="should extract content"
```

## 📈 مراقبة الأداء

### قياس الأداء
```typescript
it('should complete within time limit', async () => {
  const startTime = Date.now();
  
  await performOperation();
  
  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(5000); // 5 ثوان
});
```

### تقارير التغطية
- **HTML Report**: `coverage/lcov-report/index.html`
- **JSON Report**: `coverage/coverage-final.json`
- **Text Report**: في Terminal

## 🔄 CI/CD Integration

الاختبارات تعمل تلقائياً في:
- **Pull Requests**: جميع الاختبارات
- **Push to main**: جميع الاختبارات + نشر
- **Nightly**: اختبارات الأداء الشاملة

### GitHub Actions
راجع `.github/workflows/ci-cd.yml` للتفاصيل.

## 📚 مراجع إضافية

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [Puppeteer API](https://pptr.dev/)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

---

**ملاحظة**: تأكد من تشغيل `npm run test:coverage` قبل كل commit للتأكد من تحقيق الحد الأدنى للتغطية (80%).