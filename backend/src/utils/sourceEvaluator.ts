import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

let geminiClient: GoogleGenerativeAI | null = null;
let groqClient: Groq | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح GEMINI_API_KEY غير متوفر");
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح GROQ_API_KEY غير متوفر");
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export interface EvaluationResult {
  overall_rating: number;
  credibility_score: number;
  quality_score: number;
  recency_score: number;
  sources_score: number;
  objectivity_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface RelatedResource {
  title: string;
  url: string;
  type: string;
  description: string;
  relevance: string;
}

export async function evaluateSourceCredibility(
  url: string,
  content: string,
  useGemini: boolean = true
): Promise<EvaluationResult> {
  /**
   * Evaluate source credibility and content quality
   */
  const prompt = `قم بتقييم موثوقية المصدر التالي وجودة محتواه بشكل موضوعي ودقيق:

الرابط: ${url}
المحتوى: ${content.slice(0, 2000)}...

قيّم المصدر على المعايير التالية (من 1 إلى 5 نجوم):
1. **الموثوقية العامة**: مصداقية الموقع والمحتوى
2. **جودة المحتوى**: دقة المعلومات وعمق التحليل
3. **الحداثة**: مدى حداثة المعلومات
4. **المصادر والمراجع**: وجود مراجع علمية وموثوقة
5. **الموضوعية**: خلو المحتوى من التحيز

قدم النتيجة بتنسيق JSON:
{
  "overall_rating": <رقم من 1 إلى 5>,
  "credibility_score": <رقم من 1 إلى 5>,
  "quality_score": <رقم من 1 إلى 5>,
  "recency_score": <رقم من 1 إلى 5>,
  "sources_score": <رقم من 1 إلى 5>,
  "objectivity_score": <رقم من 1 إلى 5>,
  "summary": "<ملخص قصير بالعربية عن التقييم>",
  "strengths": ["<نقطة قوة 1>", "<نقطة قوة 2>"],
  "weaknesses": ["<نقطة ضعف 1>", "<نقطة ضعف 2>"],
  "recommendation": "<توصية نهائية بالعربية>"
}

تأكد من أن الإجابة JSON صحيحة وكاملة.`;

  try {
    if (useGemini) {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return JSON.parse(text);
    } else {
      const groq = getGroqClient();
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const content = chatCompletion.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    }
  } catch (error) {
    console.error('Evaluation error:', error);
  }

  // Fallback result
  return {
    overall_rating: 3,
    credibility_score: 3,
    quality_score: 3,
    recency_score: 3,
    sources_score: 3,
    objectivity_score: 3,
    summary: `حدث خطأ في التقييم: ${error.message}`,
    strengths: [],
    weaknesses: [],
    recommendation: "لم يتم التقييم بسبب خطأ تقني"
  };
}

export async function findRelatedResources(
  topic: string,
  url: string,
  useGemini: boolean = true
): Promise<RelatedResource[]> {
  /**
   * Find related resources and additional links
   */
  const prompt = `بناءً على الموضوع التالي من الرابط ${url}:

الموضوع: ${topic.slice(0, 1000)}

اقترح 5 مصادر إضافية موثوقة وذات صلة يمكن للقارئ الرجوع إليها لتعميق فهمه. ركز على:
- مقالات علمية أو أكاديمية
- مدونات تقنية معروفة
- وثائق رسمية
- دورات تعليمية
- كتب أو أبحاث

قدم النتيجة بتنسيق JSON:
{
  "resources": [
    {
      "title": "<عنوان المصدر بالعربية>",
      "url": "<رابط المصدر>",
      "type": "<نوع المصدر: مقال/كتاب/دورة/وثائق>",
      "description": "<وصف قصير بالعربية>",
      "relevance": "<لماذا هذا المصدر مفيد>"
    }
  ]
}

ملاحظة: اقترح مصادر حقيقية وموثوقة فقط.`;

  try {
    if (useGemini) {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const parsedResult = JSON.parse(text);
      return parsedResult.resources || [];
    } else {
      const groq = getGroqClient();
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const content = chatCompletion.choices[0]?.message?.content;
      if (content) {
        const result = JSON.parse(content);
        return result.resources || [];
      }
    }
  } catch (error) {
    console.error('Finding related resources error:', error);
  }

  return [];
}
