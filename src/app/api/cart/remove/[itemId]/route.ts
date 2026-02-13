import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';

export const DELETE = withAuth(async (req, { params, user }) => {
  // TODO: implement - call cartService.removeItem()
  const { itemId } = await params;
  return errorResponse('Not implemented', 501);
});
