export const mockGeminiResponse = {
  text: 'تحليل المحتوى: هذا نص تجريبي للاختبار',
  analysis: {
    sentiment: 'neutral',
    topics: ['تكنولوجيا', 'اختبار'],
    credibility: 0.8
  }
};

export const mockGroqResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        analysis: 'تحليل شامل للمحتوى',
        credibility_score: 0.85,
        key_points: ['نقطة 1', 'نقطة 2']
      })
    }
  }]
};

export const mockWebContent = {
  title: 'عنوان تجريبي',
  content: 'محتوى تجريبي للاختبار',
  url: 'https://example.com',
  author: 'كاتب تجريبي',
  date: new Date().toISOString()
};