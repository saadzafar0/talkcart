'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingBag } from 'lucide-react';
import { formatPrice, formatRating } from '@/core/utils/formatters';
import { PLACEHOLDER_IMAGE } from '@/core/utils/constants';

interface ChatProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    image_url?: string | null;
    rating?: number;
    review_count?: number;
    stock_quantity?: number;
  };
  onAddToCart?: (productId: string) => void;
}

export function ChatProductCard({ product, onAddToCart }: ChatProductCardProps) {
  return (
    <div className="my-2 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
      <div className="flex gap-3 p-3">
        <Link
          href={`/products/${product.slug}`}
          className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg"
        >
          <Image
            src={product.image_url || PLACEHOLDER_IMAGE}
            alt={product.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-semibold text-primary-900 hover:text-accent-700"
          >
            {product.name}
          </Link>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-sm font-bold text-primary-900">
              {formatPrice(product.base_price)}
            </span>
            {product.rating && product.rating > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-primary-500">
                <Star className="h-3 w-3 fill-accent-600 text-accent-600" />
                {formatRating(product.rating)}
              </span>
            )}
          </div>
          {product.stock_quantity !== undefined && product.stock_quantity <= 0 && (
            <span className="text-xs text-error-600">Out of stock</span>
          )}
        </div>
        {onAddToCart && product.stock_quantity !== undefined && product.stock_quantity > 0 && (
          <button
            onClick={() => onAddToCart(product.id)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center self-center rounded-lg bg-accent-600 text-primary-900 transition-colors hover:bg-accent-500"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
