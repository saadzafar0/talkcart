import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { activityService } from '@/features/activity';
import { createServerSupabase } from '@/lib/supabase/server';

export const getRecommendationsTool = new DynamicStructuredTool({
  name: 'get_recommendations',
  description:
    'Get personalized product recommendations for the current user based on their browsing history, viewed products, and past purchases. Use this when the customer asks "what do you recommend?" or similar. Requires a user_id.',
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

      // Get recently viewed product IDs
      const viewedIds = await activityService.getRecentlyViewedProductIds(user_id, 20);

      if (viewedIds.length === 0) {
        // No activity — return top-rated products as fallback
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
          products: (topRated || []).map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.base_price,
            image: p.image_url,
            rating: p.rating,
            review_count: p.review_count,
            stock: p.stock_quantity,
          })),
        });
      }

      // Get categories of viewed products
      const { data: viewedProducts } = await supabase
        .from('products')
        .select('category_id')
        .in('id', viewedIds);

      const categoryIds = [
        ...new Set(
          (viewedProducts || [])
            .map((p) => p.category_id)
            .filter(Boolean) as string[]
        ),
      ];

      // Get products in those categories, excluding already-viewed
      let query = supabase
        .from('products')
        .select('id, name, slug, base_price, image_url, rating, review_count, stock_quantity, description')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit * 2);

      if (categoryIds.length > 0) {
        query = query.in('category_id', categoryIds);
      }

      const { data: recommendations } = await query;

      const viewedSet = new Set(viewedIds);
      const filtered = (recommendations || [])
        .filter((p) => !viewedSet.has(p.id))
        .slice(0, limit);

      return JSON.stringify({
        success: true,
        basis: 'activity_based',
        message: `Recommendations based on your browsing history across ${categoryIds.length} categories.`,
        products: filtered.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.base_price,
          image: p.image_url,
          rating: p.rating,
          review_count: p.review_count,
          stock: p.stock_quantity,
          description: p.description?.substring(0, 150),
        })),
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
