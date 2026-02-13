import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  // TODO: implement - parse body.query, call productService.search() (RAG)
  return errorResponse('Not implemented', 501);
}
