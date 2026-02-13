'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { SORT_OPTIONS } from '@/core/utils/constants';
import type { ProductFilters as ProductFiltersType } from '@/features/products/types';
import type { Category } from '@/features/products/types';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
}

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data || []);
        }
      } catch {
        // Silently fail
      }
    }
    fetchCategories();
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchInput || undefined, page: 1 });
  }

  function handleSortChange(sortBy: string) {
    onFiltersChange({
      ...filters,
      sortBy: sortBy as ProductFiltersType['sortBy'],
      page: 1,
    });
  }

  function handleCategoryChange(category: string) {
    onFiltersChange({
      ...filters,
      category: category || undefined,
      page: 1,
    });
  }

  function handlePriceChange(field: 'minPrice' | 'maxPrice', value: string) {
    onFiltersChange({
      ...filters,
      [field]: value ? Number(value) : undefined,
      page: 1,
    });
  }

  function clearFilters() {
    setSearchInput('');
    onFiltersChange({ page: 1, limit: filters.limit });
  }

  const hasActiveFilters = filters.category || filters.search || filters.minPrice || filters.maxPrice;

  return (
    <div className="space-y-4">
      {/* Search + Sort bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-neutral-200 bg-neutral-100 py-2.5 pl-10 pr-4 text-sm text-primary-900 placeholder:text-neutral-500 transition-colors focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
          />
        </form>

        <div className="flex items-center gap-3">
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2.5 text-sm text-primary-900 transition-colors focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'border-accent-600 bg-accent-600/10 text-accent-700'
                : 'border-neutral-200 bg-neutral-100 text-primary-900 hover:border-neutral-300'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Expandable filter panel */}
      {showFilters && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-4">
          <div className="flex flex-wrap gap-4">
            {/* Category */}
            <div className="min-w-[180px]">
              <label className="mb-1.5 block text-xs font-medium text-primary-600">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-primary-900 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div className="min-w-[120px]">
              <label className="mb-1.5 block text-xs font-medium text-primary-600">
                Min Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.minPrice || ''}
                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                placeholder="$0"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-primary-900 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
              />
            </div>

            {/* Max Price */}
            <div className="min-w-[120px]">
              <label className="mb-1.5 block text-xs font-medium text-primary-600">
                Max Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.maxPrice || ''}
                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                placeholder="Any"
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-primary-900 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
              />
            </div>

            {/* Clear button */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-lg border border-error-500/30 bg-error-500/10 px-3 py-2 text-sm font-medium text-error-600 transition-colors hover:bg-error-500/20"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
