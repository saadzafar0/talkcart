'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { ProductFilters } from '@/features/products/components/ProductFilters';
import { LoadingSpinner } from '@/core/components/common/LoadingSpinner';
import { EmptyState } from '@/core/components/common/EmptyState';
import type { Product, ProductFilters as Filters } from '@/features/products/types';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const filters: Filters = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    sortBy: (searchParams.get('sortBy') as Filters['sortBy']) || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 20,
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data.products || []);
        setTotal(data.data.total || 0);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleFiltersChange(newFilters: Filters) {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice));
    if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice));
    if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));

    router.push(`/products?${params.toString()}`);
  }

  async function handleAddToCart(productId: string) {
    setAddingToCart(productId);
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to add to cart');
      }
    } catch {
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  }

  const totalPages = Math.ceil(total / (filters.limit || 20));
  const currentPage = filters.page || 1;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900">Products</h1>
        <p className="mt-1 text-primary-600">
          Browse our collection or ask the AI clerk for recommendations
        </p>
      </div>

      <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />

      <div className="mt-8">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try adjusting your filters or search terms"
            action={
              <button
                onClick={() => handleFiltersChange({ page: 1, limit: 20 })}
                className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-primary-900 transition-colors hover:bg-accent-500"
              >
                Clear Filters
              </button>
            }
          />
        ) : (
          <>
            <div className="mb-4 text-sm text-primary-500">
              Showing {products.length} of {total} products
            </div>
            <ProductGrid
              products={products}
              onAddToCart={(id) => {
                if (!addingToCart) handleAddToCart(id);
              }}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => handleFiltersChange({ ...filters, page: currentPage - 1 })}
                  disabled={currentPage <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-primary-900 transition-colors hover:border-accent-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleFiltersChange({ ...filters, page: pageNum })}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        pageNum === currentPage
                          ? 'bg-accent-600 text-primary-900'
                          : 'border border-neutral-200 bg-neutral-100 text-primary-900 hover:border-accent-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handleFiltersChange({ ...filters, page: currentPage + 1 })}
                  disabled={currentPage >= totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-primary-900 transition-colors hover:border-accent-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
