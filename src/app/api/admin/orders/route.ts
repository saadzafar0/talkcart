import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { orderAdminService } from '@/features/admin';

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      status: searchParams.get('status') || undefined,
      payment_status: searchParams.get('payment_status') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
    };

    const result = await orderAdminService.getAll(filters);
    return successResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch orders';
    return errorResponse(message, 500);
  }
});
