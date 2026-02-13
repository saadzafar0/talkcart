import { NextRequest } from 'next/server';
import { authService } from '@/features/auth';
import { setAuthCookie } from '@/lib/auth/cookies';
import { successResponse, errorResponse } from '@/lib/api/response';
import { AppError } from '@/lib/api/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await authService.login(body);
    await setAuthCookie(result.token);
    return successResponse({ user: result.user });
  } catch (err) {
    if (err instanceof AppError) {
      return errorResponse(err.message, err.statusCode);
    }
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[auth/login]', message);
    return errorResponse(message, 500);
  }
}
