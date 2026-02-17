import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { chatService } from '@/features/chat/services/chatService';
import { SendMessageRequest } from '@/features/chat/types';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20;

// Simple in-memory rate limiter (per user/IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  try {
    const body: SendMessageRequest = await req.json();

    // Validate required fields
    if (!body.message || body.message.trim().length === 0) {
      return errorResponse('message is required', 400);
    }

    // Validate message length
    if (body.message.length > MAX_MESSAGE_LENGTH) {
      return errorResponse(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`, 400);
    }

    // Check if user is authenticated (optional - chat can work for anonymous users)
    let userId: string | null = null;
    try {
      const token = await getAuthCookie();
      if (token) {
        const user = await verifyToken(token);
        userId = user.userId;
      }
    } catch {
      // User not authenticated - that's okay, chat works for anonymous users
    }

    // Rate limiting (by userId or IP)
    const rateLimitKey = userId || req.headers.get('x-forwarded-for') || 'anonymous';
    if (isRateLimited(rateLimitKey)) {
      return errorResponse('Too many messages. Please wait a moment before trying again.', 429);
    }

    // Send message and get response
    const response = await chatService.sendMessage(userId, body);

    return successResponse(response);
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process chat message';
    return errorResponse(message, 500);
  }
}
