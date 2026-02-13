import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { chatService } from '@/features/chat/services/chatService';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return errorResponse('session_id query parameter is required', 400);
    }

    const history = await chatService.getHistory(sessionId);

    return successResponse({ messages: history });
  } catch (error: any) {
    console.error('Chat history API error:', error);
    return errorResponse(error.message || 'Failed to fetch chat history', 500);
  }
}
