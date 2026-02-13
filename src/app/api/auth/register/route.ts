import { NextRequest } from 'next/server';
import { authService } from '@/features/auth';
import { setAuthCookie } from '@/lib/auth/cookies';
import { createdResponse, errorResponse } from '@/lib/api/response';
import { AppError } from '@/lib/api/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await authService.register(body);
    await setAuthCookie(result.token);
    return createdResponse({ user: result.user });
  } catch (err) {
    if (err instanceof AppError) {
      return errorResponse(err.message, err.statusCode);
    }
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[auth/register]', message);
    return errorResponse(message, 500);
  }
}
