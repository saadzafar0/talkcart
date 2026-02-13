import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  // TODO: implement - parse body.session_id, call haggleService.accept()
  return errorResponse('Not implemented', 501);
}
