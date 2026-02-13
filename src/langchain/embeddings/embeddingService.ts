import { GoogleGenAI } from '@google/genai';

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenAI({ apiKey });
}

export const embeddingService = {
  async generateEmbedding(text: string): Promise<number[]> {
    const ai = getClient();
    try {
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
        config: { outputDimensionality: 768 },
      });

      const vector = response.embeddings?.[0]?.values;
      if (!vector || vector.length === 0) {
        throw new Error('Embedding returned empty vector');
      }
      return vector;
    } catch (err) {
      console.error('Embedding generation error:', err);
      throw err;
    }
  },

  async generateBatch(texts: string[]): Promise<number[][]> {
    const ai = getClient();
    try {
      const results: number[][] = [];
      for (const text of texts) {
        const response = await ai.models.embedContent({
          model: 'gemini-embedding-001',
          contents: text,
          config: { outputDimensionality: 768 },
        });
        const vector = response.embeddings?.[0]?.values;
        if (!vector || vector.length === 0) {
          throw new Error(`Embedding returned empty vector for text: ${text.slice(0, 50)}`);
        }
        results.push(vector);
      }
      return results;
    } catch (err) {
      console.error('Batch embedding generation error:', err);
      throw err;
    }
  },
};
