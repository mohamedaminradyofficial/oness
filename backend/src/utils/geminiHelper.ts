import { GoogleGenerativeAI } from '@google/generative-ai';

let client: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  /**
   * Create Gemini client only when needed and check API key availability
   */
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح GEMINI_API_KEY غير متوفر. الرجاء إضافة المفتاح في الإعدادات.");
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

export async function analyzeContentWithGemini(
  content: string,
  url: string,
  language: string = "ar"
): Promise<string> {
  /**
   * Analyze content using Gemini API
   */
  const prompt = `أنت وكيل ذكي متخصص في تحليل وشرح المحتوى بشكل شامل ومبسط.

المحتوى المستخرج من الرابط: ${url}

${content}

المهمة:
1. قم بتحليل هذا المحتوى بدقة
2. قدم ملخصاً عاماً أولاً
3. ثم اشرح المحتوى بشكل تفصيلي ومبسط باللغة العربية
4. استخدم أسلوباً محترماً ولطيفاً بدون مصطلحات معقدة
5. إذا وجدت أكواد برمجية، اشرح كل كود مع خطوات التنفيذ
6. ركز على موضوعات الذكاء الاصطناعي إذا كانت موجودة
7. قدم النتيجة بتنسيق Markdown جميل ومنظم
8. أضف أمثلة توضيحية عند الحاجة

الرجاء تقديم الشرح الكامل باللغة العربية فقط.`;

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "عذراً، حدث خطأ في التحليل";
  } catch (error) {
    throw new Error(`فشل التحليل باستخدام Gemini: ${error.message}`);
  }
}

export async function detectAndAnalyzeCode(content: string): Promise<string> {
  /**
   * Detect and analyze code blocks in content
   */
  const prompt = `قم بتحليل المحتوى التالي وابحث عن أي أكواد برمجية:

${content}

إذا وجدت أكواد:
1. حدد لغة البرمجة المستخدمة
2. اشرح وظيفة كل قطعة كود
3. قدم خطوات التنفيذ العملية
4. اذكر المكتبات المطلوبة
5. قدم أمثلة عملية

قدم الإجابة باللغة العربية بتنسيق Markdown.`;

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "";
  } catch (error) {
    return `خطأ في تحليل الأكواد: ${error.message}`;
  }
}
