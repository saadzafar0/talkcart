'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface OrderDetail {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  users: { email: string; full_name: string | null; phone: string | null } | null;
  order_items: {
    id: string;
    quantity: number;
    price_at_time: number;
    products: { name: string; image_url: string | null; slug: string } | null;
  }[];
  shipping_addresses: {
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }[] | null;
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setOrder(data.data);
          setStatus(data.data.status);
          setPaymentStatus(data.data.payment_status);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, payment_status: paymentStatus }),
      });
      router.push('/admin/orders');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-primary-500">Loading order...</div>;
  if (!order) return <div className="text-red-600">Order not found</div>;

  const address = order.shipping_addresses?.[0];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-primary-500 hover:text-primary-900">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-primary-900">
          Order {order.id.slice(0, 8)}...
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer info */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold text-primary-600 mb-3">Customer</h2>
          <p className="text-primary-900 font-medium">{order.users?.full_name || 'N/A'}</p>
          <p className="text-sm text-primary-600">{order.users?.email}</p>
          {order.users?.phone && (
            <p className="text-sm text-primary-500">{order.users.phone}</p>
          )}
        </div>

        {/* Shipping address */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-semibold text-primary-600 mb-3">Shipping Address</h2>
          {address ? (
            <div className="text-sm text-primary-900">
              <p>{address.address_line1}</p>
              {address.address_line2 && <p>{address.address_line2}</p>}
              <p>
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p>{address.country}</p>
            </div>
          ) : (
            <p className="text-sm text-primary-500">No address on file</p>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-lg border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold text-primary-600 mb-3">Items</h2>
        <table className="w-full text-sm">
          <thead className="text-primary-600 border-b border-neutral-200">
            <tr>
              <th className="text-left py-2">Product</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id} className="border-b border-neutral-100">
                <td className="py-2 text-primary-900">
                  {item.products?.name || 'Unknown'}
                </td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">${item.price_at_time.toFixed(2)}</td>
                <td className="py-2 text-right font-medium">
                  ${(item.price_at_time * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-neutral-300">
              <td colSpan={3} className="py-3 text-right font-semibold text-primary-900">
                Total
              </td>
              <td className="py-3 text-right font-bold text-primary-900">
                ${order.total_amount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Update status */}
      <div className="bg-white rounded-lg border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold text-primary-600 mb-4">Update Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-primary-700 mb-1">Order Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-primary-900 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-primary-700 mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-primary-900 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="mt-4 bg-accent-600 text-primary-900 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-accent-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Updating...' : 'Update Order'}
        </button>
      </div>
    </div>
  );
}
