import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';

export const applyDiscountTool = new DynamicStructuredTool({
  name: 'apply_discount',
  description:
    'Validate and apply a discount code. Use this when the customer mentions a promo code or coupon.',
  schema: z.object({
    code: z.string().describe('The discount code to validate and apply'),
  }),
  func: async ({ code }) => {
    try {
      const supabase = createServerSupabase();

      const { data: discount, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !discount) {
        return JSON.stringify({
          valid: false,
          message: `The code "${code}" is not valid or has expired.`,
        });
      }

      // Check expiry
      if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
        return JSON.stringify({
          valid: false,
          message: `The code "${code}" has expired.`,
        });
      }

      // Check usage limit
      if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
        return JSON.stringify({
          valid: false,
          message: `The code "${code}" has reached its usage limit.`,
        });
      }

      return JSON.stringify({
        valid: true,
        code: discount.code,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        min_purchase_amount: discount.min_purchase_amount,
        max_discount_amount: discount.max_discount_amount,
        message: `Code "${discount.code}" is valid! ${
          discount.discount_type === 'percentage'
            ? `${discount.discount_value}% off`
            : `$${discount.discount_value} off`
        }`,
      });
    } catch (error) {
      console.error('Apply discount tool error:', error);
      return JSON.stringify({
        valid: false,
        message: 'Failed to validate discount code.',
      });
    }
  },
});
