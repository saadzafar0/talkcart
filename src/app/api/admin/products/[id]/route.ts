import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { productAdminService } from '@/features/admin';

export const GET = withAdmin(async (_req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const product = await productAdminService.getById(id);
    return successResponse(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch product';
    return errorResponse(message, 500);
  }
});

export const PATCH = withAdmin(async (req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const product = await productAdminService.update(id, body);
    return successResponse(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update product';
    return errorResponse(message, 500);
  }
});

export const DELETE = withAdmin(async (_req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    await productAdminService.delete(id);
    return successResponse({ deleted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete product';
    return errorResponse(message, 500);
  }
});
