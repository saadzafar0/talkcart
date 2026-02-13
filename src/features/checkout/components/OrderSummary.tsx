import Image from 'next/image';
import { formatPrice } from '@/core/utils/formatters';
import { PLACEHOLDER_IMAGE } from '@/core/utils/constants';
import type { CartSummary } from '@/features/cart/types';

interface CheckoutOrderSummaryProps {
  cart: CartSummary;
  shippingCost: number;
  discountAmount: number;
}

export function CheckoutOrderSummary({ cart, shippingCost, discountAmount }: CheckoutOrderSummaryProps) {
  const taxRate = 0.08;
  const taxableAmount = cart.subtotal - discountAmount;
  const tax = Math.round(taxableAmount * taxRate * 100) / 100;
  const total = Math.round((taxableAmount + tax + shippingCost) * 100) / 100;

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
      <h3 className="text-lg font-semibold text-primary-900">Order Summary</h3>

      {/* Items list */}
      <div className="mt-4 space-y-3">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200">
              <Image
                src={item.product_image || PLACEHOLDER_IMAGE}
                alt={item.product_name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium text-primary-900">
                {item.product_name}
              </div>
              <div className="text-xs text-primary-500">Qty: {item.quantity}</div>
            </div>
            <span className="text-sm font-medium text-primary-900">
              {formatPrice(item.price_at_addition * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-primary-600">Subtotal</span>
          <span className="text-primary-900">{formatPrice(cart.subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-success-600">Discount</span>
            <span className="text-success-600">-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-primary-600">Shipping</span>
          <span className="text-primary-900">{formatPrice(shippingCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-primary-600">Tax (8%)</span>
          <span className="text-primary-900">{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between border-t border-neutral-200 pt-2">
          <span className="text-base font-semibold text-primary-900">Total</span>
          <span className="text-xl font-bold text-primary-900">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
