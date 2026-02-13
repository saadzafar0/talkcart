import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  // TODO: implement - parse session_id from query, call chatService.getHistory()
  return errorResponse('Not implemented', 501);
}
