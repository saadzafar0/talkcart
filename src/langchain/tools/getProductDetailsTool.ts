import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { productService } from '@/features/products/services/productService';

export const getProductDetailsTool = new DynamicStructuredTool({
  name: 'get_product_details',
  description:
    'Get detailed information about a specific product including full description, variants (colors/sizes), and reviews. Use when the customer asks "tell me more about X", "what sizes does it come in?", "any reviews?", etc. Use the product_id from your search/filter results.',
  schema: z.object({
    product_id: z.string().describe('The UUID of the product (from your search results)'),
  }),
  func: async ({ product_id }) => {
    try {
      const product = await productService.getById(product_id);
      if (!product) {
        return JSON.stringify({ success: false, message: 'Product not found.' });
      }

      const [variants, reviews] = await Promise.all([
        productService.getVariants(product_id).catch(() => []),
        productService.getReviews(product_id, 5).catch(() => []),
      ]);

      return JSON.stringify({
        success: true,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.base_price,
          description: product.description,
          image: product.image_url,
          rating: product.rating,
          review_count: product.review_count,
          stock: product.stock_quantity,
          in_stock: (product.stock_quantity ?? 0) > 0,
        },
        variants: (variants || []).map((v: Record<string, unknown>) => ({
          id: v.id,
          color: v.color,
          size: v.size,
          price_adjustment: v.price_adjustment,
          stock: v.stock_quantity,
        })),
        reviews: (reviews || []).map((r: Record<string, unknown>) => ({
          rating: r.rating,
          comment: r.comment,
          author: (r.users as Record<string, unknown>)?.full_name || 'Anonymous',
        })),
      });
    } catch (error: unknown) {
      console.error('Get product details tool error:', error);
      return JSON.stringify({ success: false, message: 'Failed to get product details.' });
    }
  },
});
