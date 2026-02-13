export interface AdminDashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  orders_today: number;
  revenue_today: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  category_id: string;
  base_price: number;
  minimum_price: number;
  cost_price: number;
  image_url?: string;
  images?: string[];
  stock_quantity: number;
  metadata?: Record<string, unknown>;
}

export type UpdateProductRequest = Partial<CreateProductRequest> & {
  is_active?: boolean;
};

export interface CreateVariantRequest {
  product_id: string;
  sku: string;
  color?: string;
  size?: string;
  stock_quantity: number;
  price_adjustment?: number;
  image_url?: string;
}

export interface CreateDiscountRequest {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  product_id?: string;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  expires_at?: string;
}

export interface OrderUpdateRequest {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  product_id: string;
  name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface HaggleStats {
  total_sessions: number;
  acceptance_rate: number;
  average_discount: number;
}

export interface AdminProductFilters {
  category_id?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrderFilters {
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
