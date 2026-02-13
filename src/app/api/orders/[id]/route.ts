import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';

export const GET = withAuth(async (req, { params, user }) => {
  // TODO: implement - call orderService.getById()
  const { id } = await params;
  return errorResponse('Not implemented', 501);
});
