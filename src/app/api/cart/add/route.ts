import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { cartService } from '@/features/cart';

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();

    if (!body.product_id) {
      return errorResponse('product_id is required', 400);
    }

    const cart = await cartService.addItem(user.userId, {
      product_id: body.product_id,
      variant_id: body.variant_id,
      quantity: body.quantity,
    });
    return successResponse(cart);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add item to cart';
    return errorResponse(message, 500);
  }
});
