import Groq from 'groq-sdk';

let client: Groq | null = null;

function getGroqClient(): Groq {
  /**
   * Create Groq client only when needed and check API key availability
   */
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح GROQ_API_KEY غير متوفر. الرجاء إضافة المفتاح في الإعدادات.");
    }
    client = new Groq({ apiKey });
  }
  return client;
}

export async function analyzeContentWithGroq(
  content: string,
  url: string,
  language: string = "ar"
): Promise<string> {
  /**
   * Analyze content using Groq API (backup)
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
    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 8000,
    });

    return chatCompletion.choices[0]?.message?.content || "عذراً، حدث خطأ في التحليل";
  } catch (error) {
    throw new Error(`فشل التحليل باستخدام Groq: ${error.message}`);
  }
}

export async function detectAndAnalyzeCodeGroq(content: string): Promise<string> {
  /**
   * Detect and analyze code blocks using Groq
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
    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4000,
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    return `خطأ في تحليل الأكواد: ${error.message}`;
  }
}
