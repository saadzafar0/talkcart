import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';

export const POST = withAuth(async (req, { user }) => {
  // TODO: implement - parse body, call cartService.addItem()
  return errorResponse('Not implemented', 501);
});
