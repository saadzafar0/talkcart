export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price_at_addition: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct extends CartItem {
  product_name: string;
  product_image: string | null;
  product_slug: string;
}

export interface AddToCartRequest {
  product_id: string;
  variant_id?: string;
  quantity?: number;
}

export interface CartSummary {
  items: CartItemWithProduct[];
  subtotal: number;
  discount: number;
  total: number;
  item_count: number;
}
