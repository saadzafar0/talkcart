import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { productService } from '@/features/products/services/productService';

/**
 * GET /api/products/:slug
 * Fetch a single product by slug with full details including variants and reviews
 * 
 * Query parameters:
 * - includeVariants: Include product variants (default: true)
 * - includeReviews: Include product reviews (default: true)
 * - includeRelated: Include related products (default: false)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = req.nextUrl.searchParams;

    // Parse query parameters
    const includeVariants = searchParams.get('includeVariants') !== 'false';
    const includeReviews = searchParams.get('includeReviews') !== 'false';
    const includeRelated = searchParams.get('includeRelated') === 'true';

    // Fetch product
    const product = await productService.getBySlug(slug);

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    // Build response with optional includes
    const response: {
      product: typeof product;
      variants?: unknown[];
      reviews?: unknown[];
      related?: unknown[];
    } = { product };

    // Fetch variants if requested
    if (includeVariants) {
      response.variants = await productService.getVariants(product.id);
    }

    // Fetch reviews if requested
    if (includeReviews) {
      response.reviews = await productService.getReviews(product.id, 10);
    }

    // Fetch related products if requested
    if (includeRelated) {
      response.related = await productService.getRelated(product.id, 4);
    }

    return successResponse(response);
  } catch (error) {
    console.error('Error fetching product:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch product',
      500
    );
  }
}
