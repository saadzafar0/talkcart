import { AddToCartRequest, CartSummary, CartItemWithProduct } from '../types';
import { createServerSupabase } from '@/lib/supabase/server';

export const cartService = {
  /**
   * Get user's cart with all items and calculated totals
   */
  async getCart(userId: string): Promise<CartSummary> {
    const supabase = createServerSupabase();

    // Get or create cart for user
    const cart = await this.getOrCreateCart(userId);

    // Fetch cart items with product details
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products:product_id (
          id,
          name,
          slug,
          image_url,
          base_price,
          stock_quantity
        )
      `)
      .eq('cart_id', cart.id);

    if (error) {
      throw new Error(`Failed to fetch cart items: ${error.message}`);
    }

    // Transform and calculate totals
    const items: CartItemWithProduct[] = (cartItems || []).map((item: any) => ({
      id: item.id,
      cart_id: item.cart_id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price_at_addition: item.price_at_addition,
      created_at: item.created_at,
      updated_at: item.updated_at,
      product_name: item.products?.name || 'Unknown Product',
      product_image: item.products?.image_url || null,
      product_slug: item.products?.slug || '',
    }));

    const subtotal = items.reduce(
      (sum, item) => sum + item.price_at_addition * item.quantity,
      0
    );

    return {
      items,
      subtotal,
      discount: 0, // Will be calculated when discount code is applied
      total: subtotal,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0)
    };
  },

  /**
   * Add item to cart or update quantity if already exists
   */
  async addItem(userId: string, data: AddToCartRequest): Promise<CartSummary> {
    const supabase = createServerSupabase();
    const { product_id, variant_id, quantity = 1 } = data;

    // Get or create cart
    const cart = await this.getOrCreateCart(userId);

    // Get product details and check stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, base_price, stock_quantity')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    if (product.stock_quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', product_id)
      .eq('variant_id', variant_id || null)
      .single();

    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock_quantity < newQuantity) {
        throw new Error('Insufficient stock for requested quantity');
      }

      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString() 
        })
        .eq('id', existingItem.id);

      if (updateError) {
        throw new Error(`Failed to update cart item: ${updateError.message}`);
      }
    } else {
      // Insert new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id,
          variant_id: variant_id || null,
          quantity,
          price_at_addition: product.base_price
        });

      if (insertError) {
        throw new Error(`Failed to add item to cart: ${insertError.message}`);
      }
    }

    // Return updated cart
    return this.getCart(userId);
  },

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<CartSummary> {
    const supabase = createServerSupabase();

    // Get user's cart
    const cart = await this.getOrCreateCart(userId);

    // Verify item belongs to user's cart and delete
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('cart_id', cart.id);

    if (error) {
      throw new Error(`Failed to remove item: ${error.message}`);
    }

    // Return updated cart
    return this.getCart(userId);
  },

  /**
   * Update item quantity (can be used to increase/decrease)
   */
  async updateQuantity(userId: string, itemId: string, quantity: number): Promise<CartSummary> {
    const supabase = createServerSupabase();

    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    // Get user's cart
    const cart = await this.getOrCreateCart(userId);

    // Get cart item with product details
    const { data: cartItem, error: fetchError } = await supabase
      .from('cart_items')
      .select('*, products:product_id(stock_quantity)')
      .eq('id', itemId)
      .eq('cart_id', cart.id)
      .single();

    if (fetchError || !cartItem) {
      throw new Error('Cart item not found');
    }

    // Check stock
    const stockQty = (cartItem.products as any)?.stock_quantity || 0;
    if (stockQty < quantity) {
      throw new Error('Insufficient stock for requested quantity');
    }

    // Update quantity
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString() 
      })
      .eq('id', itemId);

    if (updateError) {
      throw new Error(`Failed to update quantity: ${updateError.message}`);
    }

    // Return updated cart
    return this.getCart(userId);
  },

  /**
   * Clear all items from cart
   */
  async clearCart(userId: string): Promise<void> {
    const supabase = createServerSupabase();

    // Get user's cart    const cart = await this.getOrCreateCart(userId);

    // Delete all items
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (error) {
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  },

  /**
   * Get or create cart for user (internal helper)
   */
  async getOrCreateCart(userId: string) {
    const supabase = createServerSupabase();

    // Try to get existing cart
    const { data: existingCart } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingCart) {
      return existingCart;
    }

    // Create new cart
    const { data: newCart, error } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select()
      .single();

    if (error || !newCart) {
      throw new Error('Failed to create cart');
    }

    return newCart;
  }
};
