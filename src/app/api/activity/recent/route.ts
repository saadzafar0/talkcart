import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { activityService } from '@/features/activity';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return errorResponse('Authentication required', 401);
    }
    const user = await verifyToken(token);

    const limitParam = req.nextUrl.searchParams.get('limit');
    const limit = Math.min(Number(limitParam) || 10, 50);

    const activities = await activityService.getRecent(user.userId, limit);
    return successResponse(activities);
  } catch {
    return successResponse([]);
  }
}
