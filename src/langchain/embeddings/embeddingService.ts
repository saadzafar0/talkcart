import { GoogleGenAI } from '@google/genai';

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Simple LRU cache for embeddings to avoid redundant API calls.
 * Bounded to MAX_CACHE_SIZE entries; evicts oldest on overflow.
 */
const MAX_CACHE_SIZE = 200;
const embeddingCache = new Map<string, number[]>();

function getCached(text: string): number[] | undefined {
  const cached = embeddingCache.get(text);
  if (cached) {
    // Move to end (most recently used) by re-inserting
    embeddingCache.delete(text);
    embeddingCache.set(text, cached);
  }
  return cached;
}

function setCached(text: string, embedding: number[]): void {
  if (embeddingCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest (first entry in Map iteration order)
    const oldest = embeddingCache.keys().next().value;
    if (oldest !== undefined) embeddingCache.delete(oldest);
  }
  embeddingCache.set(text, embedding);
}

export const embeddingService = {
  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cached = getCached(text);
    if (cached) return cached;

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

      setCached(text, vector);
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
        // Check cache for each text
        const cached = getCached(text);
        if (cached) {
          results.push(cached);
          continue;
        }

        const response = await ai.models.embedContent({
          model: 'gemini-embedding-001',
          contents: text,
          config: { outputDimensionality: 768 },
        });
        const vector = response.embeddings?.[0]?.values;
        if (!vector || vector.length === 0) {
          throw new Error(`Embedding returned empty vector for text: ${text.slice(0, 50)}`);
        }
        setCached(text, vector);
        results.push(vector);
      }
      return results;
    } catch (err) {
      console.error('Batch embedding generation error:', err);
      throw err;
    }
  },
};
