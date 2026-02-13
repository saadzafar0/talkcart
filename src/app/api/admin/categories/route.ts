import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { successResponse, errorResponse, createdResponse } from '@/lib/api/response';
import { categoryAdminService } from '@/features/admin';

export const GET = withAdmin(async () => {
  try {
    const categories = await categoryAdminService.getAll();
    return successResponse(categories);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch categories';
    return errorResponse(message, 500);
  }
});

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const { name, description } = await req.json();
    if (!name) return errorResponse('Name is required', 422);

    const category = await categoryAdminService.create(name, description);
    return createdResponse(category);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create category';
    return errorResponse(message, 500);
  }
});
