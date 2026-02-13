import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { successResponse, errorResponse, createdResponse } from '@/lib/api/response';
import { discountAdminService } from '@/features/admin';

export const GET = withAdmin(async () => {
  try {
    const discounts = await discountAdminService.getAll();
    return successResponse(discounts);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch discounts';
    return errorResponse(message, 500);
  }
});

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    if (!body.code || !body.discount_type || !body.discount_value) {
      return errorResponse('code, discount_type, and discount_value are required', 422);
    }

    const discount = await discountAdminService.create(body);
    return createdResponse(discount);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create discount';
    return errorResponse(message, 500);
  }
});
