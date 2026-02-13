import { embeddingService } from '../embeddings/embeddingService';
import { vectorStore, SimilarProduct } from '../embeddings/vectorStore';
import { createServerSupabase } from '@/lib/supabase/server';
import { Product } from '@/features/products/types';

export interface RetrievedProduct extends Product {
  similarity: number;
}

/**
 * Retrieve products by semantic similarity.
 * Embeds the query, searches pgvector, then enriches with full product data.
 */
export async function retrieveProducts(
  query: string,
  limit = 5,
  threshold = 0.7
): Promise<RetrievedProduct[]> {
  // 1. Embed the query
  const queryEmbedding = await embeddingService.generateEmbedding(query);

  // 2. Vector similarity search
  const matches: SimilarProduct[] = await vectorStore.similaritySearch(
    queryEmbedding,
    limit,
    threshold
  );

  if (matches.length === 0) {
    return [];
  }

  // 3. Fetch full product details for matched IDs
  const supabase = createServerSupabase();
  const productIds = matches.map((m) => m.product_id);

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)
    .eq('is_active', true);

  if (error || !products) {
    console.error('Failed to enrich products:', error);
    return [];
  }

  // 4. Merge similarity scores with product data and sort by similarity
  const similarityMap = new Map(matches.map((m) => [m.product_id, m.similarity]));

  return (products as Product[])
    .map((p) => ({
      ...p,
      similarity: similarityMap.get(p.id) || 0,
    }))
    .sort((a, b) => b.similarity - a.similarity);
}
