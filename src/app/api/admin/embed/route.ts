import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { embedProduct, embedAllProducts } from '@/features/admin/utils/embedProduct';

export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (body.all) {
      const result = await embedAllProducts();
      return successResponse({
        message: `Re-embedded all products: ${result.success} success, ${result.failed} failed`,
        ...result,
      });
    }

    if (body.productId) {
      await embedProduct(body.productId);
      return successResponse({ message: `Product ${body.productId} embedded successfully` });
    }

    return errorResponse('Provide either { productId } or { all: true }', 422);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Embedding failed';
    return errorResponse(message, 500);
  }
});
