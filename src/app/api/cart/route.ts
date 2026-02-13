import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { cartService } from '@/features/cart';

export const GET = withAuth(async (_req, { user }) => {
  try {
    const cart = await cartService.getCart(user.userId);
    return successResponse(cart);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch cart';
    return errorResponse(message, 500);
  }
});

export const PATCH = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();

    if (!body.item_id || typeof body.quantity !== 'number') {
      return errorResponse('item_id and quantity are required', 400);
    }

    if (body.quantity < 1) {
      return errorResponse('Quantity must be at least 1', 400);
    }

    const cart = await cartService.updateQuantity(
      user.userId,
      body.item_id,
      body.quantity
    );
    return successResponse(cart);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update quantity';
    return errorResponse(message, 500);
  }
});
