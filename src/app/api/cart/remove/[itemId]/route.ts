import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { cartService } from '@/features/cart/services/cartService';

export const DELETE = withAuth(async (req, { params, user }) => {
  try {
    const { itemId } = await params;

    if (!itemId) {
      return errorResponse('itemId is required', 400);
    }

    const cart = await cartService.removeItem(user.userId, itemId);
    return successResponse(cart);
  } catch (error: any) {
    console.error('Cart remove error:', error);
    
    if (error.message === 'Cart item not found') {
      return errorResponse(error.message, 404);
    }
    
    return errorResponse(error.message || 'Failed to remove item from cart', 500);
  }
});
