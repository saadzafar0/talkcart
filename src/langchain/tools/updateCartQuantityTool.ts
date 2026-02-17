import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { cartService } from '@/features/cart/services/cartService';

export const updateCartQuantityTool = new DynamicStructuredTool({
  name: 'update_cart_quantity',
  description:
    'Update the quantity of an item already in the cart. Use when the customer says "change to 2", "I want 3 of those", "update quantity", etc. You need the cart item ID — call get_cart first to find it.',
  schema: z.object({
    item_id: z.string().describe('The cart item ID (from get_cart results, NOT the product ID)'),
    quantity: z.number().describe('The new quantity (must be at least 1)'),
    user_id: z.string().describe('The authenticated user ID'),
  }),
  func: async ({ item_id, quantity, user_id }) => {
    try {
      if (!user_id) {
        return JSON.stringify({
          success: false,
          message: 'You need to be logged in to modify your cart.',
        });
      }

      if (quantity < 1) {
        return JSON.stringify({
          success: false,
          message: 'Quantity must be at least 1. Use remove_from_cart to remove an item.',
        });
      }

      const cart = await cartService.updateQuantity(user_id, item_id, quantity);

      return JSON.stringify({
        success: true,
        message: `Quantity updated to ${quantity}.`,
        cart: {
          item_count: cart.item_count,
          subtotal: cart.subtotal,
          total: cart.total,
        },
      });
    } catch (error: unknown) {
      console.error('Update cart quantity tool error:', error);
      const msg = error instanceof Error ? error.message : 'Failed to update quantity';
      return JSON.stringify({ success: false, message: msg });
    }
  },
});
