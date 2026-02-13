'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, MessageSquare } from 'lucide-react';

interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  orders_today: number;
  revenue_today: number;
}

interface RecentOrder {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  users: { email: string; full_name: string | null } | null;
}

interface TopProduct {
  product_id: string;
  name: string;
  total_quantity: number;
  total_revenue: number;
}

interface HaggleStats {
  total_sessions: number;
  acceptance_rate: number;
  average_discount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [haggleStats, setHaggleStats] = useState<HaggleStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/dashboard').then((r) => r.json()),
      fetch('/api/admin/analytics?type=recent_orders&limit=5').then((r) => r.json()),
      fetch('/api/admin/analytics?type=top_products&limit=5').then((r) => r.json()),
      fetch('/api/admin/analytics?type=haggle_stats').then((r) => r.json()),
    ])
      .then(([dashRes, ordersRes, productsRes, haggleRes]) => {
        if (dashRes.data) setStats(dashRes.data);
        if (ordersRes.data) setRecentOrders(ordersRes.data);
        if (productsRes.data) setTopProducts(productsRes.data);
        if (haggleRes.data) setHaggleStats(haggleRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-primary-600">Loading dashboard...</div>;
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${(stats?.total_revenue || 0).toLocaleString()}`,
      sub: `$${(stats?.revenue_today || 0).toLocaleString()} today`,
      icon: DollarSign,
      color: 'text-green-700',
    },
    {
      label: 'Orders',
      value: stats?.total_orders || 0,
      sub: `${stats?.orders_today || 0} today`,
      icon: ShoppingCart,
      color: 'text-accent-700',
    },
    {
      label: 'Customers',
      value: stats?.total_customers || 0,
      sub: 'registered',
      icon: Users,
      color: 'text-blue-700',
    },
    {
      label: 'Products',
      value: stats?.total_products || 0,
      sub: 'active',
      icon: Package,
      color: 'text-primary-700',
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-primary-900">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-lg border border-neutral-200 p-5 flex items-start gap-4"
            >
              <div className={`p-2 rounded-lg bg-neutral-50 ${card.color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-sm text-primary-500">{card.label}</p>
                <p className="text-2xl font-bold text-primary-900">{card.value}</p>
                <p className="text-xs text-primary-500 mt-1">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent orders + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Recent Orders
          </h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-primary-500">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-primary-900">
                      {order.users?.full_name || order.users?.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-primary-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-900">
                      ${order.total_amount?.toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
            <Package size={18} /> Top Products
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-primary-500">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-accent-700 w-6">{i + 1}</span>
                    <p className="text-sm font-medium text-primary-900">{product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary-700">x{product.total_quantity}</p>
                    <p className="text-xs text-primary-500">
                      ${product.total_revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Haggle stats */}
      {haggleStats && (
        <div className="bg-white rounded-lg border border-neutral-200 p-5">
          <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
            <MessageSquare size={18} /> Haggle Stats
          </h2>
          <div className="flex gap-8">
            <div>
              <p className="text-2xl font-bold text-primary-900">
                {haggleStats.total_sessions}
              </p>
              <p className="text-xs text-primary-500">Negotiations</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-700">
                {haggleStats.acceptance_rate.toFixed(0)}%
              </p>
              <p className="text-xs text-primary-500">Acceptance Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-900">
                {haggleStats.average_discount.toFixed(1)}%
              </p>
              <p className="text-xs text-primary-500">Avg Discount</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
