'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { CartItemRow } from '@/features/cart/components/CartItem';
import { CartSummaryPanel } from '@/features/cart/components/CartSummary';
import { DiscountCodeInput } from '@/features/cart/components/DiscountCodeInput';
import { LoadingSpinner } from '@/core/components/common/LoadingSpinner';
import { EmptyState } from '@/core/components/common/EmptyState';
import type { CartSummary } from '@/features/cart/types';

export default function CartPage() {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [discountError, setDiscountError] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, quantity }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
      }
    } catch {
      // Silently handle
    } finally {
      setUpdating(false);
    }
  }

  async function handleRemoveItem(itemId: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/cart/remove/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
      }
    } catch {
      // Silently handle
    } finally {
      setUpdating(false);
    }
  }

  function handleApplyDiscount(code: string) {
    // Store the code for checkout
    setDiscountError('');
    // Discount validation happens at checkout, just store it for now
    sessionStorage.setItem('discount_code', code);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="Your cart is empty"
          description="Browse our products and add items to your cart to get started."
          action={
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-primary-900 transition-colors hover:bg-accent-500"
            >
              Browse Products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-primary-500 transition-colors hover:text-accent-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      <h1 className="mb-8 text-3xl font-bold text-primary-900">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
              disabled={updating}
            />
          ))}

          {/* Discount code */}
          <div className="mt-6">
            <DiscountCodeInput
              onApply={handleApplyDiscount}
              error={discountError}
            />
          </div>
        </div>

        {/* Summary */}
        <div>
          <CartSummaryPanel cart={cart} />
        </div>
      </div>
    </div>
  );
}
