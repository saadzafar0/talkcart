import { createServerSupabase } from '@/lib/supabase/server';
import { AddToCartRequest, CartSummary, CartItemWithProduct } from '../types';

async function getOrCreateCart(userId: string): Promise<string> {
  const supabase = createServerSupabase();

  const { data: existing } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (error || !created) {
    throw new Error('Failed to create cart');
  }

  return created.id;
}

async function buildCartSummary(cartId: string): Promise<CartSummary> {
  const supabase = createServerSupabase();

  const { data: items, error } = await supabase
    .from('cart_items')
    .select('*, products ( name, image_url, slug )')
    .eq('cart_id', cartId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch cart items: ${error.message}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cartItems: CartItemWithProduct[] = (items || []).map((item: any) => {
    const product = item.products as { name: string; image_url: string | null; slug: string } | null;
    return {
      id: item.id,
      cart_id: item.cart_id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price_at_addition: item.price_at_addition,
      created_at: item.created_at,
      updated_at: item.updated_at,
      product_name: product?.name || 'Unknown Product',
      product_image: product?.image_url || null,
      product_slug: product?.slug || '',
    };
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price_at_addition * item.quantity,
    0
  );

  return {
    items: cartItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: 0,
    total: Math.round(subtotal * 100) / 100,
    item_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export const cartService = {
  async getCart(userId: string): Promise<CartSummary> {
    const cartId = await getOrCreateCart(userId);
    return buildCartSummary(cartId);
  },

  async addItem(userId: string, data: AddToCartRequest): Promise<CartSummary> {
    const supabase = createServerSupabase();
    const quantity = data.quantity || 1;

    // Verify product exists and is active
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, base_price, stock_quantity, is_active')
      .eq('id', data.product_id)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }
    if (!product.is_active) {
      throw new Error('Product is not available');
    }

    // Determine price and available stock
    let price = product.base_price;
    let availableStock = product.stock_quantity;

    if (data.variant_id) {
      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('id, price_adjustment, stock_quantity, is_active')
        .eq('id', data.variant_id)
        .eq('product_id', data.product_id)
        .single();

      if (variantError || !variant) {
        throw new Error('Product variant not found');
      }
      if (!variant.is_active) {
        throw new Error('Product variant is not available');
      }

      price = product.base_price + (variant.price_adjustment || 0);
      availableStock = variant.stock_quantity;
    }

    if (availableStock < quantity) {
      throw new Error(`Insufficient stock. Only ${availableStock} available.`);
    }

    const cartId = await getOrCreateCart(userId);

    // Check if item already exists in cart (same product + variant)
    let existingQuery = supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', data.product_id);

    if (data.variant_id) {
      existingQuery = existingQuery.eq('variant_id', data.variant_id);
    } else {
      existingQuery = existingQuery.is('variant_id', null);
    }

    const { data: existingItem } = await existingQuery.single();

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > availableStock) {
        throw new Error(
          `Cannot add ${quantity} more. Only ${availableStock - existingItem.quantity} more available.`
        );
      }

      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity, price_at_addition: price })
        .eq('id', existingItem.id);

      if (updateError) {
        throw new Error(`Failed to update cart item: ${updateError.message}`);
      }
    } else {
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: data.product_id,
          variant_id: data.variant_id || null,
          quantity,
          price_at_addition: price,
        });

      if (insertError) {
        throw new Error(`Failed to add item to cart: ${insertError.message}`);
      }
    }

    return buildCartSummary(cartId);
  },

  async removeItem(userId: string, itemId: string): Promise<CartSummary> {
    const supabase = createServerSupabase();
    const cartId = await getOrCreateCart(userId);

    const { data: item } = await supabase
      .from('cart_items')
      .select('id')
      .eq('id', itemId)
      .eq('cart_id', cartId)
      .single();

    if (!item) {
      throw new Error('Cart item not found');
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw new Error(`Failed to remove item: ${error.message}`);
    }

    return buildCartSummary(cartId);
  },

  async updateQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<CartSummary> {
    const supabase = createServerSupabase();

    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    const cartId = await getOrCreateCart(userId);

    // Get the cart item and verify ownership
    const { data: item } = await supabase
      .from('cart_items')
      .select('id, product_id, variant_id')
      .eq('id', itemId)
      .eq('cart_id', cartId)
      .single();

    if (!item) {
      throw new Error('Cart item not found');
    }

    // Check stock for the new quantity
    if (item.variant_id) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', item.variant_id)
        .single();

      if (variant && quantity > variant.stock_quantity) {
        throw new Error(
          `Insufficient stock. Only ${variant.stock_quantity} available.`
        );
      }
    } else {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (product && quantity > product.stock_quantity) {
        throw new Error(
          `Insufficient stock. Only ${product.stock_quantity} available.`
        );
      }
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) {
      throw new Error(`Failed to update quantity: ${error.message}`);
    }

    return buildCartSummary(cartId);
  },

  async clearCart(userId: string): Promise<void> {
    const supabase = createServerSupabase();

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!cart) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (error) {
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  },
};
