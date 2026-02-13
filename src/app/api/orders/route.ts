import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import {
  successResponse,
  errorResponse,
  createdResponse,
} from '@/lib/api/response';
import { orderService } from '@/features/orders';

export const GET = withAuth(async (_req, { user }) => {
  try {
    const orders = await orderService.getAll(user.userId);
    return successResponse(orders);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch orders';
    return errorResponse(message, 500);
  }
});

export const POST = withAuth(async (req: NextRequest, { user }) => {
  try {
    const body = await req.json();

    if (
      !body.shipping_address_id ||
      !body.shipping_method ||
      !body.payment_method
    ) {
      return errorResponse(
        'shipping_address_id, shipping_method, and payment_method are required',
        400
      );
    }

    const order = await orderService.create(user.userId, {
      shipping_address_id: body.shipping_address_id,
      shipping_method: body.shipping_method,
      payment_method: body.payment_method,
      discount_code: body.discount_code,
      notes: body.notes,
    });
    return createdResponse(order);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to create order';
    return errorResponse(message, 500);
  }
});
