import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { cartService } from '@/features/cart';

export const DELETE = withAuth(async (_req, { params, user }) => {
  try {
    const { itemId } = await params;
    const cart = await cartService.removeItem(user.userId, itemId);
    return successResponse(cart);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to remove item';
    return errorResponse(message, 500);
  }
});
