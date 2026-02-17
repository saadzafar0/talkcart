import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { orderService } from '@/features/orders/services/orderService';

export const getOrderHistoryTool = new DynamicStructuredTool({
  name: 'get_order_history',
  description:
    'Get the logged-in user\'s past orders. Use when the customer asks "show me my orders", "what did I buy?", "order history", "my purchases", etc. Requires authentication.',
  schema: z.object({
    user_id: z.string().describe('The authenticated user ID'),
    limit: z.number().optional().default(5).describe('Maximum number of orders to return'),
  }),
  func: async ({ user_id, limit }) => {
    try {
      if (!user_id) {
        return JSON.stringify({
          success: false,
          message: 'You need to be logged in to view order history.',
          orders: [],
        });
      }

      const orders = await orderService.getAll(user_id);
      const limited = orders.slice(0, limit);

      if (limited.length === 0) {
        return JSON.stringify({
          success: true,
          message: 'No orders found. You haven\'t placed any orders yet.',
          orders: [],
        });
      }

      return JSON.stringify({
        success: true,
        total_orders: orders.length,
        orders: limited.map((o) => ({
          id: o.id,
          status: o.status,
          total: o.total_amount,
          created_at: o.created_at,
          item_count: o.items?.length || 0,
          items: (o.items || []).slice(0, 5).map((item) => ({
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price,
          })),
        })),
      });
    } catch (error: unknown) {
      console.error('Get order history tool error:', error);
      return JSON.stringify({
        success: false,
        message: 'Failed to retrieve order history.',
        orders: [],
      });
    }
  },
});
