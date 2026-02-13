import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { cartService } from '@/features/cart/services/cartService';
import { AddToCartRequest } from '@/features/cart/types';

export const POST = withAuth(async (req, { user }) => {
  try {
    const body: AddToCartRequest = await req.json();

    // Validate required fields
    if (!body.product_id) {
      return errorResponse('product_id is required', 400);
    }

    // Validate quantity
    if (body.quantity !== undefined && body.quantity < 1) {
      return errorResponse('quantity must be at least 1', 400);
    }

    const cart = await cartService.addItem(user.userId, body);
    return successResponse(cart, 200);
  } catch (error: any) {
    console.error('Cart add error:', error);
    
    // Handle specific errors
    if (error.message === 'Product not found') {
      return errorResponse(error.message, 404);
    }
    if (error.message.includes('stock')) {
      return errorResponse(error.message, 409);
    }
    
    return errorResponse(error.message || 'Failed to add item to cart', 500);
  }
});
