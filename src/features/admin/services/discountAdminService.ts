import { createServerSupabase } from '@/lib/supabase/server';
import { CreateDiscountRequest } from '../types';

export const discountAdminService = {
  async getAll() {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async create(data: CreateDiscountRequest) {
    const supabase = createServerSupabase();

    const { data: discount, error } = await supabase
      .from('discount_codes')
      .insert({
        code: data.code.toUpperCase(),
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        product_id: data.product_id || null,
        min_purchase_amount: data.min_purchase_amount || null,
        max_discount_amount: data.max_discount_amount || null,
        usage_limit: data.usage_limit || null,
        expires_at: data.expires_at || null,
      })
      .select('*')
      .single();

    if (error || !discount) throw new Error(error?.message || 'Failed to create discount');
    return discount;
  },

  async update(discountId: string, data: Partial<CreateDiscountRequest> & { is_active?: boolean }) {
    const supabase = createServerSupabase();

    const updateData: Record<string, unknown> = { ...data };
    if (data.code) {
      updateData.code = data.code.toUpperCase();
    }

    const { data: discount, error } = await supabase
      .from('discount_codes')
      .update(updateData)
      .eq('id', discountId)
      .select('*')
      .single();

    if (error || !discount) throw new Error(error?.message || 'Failed to update discount');
    return discount;
  },

  async deactivate(discountId: string) {
    const supabase = createServerSupabase();

    const { data: discount, error } = await supabase
      .from('discount_codes')
      .update({ is_active: false })
      .eq('id', discountId)
      .select('*')
      .single();

    if (error || !discount) throw new Error(error?.message || 'Failed to deactivate discount');
    return discount;
  },
};
