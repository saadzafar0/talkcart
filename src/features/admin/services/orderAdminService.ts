import { createServerSupabase } from '@/lib/supabase/server';
import { AdminOrderFilters, OrderUpdateRequest } from '../types';

export const orderAdminService = {
  async getAll(filters: AdminOrderFilters = {}) {
    const supabase = createServerSupabase();
    const { page = 1, limit = 20, status, payment_status, date_from, date_to } = filters;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select('*, users ( email, full_name )', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }
    if (payment_status) {
      query = query.eq('payment_status', payment_status);
    }
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      orders: data || [],
      total: count || 0,
      page,
      limit,
    };
  },

  async getById(orderId: string) {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users ( email, full_name, phone ),
        order_items ( *, products ( name, image_url, slug ) ),
        shipping_addresses ( * )
      `)
      .eq('id', orderId)
      .single();

    if (error || !data) throw new Error('Order not found');

    return data;
  },

  async updateStatus(orderId: string, data: OrderUpdateRequest) {
    const supabase = createServerSupabase();

    const updateData: Record<string, unknown> = { status: data.status };
    if (data.payment_status) {
      updateData.payment_status = data.payment_status;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select('*')
      .single();

    if (error || !order) throw new Error(error?.message || 'Failed to update order');

    return order;
  },
};
