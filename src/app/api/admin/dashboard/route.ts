import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { analyticsService } from '@/features/admin';

export const GET = withAdmin(async (_req: NextRequest) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    return successResponse(stats);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
    return errorResponse(message, 500);
  }
});
