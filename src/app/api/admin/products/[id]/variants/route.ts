import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { successResponse, errorResponse, createdResponse } from '@/lib/api/response';
import { productAdminService } from '@/features/admin';

export const GET = withAdmin(async (_req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const variants = await productAdminService.getVariants(id);
    return successResponse(variants);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch variants';
    return errorResponse(message, 500);
  }
});

export const POST = withAdmin(async (req: NextRequest, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const variant = await productAdminService.createVariant({ ...body, product_id: id });
    return createdResponse(variant);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create variant';
    return errorResponse(message, 500);
  }
});
