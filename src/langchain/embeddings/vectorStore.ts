import { createServerSupabase } from '@/lib/supabase/server';
import { embeddingService } from './embeddingService';

export interface SimilarProduct {
  product_id: string;
  product_name: string;
  similarity: number;
}

export const vectorStore = {
  /**
   * Search products by embedding similarity using pgvector RPC
   */
  async similaritySearch(
    queryEmbedding: number[],
    limit = 5,
    threshold = 0.7
  ): Promise<SimilarProduct[]> {
    const supabase = createServerSupabase();

    const { data, error } = await supabase.rpc('search_products_by_embedding', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) {
      console.error('Vector search error:', error);
      throw new Error(`Vector similarity search failed: ${error.message}`);
    }

    return (data as SimilarProduct[]) || [];
  },

  /**
   * Embed and store a single product document
   */
  async addDocument(productId: string, content: string): Promise<void> {
    const supabase = createServerSupabase();
    const embedding = await embeddingService.generateEmbedding(content);

    // Upsert: delete existing embedding for this product, then insert
    await supabase
      .from('product_embeddings')
      .delete()
      .eq('product_id', productId);

    const { error } = await supabase.from('product_embeddings').insert({
      product_id: productId,
      embedding: JSON.stringify(embedding),
      content,
    });

    if (error) {
      throw new Error(`Failed to store embedding: ${error.message}`);
    }
  },

  /**
   * Embed and store multiple product documents
   */
  async addDocuments(
    documents: { content: string; productId: string }[]
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const doc of documents) {
      try {
        await this.addDocument(doc.productId, doc.content);
        success++;
      } catch (error) {
        console.error(`Failed to embed product ${doc.productId}:`, error);
        failed++;
      }
    }

    return { success, failed };
  },
};
