import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/features/auth';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { AppError } from '@/lib/api/errors';

export const GET = withAuth(async (req, { user }) => {
  try {
    const profile = await authService.getMe(user.userId);
    return successResponse({ user: profile });
  } catch (err) {
    if (err instanceof AppError) {
      return errorResponse(err.message, err.statusCode);
    }
    return errorResponse('Internal server error', 500);
  }
});
