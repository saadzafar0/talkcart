import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { haggleService } from '@/features/haggle/services/haggleService';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * POST /api/haggle/accept
 * Accept the current haggle deal and generate a discount code.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.session_id) {
      return errorResponse('session_id is required', 400);
    }

    // Optional auth
    let userId: string | null = null;
    try {
      const token = await getAuthCookie();
      if (token) {
        const user = await verifyToken(token);
        userId = user.userId;
      }
    } catch {
      // Anonymous user
    }

    const response = await haggleService.accept(userId, body.session_id);

    return successResponse(response);
  } catch (error) {
    console.error('Haggle accept error:', error);
    const message = error instanceof Error ? error.message : 'Failed to accept deal';
    const status = message.includes('not found')
      ? 404
      : message.includes('concluded') || message.includes('No offer')
        ? 409
        : 500;
    return errorResponse(message, status);
  }
}
