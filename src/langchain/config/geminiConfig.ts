import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const GEMINI_MODEL = 'gemini-2.5-flash';

export function createGeminiLLM(temperature = 0.7) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  return new ChatGoogleGenerativeAI({
    model: GEMINI_MODEL,
    apiKey,
    temperature,
  });
}
