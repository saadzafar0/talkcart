import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { orderAdminService } from '@/features/admin';

export const GET = withAdmin(async (_req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const order = await orderAdminService.getById(id);
    return successResponse(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch order';
    return errorResponse(message, 500);
  }
});

export const PATCH = withAdmin(async (req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const order = await orderAdminService.updateStatus(id, body);
    return successResponse(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update order';
    return errorResponse(message, 500);
  }
});
