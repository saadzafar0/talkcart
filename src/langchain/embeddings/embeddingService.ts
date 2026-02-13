// TODO: implement - generate embeddings using Gemini

export const embeddingService = {
  async generateEmbedding(text: string): Promise<number[]> {
    // TODO: implement - call Gemini embedding API via LangChain
    throw new Error('Not implemented');
  },

  async generateBatch(texts: string[]): Promise<number[][]> {
    // TODO: implement - batch embeddings
    throw new Error('Not implemented');
  },
};
