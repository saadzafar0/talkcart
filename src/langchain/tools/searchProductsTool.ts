import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { retrieveProducts } from '../retrievers/productRetriever';

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
      const products = await retrieveProducts(query, limit, 0.5);

      if (products.length === 0) {
        return JSON.stringify({
          found: false,
          message: 'No products found matching your search.',
          products: [],
        });
      }

      const formatted = products.map((p) => ({
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
