'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/core/components/common/LoadingSpinner';
import { EmptyState } from '@/core/components/common/EmptyState';
import { formatPrice, formatDateShort } from '@/core/utils/formatters';
import { ORDER_STATUS_LABELS } from '@/core/utils/constants';
import type { OrderWithItems } from '@/features/orders/types';

const statusColors: Record<string, string> = {
  pending: 'bg-warning-500/10 text-warning-600 border-warning-500/30',
  processing: 'bg-accent-600/10 text-accent-700 border-accent-600/30',
  shipped: 'bg-primary-500/10 text-primary-600 border-primary-500/30',
  delivered: 'bg-success-600/10 text-success-600 border-success-600/30',
  cancelled: 'bg-error-500/10 text-error-600 border-error-500/30',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.data || []);
        } else if (res.status === 401) {
          router.push('/login');
        }
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-8 text-3xl font-bold text-primary-900">My Orders</h1>
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No orders yet"
          description="When you place an order, it will appear here."
          action={
            <Link
              href="/products"
              className="rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-primary-900 hover:bg-accent-500"
            >
              Start Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-8 text-3xl font-bold text-primary-900">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-100 p-5 transition-all hover:border-accent-600/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-900/5">
              <Package className="h-6 w-6 text-primary-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary-900">
                  {order.order_number}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || ''}`}>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-primary-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDateShort(order.created_at)}
                </span>
                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold text-primary-900">
                {formatPrice(order.total_amount)}
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-accent-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}
