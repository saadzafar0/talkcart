import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { activityService } from '@/features/activity';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';
import type { ActivityType } from '@/features/activity';

export async function POST(req: NextRequest) {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return errorResponse('Authentication required', 401);
    }
    const user = await verifyToken(token);

    const body = await req.json();
    const { activity_type, product_id, metadata } = body as {
      activity_type: ActivityType;
      product_id?: string;
      metadata?: Record<string, unknown>;
    };

    if (!activity_type) {
      return errorResponse('activity_type is required', 400);
    }

    await activityService.track(user.userId, activity_type, product_id, metadata);
    return successResponse({ tracked: true });
  } catch {
    // Activity tracking is non-critical
    return successResponse({ tracked: false });
  }
}
