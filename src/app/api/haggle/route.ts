import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { haggleService } from '@/features/haggle/services/haggleService';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * POST /api/haggle
 * Negotiate a price on a product.
 * Works for both authenticated and anonymous users.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.product_id) {
      return errorResponse('product_id is required', 400);
    }

    if (!body.message || typeof body.message !== 'string') {
      return errorResponse('message is required', 400);
    }

    // Optional auth — works for anonymous users too
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

    const response = await haggleService.negotiate(userId, {
      product_id: body.product_id,
      message: body.message,
      session_id: body.session_id,
    });

    return successResponse(response);
  } catch (error) {
    console.error('Haggle negotiate error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process negotiation';
    const status = message.includes('not found') ? 404 : message.includes('concluded') ? 409 : 500;
    return errorResponse(message, status);
  }
}
