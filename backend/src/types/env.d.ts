// تعريف types للمتغيرات البيئية
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      FRONTEND_URL?: string;
      DATABASE_URL?: string;
      GEMINI_API_KEY?: string;
      GROQ_API_KEY?: string;
      JWT_SECRET?: string;
      REDIS_URL?: string;
    }
  }
}

export {};
