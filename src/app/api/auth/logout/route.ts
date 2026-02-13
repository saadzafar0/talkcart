import { clearAuthCookie } from '@/lib/auth/cookies';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function POST() {
  try {
    await clearAuthCookie();
    return successResponse({ message: 'Logged out successfully' });
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
