'use client';

import Link from 'next/link';
import { formatPrice } from '@/core/utils/formatters';
import type { CartSummary as CartSummaryType } from '@/features/cart/types';

interface CartSummaryProps {
  cart: CartSummaryType;
  showCheckout?: boolean;
}

export function CartSummaryPanel({ cart, showCheckout = true }: CartSummaryProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
      <h3 className="text-lg font-semibold text-primary-900">Order Summary</h3>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-primary-600">Subtotal ({cart.item_count} items)</span>
          <span className="font-medium text-primary-900">{formatPrice(cart.subtotal)}</span>
        </div>

        {cart.discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-success-600">Discount</span>
            <span className="font-medium text-success-600">-{formatPrice(cart.discount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-primary-600">Shipping</span>
          <span className="text-primary-500">Calculated at checkout</span>
        </div>

        <div className="border-t border-neutral-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-primary-900">Total</span>
            <span className="text-xl font-bold text-primary-900">
              {formatPrice(cart.total)}
            </span>
          </div>
        </div>
      </div>

      {showCheckout && cart.items.length > 0 && (
        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center rounded-lg bg-accent-600 py-3 text-sm font-semibold text-primary-900 transition-colors hover:bg-accent-500"
        >
          Proceed to Checkout
        </Link>
      )}
    </div>
  );
}
