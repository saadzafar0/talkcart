import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body as { code?: string };

    if (!code || typeof code !== 'string') {
      return errorResponse('Discount code is required', 400);
    }

    const supabase = createServerSupabase();

    const { data: discount, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !discount) {
      return errorResponse('Invalid or expired discount code', 404);
    }

    // Check expiry
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return errorResponse('This discount code has expired', 410);
    }

    // Check usage limit
    if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
      return errorResponse('This discount code has reached its usage limit', 410);
    }

    return successResponse({
      code: discount.code,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      min_purchase_amount: discount.min_purchase_amount,
      max_discount_amount: discount.max_discount_amount,
      product_id: discount.product_id,
    });
  } catch {
    return errorResponse('Failed to validate discount code', 500);
  }
}
