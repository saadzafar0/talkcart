import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { retrieveProducts } from '../retrievers/productRetriever';
import { createServerSupabase } from '@/lib/supabase/server';

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  stock: number;
  rating: number | null;
  review_count: number | null;
  description: string;
  score: number;
}

/**
 * Text-based search: matches product name or description with ILIKE.
 * Returns products with a text match score (1.0 for name match, 0.5 for description-only).
 */
async function textSearchProducts(query: string, limit: number): Promise<SearchProduct[]> {
  const supabase = createServerSupabase();
  const sanitized = query.replace(/[%_\\]/g, '\\$&');
  const pattern = `%${sanitized}%`;
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, base_price, image_url, stock_quantity, rating, review_count, description')
    .eq('is_active', true)
    .or(`name.ilike.${pattern},description.ilike.${pattern}`)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Text search error:', error);
    return [];
  }

  const lowerQuery = query.toLowerCase();
  return (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.base_price,
    image: p.image_url,
    stock: p.stock_quantity,
    rating: p.rating,
    review_count: p.review_count,
    description: p.description?.substring(0, 150) || '',
    // Higher score for name match vs description-only match
    score: p.name?.toLowerCase().includes(lowerQuery) ? 1.0 : 0.5,
  }));
}

/**
 * Merge vector and text results with combined scoring.
 * Products appearing in both get a boosted score.
 */
function mergeResults(
  vectorResults: SearchProduct[],
  textResults: SearchProduct[],
  limit: number
): SearchProduct[] {
  const merged = new Map<string, SearchProduct>();

  // Add vector results (similarity is already 0-1)
  for (const p of vectorResults) {
    merged.set(p.id, p);
  }

  // Merge text results — boost score if product exists in both
  for (const p of textResults) {
    const existing = merged.get(p.id);
    if (existing) {
      // Product found in both — boost the score
      existing.score = Math.min(existing.score + p.score * 0.3, 1.0);
    } else {
      merged.set(p.id, p);
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
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
      // Run vector and text search in parallel for hybrid results
      const [vectorProducts, textProducts] = await Promise.allSettled([
        retrieveProducts(query, limit, 0.5),
        textSearchProducts(query, limit),
      ]);

      const vectorResults: SearchProduct[] =
        vectorProducts.status === 'fulfilled'
          ? vectorProducts.value.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.base_price,
              image: p.image_url,
              stock: p.stock_quantity,
              rating: p.rating,
              review_count: p.review_count,
              description: p.description?.substring(0, 150) || '',
              score: p.similarity,
            }))
          : [];

      const textResults: SearchProduct[] =
        textProducts.status === 'fulfilled' ? textProducts.value : [];

      // Merge both result sets
      const merged = mergeResults(vectorResults, textResults, limit);

      if (merged.length > 0) {
        return JSON.stringify({
          found: true,
          count: merged.length,
          products: merged.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            image: p.image,
            stock: p.stock,
            rating: p.rating,
            review_count: p.review_count,
            description: p.description,
          })),
        });
      }

      return JSON.stringify({
        found: false,
        message: 'No products found matching your search.',
        products: [],
      });
    } catch (error) {
      console.error('Search products tool error:', error);
      return JSON.stringify({
        found: false,
        message: 'Failed to search products. Please try again.',
        products: [],
      });
    }
  },
});
