import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export const goToCheckoutTool = new DynamicStructuredTool({
  name: 'go_to_checkout',
  description:
    'Navigate the customer to the checkout page. Use when they ask to checkout, proceed to checkout, go to checkout, complete purchase, or similar. This will take them from cart to checkout.',
  schema: z.object({}),
  func: async () => {
    return JSON.stringify({
      success: true,
      message: 'Taking you to checkout.',
      path: '/checkout',
    });
  },
});
