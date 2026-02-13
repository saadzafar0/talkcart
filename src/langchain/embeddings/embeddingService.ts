import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

function getEmbeddingsModel(): GoogleGenerativeAIEmbeddings {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  return new GoogleGenerativeAIEmbeddings({
    model: 'text-embedding-004',
    apiKey,
  });
}

export const embeddingService = {
  async generateEmbedding(text: string): Promise<number[]> {
    const model = getEmbeddingsModel();
    const vectors = await model.embedDocuments([text]);
    return vectors[0];
  },

  async generateBatch(texts: string[]): Promise<number[][]> {
    const model = getEmbeddingsModel();
    return model.embedDocuments(texts);
  },
};
