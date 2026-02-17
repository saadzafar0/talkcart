import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { cartService } from '@/features/cart/services/cartService';

export const removeFromCartTool = new DynamicStructuredTool({
  name: 'remove_from_cart',
  description:
    'Remove an item from the shopping cart. Use when the customer says "remove the shirt", "take that out", "delete it from cart", etc. You need the cart item ID — call get_cart first to find it.',
  schema: z.object({
    item_id: z.string().describe('The cart item ID (from get_cart results, NOT the product ID)'),
    user_id: z.string().describe('The authenticated user ID'),
  }),
  func: async ({ item_id, user_id }) => {
    try {
      if (!user_id) {
        return JSON.stringify({
          success: false,
          message: 'You need to be logged in to modify your cart.',
        });
      }

      const cart = await cartService.removeItem(user_id, item_id);

      return JSON.stringify({
        success: true,
        message: 'Item removed from cart.',
        cart: {
          item_count: cart.item_count,
          subtotal: cart.subtotal,
          total: cart.total,
        },
      });
    } catch (error: unknown) {
      console.error('Remove from cart tool error:', error);
      const msg = error instanceof Error ? error.message : 'Failed to remove item';
      return JSON.stringify({ success: false, message: msg });
    }
  },
});
