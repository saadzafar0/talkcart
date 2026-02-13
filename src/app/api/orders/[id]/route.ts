import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { orderService } from '@/features/orders';

export const GET = withAuth(async (_req, { params, user }) => {
  try {
    const { id } = await params;
    const order = await orderService.getById(user.userId, id);

    if (!order) {
      return errorResponse('Order not found', 404);
    }

    return successResponse(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch order';
    return errorResponse(message, 500);
  }
});
