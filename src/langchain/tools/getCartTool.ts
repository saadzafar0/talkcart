import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { cartService } from '@/features/cart/services/cartService';

export const getCartTool = new DynamicStructuredTool({
  name: 'get_cart',
  description:
    'Get the current contents of the user\'s shopping cart. Use this when the customer references "my cart", "what\'s in my cart", "the product in my cart", or wants a discount/haggle on a cart item. Always call this BEFORE haggle_price if the user asks for a discount on a cart item, so you know the correct product.',
  schema: z.object({
    user_id: z.string().describe('The authenticated user ID'),
  }),
  func: async ({ user_id }) => {
    try {
      if (!user_id) {
        return JSON.stringify({
          success: false,
          message: 'You need to be logged in to view your cart.',
        });
      }

      const cart = await cartService.getCart(user_id);

      return JSON.stringify({
        success: true,
        item_count: cart.item_count,
        subtotal: cart.subtotal,
        total: cart.total,
        items: cart.items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_slug: item.product_slug,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price_at_addition,
        })),
      });
    } catch (error: unknown) {
      console.error('Get cart tool error:', error);
      return JSON.stringify({
        success: false,
        message: 'Failed to retrieve cart contents.',
      });
    }
  },
});
