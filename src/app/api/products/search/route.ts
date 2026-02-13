import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { productService } from '@/features/products/services/productService';

/**
 * POST /api/products/search
 * RAG-based semantic search for products
 * 
 * Request body:
 * {
 *   "query": "summer wedding outfit in Italy",
 *   "limit": 10
 * }
 * 
 * This endpoint uses RAG (Retrieval Augmented Generation) to perform
 * semantic search on products using vector embeddings.
 * For example: "outfit for summer wedding" will match products even if
 * they don't contain those exact words.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    if (!body.query || typeof body.query !== 'string') {
      return errorResponse('Query is required and must be a string', 400);
    }

    if (body.query.trim().length === 0) {
      return errorResponse('Query cannot be empty', 400);
    }

    if (body.query.length > 500) {
      return errorResponse('Query is too long (max 500 characters)', 400);
    }

    const limit = body.limit && typeof body.limit === 'number' 
      ? Math.min(Math.max(body.limit, 1), 50) 
      : 10;

    // Perform semantic search
    // Note: Currently uses basic text search. 
    // TODO: Integrate with LangChain for true RAG semantic search using embeddings
    const products = await productService.search(body.query, limit);

    return successResponse({
      query: body.query,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error searching products:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to search products',
      500
    );
  }
}
