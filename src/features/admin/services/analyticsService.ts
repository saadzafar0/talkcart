import { createServerSupabase } from '@/lib/supabase/server';
import { AdminDashboardStats, RevenueByDay, TopProduct, HaggleStats } from '../types';

export const analyticsService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const supabase = createServerSupabase();

    const today = new Date().toISOString().split('T')[0];

    // Run queries in parallel
    const [revenueRes, ordersRes, customersRes, productsRes, todayOrdersRes] = await Promise.all([
      supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid'),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'customer'),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', today),
    ]);

    const total_revenue = (revenueRes.data || []).reduce(
      (sum, o) => sum + (o.total_amount || 0),
      0
    );
    const revenue_today = (todayOrdersRes.data || []).reduce(
      (sum, o) => sum + (o.total_amount || 0),
      0
    );

    return {
      total_revenue,
      total_orders: ordersRes.count || 0,
      total_customers: customersRes.count || 0,
      total_products: productsRes.count || 0,
      orders_today: todayOrdersRes.data?.length || 0,
      revenue_today,
    };
  },

  async getTopProducts(limit = 5): Promise<TopProduct[]> {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('order_items')
      .select('product_id, quantity, price_at_time, products ( name )');

    if (error || !data) return [];

    // Aggregate by product
    const productMap = new Map<string, TopProduct>();
    for (const item of data) {
      const productRef = item.products as unknown as { name: string } | null;
      const existing = productMap.get(item.product_id) || {
        product_id: item.product_id,
        name: productRef?.name || 'Unknown',
        total_quantity: 0,
        total_revenue: 0,
      };
      existing.total_quantity += item.quantity;
      existing.total_revenue += item.price_at_time * item.quantity;
      productMap.set(item.product_id, existing);
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, limit);
  },

  async getRecentOrders(limit = 10) {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('orders')
      .select('*, users ( email, full_name )')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getRevenueByDay(days = 30): Promise<RevenueByDay[]> {
    const supabase = createServerSupabase();

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('payment_status', 'paid')
      .gte('created_at', fromDate.toISOString());

    if (error || !data) return [];

    // Group by date
    const dayMap = new Map<string, RevenueByDay>();
    for (const order of data) {
      const date = order.created_at.split('T')[0];
      const existing = dayMap.get(date) || { date, revenue: 0, orders: 0 };
      existing.revenue += order.total_amount || 0;
      existing.orders += 1;
      dayMap.set(date, existing);
    }

    return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  },

  async getHaggleStats(): Promise<HaggleStats> {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('haggle_sessions')
      .select('status, final_price, initial_price');

    if (error || !data) {
      return { total_sessions: 0, acceptance_rate: 0, average_discount: 0 };
    }

    const total = data.length;
    const accepted = data.filter((s) => s.status === 'accepted').length;
    const discounts = data
      .filter((s) => s.status === 'accepted' && s.initial_price > 0)
      .map((s) => ((s.initial_price - s.final_price) / s.initial_price) * 100);

    const avgDiscount =
      discounts.length > 0
        ? discounts.reduce((sum, d) => sum + d, 0) / discounts.length
        : 0;

    return {
      total_sessions: total,
      acceptance_rate: total > 0 ? (accepted / total) * 100 : 0,
      average_discount: Math.round(avgDiscount * 100) / 100,
    };
  },
};
