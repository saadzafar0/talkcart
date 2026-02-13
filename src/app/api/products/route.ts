import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { productService } from '@/features/products/services/productService';
import { ProductFilters } from '@/features/products/types';

/**
 * GET /api/products
 * Fetch products with optional filters, sorting, and pagination
 * 
 * Query parameters:
 * - category: Filter by category slug
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 * - search: Text search in name and description
 * - sortBy: price_asc | price_desc | rating | newest
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Parse query parameters
    const filters: ProductFilters = {
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') 
        ? parseFloat(searchParams.get('minPrice')!) 
        : undefined,
      maxPrice: searchParams.get('maxPrice') 
        ? parseFloat(searchParams.get('maxPrice')!) 
        : undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as ProductFilters['sortBy']) || 'newest',
      page: searchParams.get('page') 
        ? parseInt(searchParams.get('page')!) 
        : 1,
      limit: searchParams.get('limit') 
        ? parseInt(searchParams.get('limit')!) 
        : 20,
    };

    // Validate pagination
    if (filters.page && filters.page < 1) {
      return errorResponse('Page must be greater than 0', 400);
    }

    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      return errorResponse('Limit must be between 1 and 100', 400);
    }

    // Validate price range
    if (filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice) {
      return errorResponse('minPrice cannot be greater than maxPrice', 400);
    }

    // Fetch products
    const result = await productService.getAll(filters);

    return successResponse({
      ...result,
      hasMore: result.page * result.limit < result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch products',
      500
    );
  }
}
