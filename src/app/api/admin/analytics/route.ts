import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { analyticsService } from '@/features/admin';

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'top_products': {
        const limit = Number(searchParams.get('limit')) || 5;
        const data = await analyticsService.getTopProducts(limit);
        return successResponse(data);
      }
      case 'revenue_by_day': {
        const days = Number(searchParams.get('days')) || 30;
        const data = await analyticsService.getRevenueByDay(days);
        return successResponse(data);
      }
      case 'recent_orders': {
        const limit = Number(searchParams.get('limit')) || 10;
        const data = await analyticsService.getRecentOrders(limit);
        return successResponse(data);
      }
      case 'haggle_stats': {
        const data = await analyticsService.getHaggleStats();
        return successResponse(data);
      }
      default:
        return errorResponse(
          'Provide ?type= one of: top_products, revenue_by_day, recent_orders, haggle_stats',
          422
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analytics query failed';
    return errorResponse(message, 500);
  }
});
