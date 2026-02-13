import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { haggleService } from '@/features/haggle/services/haggleService';

export const hagglePriceTool = new DynamicStructuredTool({
  name: 'haggle_price',
  description:
    'Negotiate a discount on a product. ONLY use when the customer EXPLICITLY asks to negotiate, haggle, get a discount, or make a deal. Do NOT use for filters, search, or browse. Good reasons (birthday, bulk) may get a coupon. Rude customers may get a price RAISE. Lowballs are refused.',
  schema: z.object({
    product_id: z.string().describe('The UUID of the product to negotiate on (from your search results)'),
    message: z.string().describe("The user's haggle message or reason for discount"),
    session_id: z.string().optional().describe('Existing haggle session ID to continue negotiation'),
    user_id: z.string().optional().describe('The user ID if authenticated'),
  }),
  func: async ({ product_id, message, session_id, user_id }) => {
    try {
      const response = await haggleService.negotiate(user_id || null, {
        product_id,
        message,
        session_id,
      });

      return JSON.stringify({
        success: true,
        message: response.message,
        session: {
          id: response.session.id,
          status: response.session.status,
          original_price: response.session.original_price,
          offered_price: response.session.offered_price,
        },
        discount_code: response.discount_code
          ? {
              code: response.discount_code.code,
              discount_type: response.discount_code.discount_type,
              discount_value: response.discount_code.discount_value,
              instruction: `IMPORTANT: Tell the customer their coupon code is "${response.discount_code.code}" for $${response.discount_code.discount_value} off. They can use it at checkout. It expires in 24 hours.`,
            }
          : null,
      });
    } catch (error) {
      console.error('Haggle price tool error:', error);
      return JSON.stringify({
        success: false,
        message: "I'm having trouble with the negotiation right now. Let's try again!",
      });
    }
  },
});
