// TODO: implement - Supabase pgvector store

export const vectorStore = {
  async similaritySearch(embedding: number[], limit?: number) {
    // TODO: implement - query Supabase pgvector
    throw new Error('Not implemented');
  },

  async addDocuments(documents: { content: string; productId: string }[]) {
    // TODO: implement - embed and store documents
    throw new Error('Not implemented');
  },
};
