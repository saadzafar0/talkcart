import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { successResponse, errorResponse, createdResponse } from '@/lib/api/response';
import { productAdminService } from '@/features/admin';

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      category_id: searchParams.get('category_id') || undefined,
      is_active: searchParams.has('is_active')
        ? searchParams.get('is_active') === 'true'
        : undefined,
      search: searchParams.get('search') || undefined,
    };

    const result = await productAdminService.getAll(filters);
    return successResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch products';
    return errorResponse(message, 500);
  }
});

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const product = await productAdminService.create(body);
    return createdResponse(product);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create product';
    return errorResponse(message, 500);
  }
});
