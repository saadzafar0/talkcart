import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { normalizeCategorySlug } from '@/core/utils/categorySlug';
import { productService } from '@/features/products/services/productService';

export const filterProductsTool = new DynamicStructuredTool({
  name: 'filter_products',
  description:
    'Filter products by category, price range, or sort order. Use this when the customer wants to browse by specific criteria like "shoes under $100" or "sort by rating".',
  schema: z.object({
    category: z.string().optional().describe('Category slug: clothing, fashion, electronics, home-kitchen, home-living, sports-outdoors, books-stationery, beauty-personal-care. Also accepts: clothes, apparel, tech, home, kitchen, living, sports, beauty, etc.'),
    min_price: z.number().optional().describe('Minimum price filter'),
    max_price: z.number().optional().describe('Maximum price filter'),
    sort_by: z
      .enum(['price_asc', 'price_desc', 'rating', 'newest'])
      .optional()
      .default('newest')
      .describe('Sort order for results'),
    limit: z.number().optional().default(10).describe('Maximum number of results'),
  }),
  func: async ({ category, min_price, max_price, sort_by, limit }) => {
    try {
      const categorySlug = category ? normalizeCategorySlug(category) : undefined;
      const result = await productService.getAll({
        category: categorySlug ?? category,
        minPrice: min_price,
        maxPrice: max_price,
        sortBy: sort_by,
        limit,
      });

      const formatted = result.products.map((p) => ({
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

      return JSON.stringify({
        count: formatted.length,
        total: result.total,
        products: formatted,
      });
    } catch (error) {
      console.error('Filter products tool error:', error);
      return JSON.stringify({
        count: 0,
        message: 'Failed to filter products.',
        products: [],
      });
    }
  },
});
