import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  // TODO: implement - parse query params, call productService.getAll()
  return errorResponse('Not implemented', 501);
}
