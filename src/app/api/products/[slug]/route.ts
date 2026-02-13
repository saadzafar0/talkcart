import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // TODO: implement - call productService.getBySlug()
  const { slug } = await params;
  return errorResponse('Not implemented', 501);
}
