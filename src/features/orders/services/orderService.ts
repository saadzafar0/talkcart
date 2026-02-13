import { createServerSupabase } from '@/lib/supabase/server';
import { CreateOrderRequest, OrderWithItems } from '../types';
import { cartService } from '@/features/cart';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TC-${timestamp}-${random}`;
}

export const orderService = {
  async create(userId: string, data: CreateOrderRequest): Promise<OrderWithItems> {
    const supabase = createServerSupabase();

    // 1. Fetch user's cart
    const cart = await cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // 2. Validate discount code if provided
    let discountCodeId: string | null = null;
    let discountAmount = 0;

    if (data.discount_code) {
      const { data: discount, error: discountError } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', data.discount_code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (discountError || !discount) {
        throw new Error('Invalid discount code');
      }

      if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
        throw new Error('Discount code has expired');
      }

      if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
        throw new Error('Discount code usage limit reached');
      }

      if (
        discount.min_purchase_amount &&
        cart.subtotal < discount.min_purchase_amount
      ) {
        throw new Error(
          `Minimum purchase of $${discount.min_purchase_amount} required for this discount`
        );
      }

      // Product-specific discount check
      if (discount.product_id) {
        const hasProduct = cart.items.some(
          (item) => item.product_id === discount.product_id
        );
        if (!hasProduct) {
          throw new Error('Discount code is not valid for items in your cart');
        }
      }

      // Calculate discount
      discountCodeId = discount.id;
      if (discount.discount_type === 'percentage') {
        discountAmount = cart.subtotal * (discount.discount_value / 100);
        if (
          discount.max_discount_amount &&
          discountAmount > discount.max_discount_amount
        ) {
          discountAmount = discount.max_discount_amount;
        }
      } else {
        discountAmount = discount.discount_value;
      }
      discountAmount = Math.min(
        Math.round(discountAmount * 100) / 100,
        cart.subtotal
      );
    }

    // 3. Save shipping address (address fields only)
    const { data: savedAddress, error: addressError } = await supabase
      .from('user_addresses')
      .insert({
        user_id: userId,
        address_line1: data.shipping_address.address_line1,
        address_line2: data.shipping_address.address_line2 || null,
        city: data.shipping_address.city,
        state: data.shipping_address.state,
        postal_code: data.shipping_address.postal_code,
        country: data.shipping_address.country,
      })
      .select('id')
      .single();

    if (addressError || !savedAddress) {
      throw new Error(addressError?.message || 'Failed to save shipping address');
    }

    // 4. Calculate totals
    const subtotal = cart.subtotal;
    const taxRate = 0.08;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = Math.round(taxableAmount * taxRate * 100) / 100;
    const shippingAmount = data.shipping_method === 'express' ? 15.0 : 5.0;
    const totalAmount =
      Math.round((taxableAmount + taxAmount + shippingAmount) * 100) / 100;

    // 5. Generate order number
    const orderNumber = generateOrderNumber();

    // Store shipping contact info in notes as structured data
    const shippingContact = {
      full_name: data.shipping_address.full_name,
      phone: data.shipping_address.phone,
    };
    const orderNotes = data.notes 
      ? `Contact: ${JSON.stringify(shippingContact)}\nNotes: ${data.notes}`
      : `Contact: ${JSON.stringify(shippingContact)}`;

    // 6. Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        status: 'pending',
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        discount_code_id: discountCodeId,
        shipping_address_id: savedAddress.id,
        shipping_method: data.shipping_method,
        payment_method: data.payment_method,
        payment_status: 'pending',
        notes: orderNotes,
      })
      .select('*')
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || 'Failed to create order');
    }

    // 7. Insert order items (snapshot product names and prices from cart)
    const orderItems = cart.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.price_at_addition,
      subtotal: Math.round(item.price_at_addition * item.quantity * 100) / 100,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select('*');

    if (itemsError) {
      console.error('Failed to insert order items:', itemsError.message);
    }

    // 8. Increment discount code usage
    if (discountCodeId) {
      const { data: currentDiscount } = await supabase
        .from('discount_codes')
        .select('used_count')
        .eq('id', discountCodeId)
        .single();

      if (currentDiscount) {
        await supabase
          .from('discount_codes')
          .update({ used_count: currentDiscount.used_count + 1 })
          .eq('id', discountCodeId);
      }
    }

    // 9. Clear the cart
    await cartService.clearCart(userId);

    return {
      ...order,
      items: insertedItems || [],
    } as OrderWithItems;
  },

  async getById(
    userId: string,
    orderId: string
  ): Promise<OrderWithItems | null> {
    const supabase = createServerSupabase();

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items ( * )')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderData = order as Record<string, any>;

    return {
      ...orderData,
      items: orderData.order_items || [],
    } as OrderWithItems;
  },

  async getAll(userId: string): Promise<OrderWithItems[]> {
    const supabase = createServerSupabase();

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items ( * )')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (orders || []).map((order: Record<string, any>) => ({
      ...order,
      items: order.order_items || [],
    })) as OrderWithItems[];
  },
};
