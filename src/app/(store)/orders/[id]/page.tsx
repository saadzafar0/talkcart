'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { LoadingSpinner } from '@/core/components/common/LoadingSpinner';
import { formatPrice, formatDate } from '@/core/utils/formatters';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/core/utils/constants';
import type { OrderWithItems } from '@/features/orders/types';

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-5 w-5 text-warning-600" />,
  processing: <Package className="h-5 w-5 text-accent-700" />,
  shipped: <Truck className="h-5 w-5 text-primary-600" />,
  delivered: <CheckCircle className="h-5 w-5 text-success-600" />,
  cancelled: <XCircle className="h-5 w-5 text-error-600" />,
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning-500/10 text-warning-600 border-warning-500/30',
  processing: 'bg-accent-600/10 text-accent-700 border-accent-600/30',
  shipped: 'bg-primary-500/10 text-primary-600 border-primary-500/30',
  delivered: 'bg-success-600/10 text-success-600 border-success-600/30',
  cancelled: 'bg-error-500/10 text-error-600 border-error-500/30',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.data);
        } else if (res.status === 401) {
          router.push('/login');
        } else {
          router.push('/orders');
        }
      } catch {
        router.push('/orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm text-primary-500 transition-colors hover:text-accent-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">
            Order {order.order_number}
          </h1>
          <p className="mt-1 text-sm text-primary-500">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusIcons[order.status]}
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${statusColors[order.status] || ''}`}>
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
            <h2 className="mb-4 text-lg font-semibold text-primary-900">Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4"
                >
                  <div>
                    <div className="font-medium text-primary-900">{item.product_name}</div>
                    <div className="mt-0.5 text-sm text-primary-500">
                      Qty: {item.quantity} x {formatPrice(item.unit_price)}
                    </div>
                  </div>
                  <span className="font-semibold text-primary-900">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
            <h2 className="mb-4 text-lg font-semibold text-primary-900">Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-primary-600">Subtotal</span>
                <span className="text-primary-900">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-success-600">Discount</span>
                  <span className="text-success-600">-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-primary-600">Tax</span>
                <span className="text-primary-900">{formatPrice(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-600">Shipping</span>
                <span className="text-primary-900">{formatPrice(order.shipping_amount)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2">
                <span className="font-semibold text-primary-900">Total</span>
                <span className="text-lg font-bold text-primary-900">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
            <h2 className="mb-4 text-lg font-semibold text-primary-900">Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-accent-700" />
                <span className="text-primary-600">Shipping:</span>
                <span className="capitalize text-primary-900">
                  {order.shipping_method || 'Standard'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-accent-700" />
                <span className="text-primary-600">Payment:</span>
                <span className="capitalize text-primary-900">
                  {order.payment_method || 'Card'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-accent-700" />
                <span className="text-primary-600">Payment Status:</span>
                <span className="text-primary-900">
                  {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                </span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
              <h2 className="mb-2 text-lg font-semibold text-primary-900">Notes</h2>
              <p className="text-sm text-primary-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
