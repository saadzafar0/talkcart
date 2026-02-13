import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { retrieveProducts } from '../retrievers/productRetriever';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * Text-based fallback search: matches product name or description with ILIKE.
 * Used when vector/semantic search finds nothing (e.g. simple keywords like "shirt").
 */
async function textSearchProducts(query: string, limit: number) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, base_price, image_url, stock_quantity, rating, review_count, description')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Text search fallback error:', error);
    return [];
  }
  return (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.base_price,
    image: p.image_url,
    stock: p.stock_quantity,
    rating: p.rating,
    review_count: p.review_count,
    description: p.description?.substring(0, 150),
  }));
}

export const searchProductsTool = new DynamicStructuredTool({
  name: 'search_products',
  description:
    'Search products using semantic/natural language query. Use this when the customer describes what they want in natural language, like "summer wedding outfit" or "cozy blanket for winter".',
  schema: z.object({
    query: z.string().describe('Natural language search query describing what the customer wants'),
    limit: z.number().optional().default(5).describe('Maximum number of results to return'),
  }),
  func: async ({ query, limit }) => {
    try {
      // 1. Try semantic (vector) search with a reasonable threshold
      const vectorProducts = await retrieveProducts(query, limit, 0.5);

      if (vectorProducts.length > 0) {
        const formatted = vectorProducts.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.base_price,
          image: p.image_url,
          stock: p.stock_quantity,
          rating: p.rating,
          review_count: p.review_count,
          description: p.description?.substring(0, 150),
          similarity: Math.round(p.similarity * 100) / 100,
        }));

        return JSON.stringify({
          found: true,
          count: formatted.length,
          products: formatted,
        });
      }

      // 2. Vector search found nothing — fall back to text search
      const textResults = await textSearchProducts(query, limit);

      if (textResults.length > 0) {
        return JSON.stringify({
          found: true,
          count: textResults.length,
          products: textResults,
        });
      }

      return JSON.stringify({
        found: false,
        message: 'No products found matching your search.',
        products: [],
      });
    } catch (error) {
      console.error('Search products tool error:', error);

      // Last resort: try text search even if vector search threw
      try {
        const fallback = await textSearchProducts(query, limit);
        if (fallback.length > 0) {
          return JSON.stringify({
            found: true,
            count: fallback.length,
            products: fallback,
          });
        }
      } catch {
        // Both failed
      }

      return JSON.stringify({
        found: false,
        message: 'Failed to search products. Please try again.',
        products: [],
      });
    }
  },
});
