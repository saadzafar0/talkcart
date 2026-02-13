import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { cartService } from '@/features/cart/services/cartService';

export const GET = withAuth(async (req, { user }) => {
  try {
    const cart = await cartService.getCart(user.userId);
    return successResponse(cart);
  } catch (error: any) {
    console.error('Cart GET error:', error);
    return errorResponse(error.message || 'Failed to fetch cart', 500);
  }
});
