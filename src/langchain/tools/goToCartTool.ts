import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export const goToCartTool = new DynamicStructuredTool({
  name: 'go_to_cart',
  description:
    'Navigate the customer to their cart page. Use when they ask to view their cart, go to cart, see their cart, check their cart, or similar.',
  schema: z.object({}),
  func: async () => {
    return JSON.stringify({
      success: true,
      message: 'Taking you to your cart.',
      path: '/cart',
    });
  },
});
