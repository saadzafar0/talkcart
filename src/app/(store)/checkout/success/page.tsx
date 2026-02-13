'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '@/core/components/common/LoadingSpinner';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-600/10">
        <CheckCircle className="h-10 w-10 text-success-600" />
      </div>

      <h1 className="text-3xl font-bold text-primary-900">Order Placed!</h1>
      <p className="mt-3 text-lg text-primary-600">
        Thank you for your purchase. Your order has been confirmed.
      </p>

      {orderNumber && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-6 py-3">
          <Package className="h-5 w-5 text-accent-700" />
          <span className="text-sm text-primary-500">Order Number:</span>
          <span className="font-mono font-semibold text-primary-900">{orderNumber}</span>
        </div>
      )}

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-primary-900 transition-colors hover:bg-accent-500"
        >
          View Orders
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-6 py-3 text-sm font-semibold text-primary-900 transition-colors hover:border-neutral-300"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
