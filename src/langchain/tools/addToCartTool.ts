import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { cartService } from '@/features/cart/services/cartService';

export const addToCartTool = new DynamicStructuredTool({
  name: 'add_to_cart',
  description:
    'Add a product to the shopping cart. Use this when the customer wants to buy something or says "add to cart", "I\'ll take it", "add that", etc. The product_id comes from your recent search/filter results - NEVER ask the customer for it. If showing multiple products, use the ID of the specific product they reference by name or position.',
  schema: z.object({
    product_id: z.string().describe('The UUID of the product to add (from your search results)'),
    variant_id: z.string().optional().describe('Optional variant UUID for specific color/size'),
    quantity: z.number().optional().default(1).describe('Quantity to add (default: 1)'),
    user_id: z.string().describe('The authenticated user ID'),
  }),
  func: async ({ product_id, variant_id, quantity, user_id }) => {
    try {
      if (!user_id) {
        return JSON.stringify({
          success: false,
          message: 'You need to be logged in to add items to your cart.',
        });
      }

      const cart = await cartService.addItem(user_id, {
        product_id,
        variant_id,
        quantity,
      });

      return JSON.stringify({
        success: true,
        message: `Added to cart successfully!`,
        cart: {
          item_count: cart.item_count,
          subtotal: cart.subtotal,
          total: cart.total,
        },
      });
    } catch (error: unknown) {
      console.error('Add to cart tool error:', error);

      const errMsg = error instanceof Error ? error.message : '';
      if (errMsg.includes('not found')) {
        return JSON.stringify({
          success: false,
          message: 'Product not found.',
        });
      }
      if (errMsg.includes('stock')) {
        return JSON.stringify({
          success: false,
          message: 'Sorry, this product is out of stock or insufficient quantity available.',
        });
      }

      return JSON.stringify({
        success: false,
        message: 'Failed to add item to cart.',
      });
    }
  },
});
