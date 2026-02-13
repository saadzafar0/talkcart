'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingBag } from 'lucide-react';
import { formatPrice, formatRating, truncateText } from '@/core/utils/formatters';
import { PLACEHOLDER_IMAGE } from '@/core/utils/constants';
import type { Product } from '@/features/products/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const inStock = product.stock_quantity > 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 transition-all hover:border-accent-600/30 hover:shadow-lg">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden">
        <Image
          src={product.image_url || PLACEHOLDER_IMAGE}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-900/50">
            <span className="rounded-full bg-error-600 px-3 py-1 text-xs font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
        {product.minimum_price < product.base_price && inStock && (
          <div className="absolute left-3 top-3 rounded-full bg-accent-600 px-2.5 py-1 text-xs font-bold text-primary-900">
            Haggle!
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-primary-900 transition-colors group-hover:text-accent-700">
            {truncateText(product.name, 50)}
          </h3>
        </Link>

        {product.description && (
          <p className="mt-1 text-sm text-primary-600">
            {truncateText(product.description, 80)}
          </p>
        )}

        {/* Rating */}
        {product.review_count > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent-600 text-accent-600" />
            <span className="text-sm font-medium text-primary-900">
              {formatRating(product.rating)}
            </span>
            <span className="text-xs text-primary-500">
              ({product.review_count})
            </span>
          </div>
        )}

        {/* Price + Add to cart */}
        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            <span className="text-lg font-bold text-primary-900">
              {formatPrice(product.base_price)}
            </span>
            {product.minimum_price < product.base_price && (
              <div className="text-xs text-success-600">
                Negotiate from {formatPrice(product.minimum_price)}
              </div>
            )}
          </div>
          {inStock && onAddToCart && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product.id);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-600 text-primary-900 transition-colors hover:bg-accent-500"
            >
              <ShoppingBag className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
