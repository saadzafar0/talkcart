import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { chatService } from '@/features/chat/services/chatService';
import { SendMessageRequest } from '@/features/chat/types';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body: SendMessageRequest = await req.json();

    // Validate required fields
    if (!body.message || body.message.trim().length === 0) {
      return errorResponse('message is required', 400);
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

    // Send message and get response
    const response = await chatService.sendMessage(userId, body);

    return successResponse(response);
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process chat message';
    return errorResponse(message, 500);
  }
}
