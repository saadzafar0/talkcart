import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';

export const GET = withAuth(async (req, { user }) => {
  // TODO: implement - call cartService.getCart(user.userId)
  return errorResponse('Not implemented', 501);
});
