import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { activityService } from '@/features/activity';
import { createServerSupabase } from '@/lib/supabase/server';
import { retrieveProducts } from '../retrievers/productRetriever';

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  image_url?: string | null;
  rating?: number;
  review_count?: number;
  stock_quantity?: number;
  description?: string | null;
};

function toToolProduct(p: ProductRow) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.base_price,
    image: p.image_url,
    rating: p.rating,
    review_count: p.review_count,
    stock: p.stock_quantity,
    description: p.description?.substring(0, 150),
  };
}

export const getRecommendationsTool = new DynamicStructuredTool({
  name: 'get_recommendations',
  description:
    'Get personalized product recommendations for the current user based on their browsing history, viewed products, recent searches, cart activity, and past purchases. Use when the customer asks "what do you recommend?", "show me products", "browse", or similar. Requires a user_id.',
  schema: z.object({
    user_id: z.string().describe('The authenticated user ID'),
    limit: z.number().optional().default(5).describe('Maximum recommendations to return'),
  }),
  func: async ({ user_id, limit }) => {
    try {
      if (!user_id) {
        return JSON.stringify({
          success: false,
          message: 'User must be logged in for personalized recommendations.',
          products: [],
        });
      }

      const supabase = createServerSupabase();
      const summary = await activityService.getSummary(user_id);
      const viewedIds = await activityService.getRecentlyViewedProductIds(user_id, 20);
      const excludeIds = new Set(viewedIds);

      // 1. Search-based: use recent search queries for semantic recommendations
      const searchProducts: ProductRow[] = [];
      for (const query of summary.recentSearches.slice(0, 3)) {
        if (!query?.trim()) continue;
        const matches = await retrieveProducts(query, Math.ceil(limit / 2), 0.5);
        for (const m of matches) {
          if (!excludeIds.has(m.id)) {
            searchProducts.push(m);
            excludeIds.add(m.id);
          }
        }
      }

      // 2. Cart-based: products in same categories as items they added to cart
      let cartCategoryIds: string[] = [];
      if (summary.recentCartAdds.length > 0) {
        const { data: cartProducts } = await supabase
          .from('products')
          .select('category_id')
          .in('id', summary.recentCartAdds);
        cartCategoryIds = [
          ...new Set(
            (cartProducts || []).map((p) => p.category_id).filter(Boolean) as string[]
          ),
        ];
      }

      // 3. View-based: categories from viewed products
      let viewCategoryIds: string[] = [];
      if (viewedIds.length > 0) {
        const { data: viewedProducts } = await supabase
          .from('products')
          .select('category_id')
          .in('id', viewedIds);
        viewCategoryIds = [
          ...new Set(
            (viewedProducts || []).map((p) => p.category_id).filter(Boolean) as string[]
          ),
        ];
      }

      const categoryIds = [...new Set([...cartCategoryIds, ...viewCategoryIds])];

      // No activity at all — fallback to top-rated
      if (
        viewedIds.length === 0 &&
        searchProducts.length === 0 &&
        summary.recentCartAdds.length === 0
      ) {
        const { data: topRated } = await supabase
          .from('products')
          .select('id, name, slug, base_price, image_url, rating, review_count, stock_quantity')
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .limit(limit);

        return JSON.stringify({
          success: true,
          basis: 'top_rated',
          message: 'No browsing history found. Here are our top-rated products.',
          products: (topRated || []).map(toToolProduct),
        });
      }

      // Build final list: search results first (strong intent), then category-based
      const result: ProductRow[] = [...searchProducts];

      if (result.length < limit && categoryIds.length > 0) {
        let query = supabase
          .from('products')
          .select('id, name, slug, base_price, image_url, rating, review_count, stock_quantity, description')
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .limit((limit - result.length) * 2);

        query = query.in('category_id', categoryIds);

        const { data: catProducts } = await query;
        for (const p of catProducts || []) {
          if (!excludeIds.has(p.id) && result.length < limit) {
            result.push(p);
            excludeIds.add(p.id);
          }
        }
      }

      // If still short, fill with top-rated
      if (result.length < limit) {
        const { data: topRated } = await supabase
          .from('products')
          .select('id, name, slug, base_price, image_url, rating, review_count, stock_quantity, description')
          .eq('is_active', true)
          .order('rating', { ascending: false })
          .limit((limit - result.length) * 2);

        for (const p of topRated || []) {
          if (!excludeIds.has(p.id) && result.length < limit) {
            result.push(p);
            excludeIds.add(p.id);
          }
        }
      }

      const basis =
        searchProducts.length > 0
          ? 'search_and_activity'
          : summary.recentCartAdds.length > 0
            ? 'cart_and_activity'
            : 'activity_based';

      return JSON.stringify({
        success: true,
        basis,
        message: `Recommendations based on your activity${summary.recentSearches.length > 0 ? ', recent searches' : ''}${summary.recentCartAdds.length > 0 ? ', and cart' : ''}.`,
        products: result.slice(0, limit).map(toToolProduct),
      });
    } catch (error: unknown) {
      console.error('Get recommendations tool error:', error);
      return JSON.stringify({
        success: false,
        message: 'Failed to generate recommendations.',
        products: [],
      });
    }
  },
});
