export type HaggleStatus = 'negotiating' | 'accepted' | 'rejected';
export type DiscountType = 'percentage' | 'fixed';

export interface HaggleSession {
  id: string;
  user_id: string | null;
  session_id: string | null;
  product_id: string;
  original_price: number;
  offered_price: number | null;
  final_price: number | null;
  reason: string | null;
  sentiment_score: number | null;
  discount_code_id: string | null;
  status: HaggleStatus;
  created_at: string;
  updated_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  user_id: string | null;
  product_id: string | null;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface HaggleRequest {
  product_id: string;
  message: string;
  session_id?: string;
}

export interface HaggleResponse {
  message: string;
  session: HaggleSession;
  discount_code?: DiscountCode;
}
