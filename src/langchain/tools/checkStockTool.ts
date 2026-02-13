import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { productService } from '@/features/products/services/productService';

export const checkStockTool = new DynamicStructuredTool({
  name: 'check_stock',
  description:
    'Check if a product is in stock and how many are available. Use when customer asks about availability, sizes, or colors. The product_id comes from your search results.',
  schema: z.object({
    product_id: z.string().describe('The UUID of the product to check (from your search results)'),
    variant_id: z.string().optional().describe('Optional variant UUID (for specific color/size)'),
  }),
  func: async ({ product_id, variant_id }) => {
    try {
      const quantity = await productService.checkStock(product_id, variant_id);
      const product = await productService.getById(product_id);

      let variantInfo = null;
      if (variant_id) {
        const variants = await productService.getVariants(product_id);
        variantInfo = variants?.find((v: { id: string }) => v.id === variant_id) || null;
      }

      return JSON.stringify({
        product_id,
        product_name: product?.name || 'Unknown',
        in_stock: quantity > 0,
        quantity,
        variant: variantInfo
          ? {
              id: variantInfo.id,
              color: variantInfo.color,
              size: variantInfo.size,
              stock: variantInfo.stock_quantity,
            }
          : null,
      });
    } catch (error) {
      console.error('Check stock tool error:', error);
      return JSON.stringify({
        product_id,
        in_stock: false,
        quantity: 0,
        message: 'Failed to check stock.',
      });
    }
  },
});
