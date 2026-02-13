import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { discountAdminService } from '@/features/admin';

export const PATCH = withAdmin(async (req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const discount = await discountAdminService.update(id, body);
    return successResponse(discount);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update discount';
    return errorResponse(message, 500);
  }
});

export const DELETE = withAdmin(async (_req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    await discountAdminService.deactivate(id);
    return successResponse({ deactivated: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to deactivate discount';
    return errorResponse(message, 500);
  }
});
