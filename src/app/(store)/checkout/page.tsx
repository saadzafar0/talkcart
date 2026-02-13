'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Truck, CreditCard } from 'lucide-react';
import { AddressForm, type AddressData } from '@/features/checkout/components/AddressForm';
import { CheckoutOrderSummary } from '@/features/checkout/components/OrderSummary';
import { LoadingSpinner } from '@/core/components/common/LoadingSpinner';
import { EmptyState } from '@/core/components/common/EmptyState';
import type { CartSummary } from '@/features/cart/types';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [address, setAddress] = useState<AddressData>({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [notes, setNotes] = useState('');

  const shippingCost = shippingMethod === 'express' ? 15.0 : 5.0;

  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch('/api/cart');
        if (res.ok) {
          const data = await res.json();
          if (!data.data || data.data.items.length === 0) {
            router.push('/cart');
            return;
          }
          setCart(data.data);
        } else {
          router.push('/cart');
        }
      } catch {
        router.push('/cart');
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart) return;

    setError('');
    setSubmitting(true);

    // Validate required address fields
    if (!address.full_name || !address.phone || !address.address_line1 || !address.city || !address.state || !address.postal_code) {
      setError('Please fill in all required address fields');
      setSubmitting(false);
      return;
    }

    try {
      const discountCode = typeof window !== 'undefined' ? sessionStorage.getItem('discount_code') : null;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping_address_id: 'inline',
          shipping_method: shippingMethod,
          payment_method: paymentMethod,
          discount_code: discountCode || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to place order');
        return;
      }

      // Clear stored discount code
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('discount_code');
      }

      router.push(`/checkout/success?order=${data.data.order_number}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
          title="Your cart is empty"
          description="Add items before checking out."
          action={
            <Link
              href="/products"
              className="rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-primary-900 hover:bg-accent-500"
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
          href="/cart"
          className="inline-flex items-center gap-1 text-sm text-primary-500 transition-colors hover:text-accent-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
      </div>

      <h1 className="mb-8 text-3xl font-bold text-primary-900">Checkout</h1>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-error-500/30 bg-error-500/10 px-4 py-3 text-sm text-error-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Shipping Address */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary-900">Shipping Address</h2>
              <AddressForm address={address} onChange={setAddress} />
            </div>

            {/* Shipping Method */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary-900">Shipping Method</h2>
              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${
                    shippingMethod === 'standard'
                      ? 'border-accent-600 bg-accent-600/5'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value="standard"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="accent-accent-600"
                  />
                  <Truck className="h-5 w-5 text-primary-600" />
                  <div className="flex-1">
                    <div className="font-medium text-primary-900">Standard Shipping</div>
                    <div className="text-sm text-primary-500">5-7 business days</div>
                  </div>
                  <span className="font-semibold text-primary-900">$5.00</span>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${
                    shippingMethod === 'express'
                      ? 'border-accent-600 bg-accent-600/5'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="accent-accent-600"
                  />
                  <Truck className="h-5 w-5 text-accent-700" />
                  <div className="flex-1">
                    <div className="font-medium text-primary-900">Express Shipping</div>
                    <div className="text-sm text-primary-500">1-2 business days</div>
                  </div>
                  <span className="font-semibold text-primary-900">$15.00</span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary-900">Payment Method</h2>
              <label
                className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-accent-600 bg-accent-600/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-accent-600"
                />
                <CreditCard className="h-5 w-5 text-primary-600" />
                <div>
                  <div className="font-medium text-primary-900">Credit / Debit Card</div>
                  <div className="text-sm text-primary-500">Simulated payment</div>
                </div>
              </label>
            </div>

            {/* Order Notes */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
              <h2 className="mb-4 text-lg font-semibold text-primary-900">
                Order Notes <span className="font-normal text-neutral-500">(optional)</span>
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any special instructions for your order..."
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-primary-900 placeholder:text-neutral-500 transition-colors focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-4">
            <CheckoutOrderSummary
              cart={cart}
              shippingCost={shippingCost}
              discountAmount={0}
            />

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-lg bg-accent-600 py-3.5 text-sm font-semibold text-primary-900 transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
