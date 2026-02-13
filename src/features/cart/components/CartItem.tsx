'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/core/utils/formatters';
import { PLACEHOLDER_IMAGE } from '@/core/utils/constants';
import type { CartItemWithProduct } from '@/features/cart/types';

interface CartItemProps {
  item: CartItemWithProduct;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  disabled?: boolean;
}

export function CartItemRow({ item, onUpdateQuantity, onRemove, disabled }: CartItemProps) {
  return (
    <div className="flex gap-4 rounded-xl border border-neutral-200 bg-neutral-100 p-4">
      {/* Image */}
      <Link
        href={`/products/${item.product_slug}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg"
      >
        <Image
          src={item.product_image || PLACEHOLDER_IMAGE}
          alt={item.product_name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/${item.product_slug}`}
            className="font-semibold text-primary-900 transition-colors hover:text-accent-700"
          >
            {item.product_name}
          </Link>
          <div className="mt-0.5 text-sm text-primary-500">
            {formatPrice(item.price_at_addition)} each
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity controls */}
          <div className="inline-flex items-center rounded-lg border border-neutral-200 bg-neutral-50">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={disabled || item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center text-primary-600 transition-colors hover:text-primary-900 disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="flex h-8 w-10 items-center justify-center border-x border-neutral-200 text-sm font-medium text-primary-900">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={disabled}
              className="flex h-8 w-8 items-center justify-center text-primary-600 transition-colors hover:text-primary-900 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-primary-900">
              {formatPrice(item.price_at_addition * item.quantity)}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              disabled={disabled}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-error-600 transition-colors hover:bg-error-500/10 disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
