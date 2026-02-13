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

    const addr = body.shipping_address;
    if (
      !addr ||
      !addr.full_name ||
      !addr.phone ||
      !addr.address_line1 ||
      !addr.city ||
      !addr.state ||
      !addr.postal_code ||
      !addr.country ||
      !body.shipping_method ||
      !body.payment_method
    ) {
      return errorResponse(
        'shipping_address (with full_name, phone, address_line1, city, state, postal_code, country), shipping_method, and payment_method are required',
        400
      );
    }

    const order = await orderService.create(user.userId, {
      shipping_address: {
        full_name: addr.full_name,
        phone: addr.phone,
        address_line1: addr.address_line1,
        address_line2: addr.address_line2,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country,
      },
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
