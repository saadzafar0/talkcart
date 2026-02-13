import { createServerSupabase } from '@/lib/supabase/server';
import { generateSlug } from '../utils/slugGenerator';
import { embedProduct } from '../utils/embedProduct';
import {
  CreateProductRequest,
  UpdateProductRequest,
  CreateVariantRequest,
  AdminProductFilters,
} from '../types';

export const productAdminService = {
  async getAll(filters: AdminProductFilters = {}) {
    const supabase = createServerSupabase();
    const { page = 1, limit = 20, category_id, is_active, search } = filters;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*, categories ( name )', { count: 'exact' });

    if (category_id) {
      query = query.eq('category_id', category_id);
    }
    if (typeof is_active === 'boolean') {
      query = query.eq('is_active', is_active);
    }
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      products: data || [],
      total: count || 0,
      page,
      limit,
    };
  },

  async getById(productId: string) {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('products')
      .select('*, categories ( name ), product_variants ( * )')
      .eq('id', productId)
      .single();

    if (error || !data) throw new Error('Product not found');

    return data;
  },

  async create(data: CreateProductRequest) {
    const supabase = createServerSupabase();
    const slug = generateSlug(data.name);

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: data.name,
        slug,
        description: data.description,
        category_id: data.category_id,
        base_price: data.base_price,
        minimum_price: data.minimum_price,
        cost_price: data.cost_price,
        image_url: data.image_url || null,
        images: data.images || null,
        stock_quantity: data.stock_quantity,
        metadata: data.metadata || null,
      })
      .select('*')
      .single();

    if (error || !product) throw new Error(error?.message || 'Failed to create product');

    // Auto-generate embedding
    try {
      await embedProduct(product.id);
    } catch (err) {
      console.error('Auto-embed failed (product still created):', err);
    }

    return product;
  },

  async update(productId: string, data: UpdateProductRequest) {
    const supabase = createServerSupabase();

    const updateData: Record<string, unknown> = { ...data };
    if (data.name) {
      updateData.slug = generateSlug(data.name);
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select('*')
      .single();

    if (error || !product) throw new Error(error?.message || 'Failed to update product');

    // Re-embed if content fields changed
    if (data.name || data.description || data.metadata) {
      try {
        await embedProduct(product.id);
      } catch (err) {
        console.error('Re-embed failed (product still updated):', err);
      }
    }

    return product;
  },

  async delete(productId: string) {
    const supabase = createServerSupabase();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw new Error(error.message);
  },

  // --- Variants ---

  async getVariants(productId: string) {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async createVariant(data: CreateVariantRequest) {
    const supabase = createServerSupabase();

    const { data: variant, error } = await supabase
      .from('product_variants')
      .insert({
        product_id: data.product_id,
        sku: data.sku,
        color: data.color || null,
        size: data.size || null,
        stock_quantity: data.stock_quantity,
        price_adjustment: data.price_adjustment || 0,
        image_url: data.image_url || null,
      })
      .select('*')
      .single();

    if (error || !variant) throw new Error(error?.message || 'Failed to create variant');
    return variant;
  },

  async updateVariant(variantId: string, data: Partial<CreateVariantRequest>) {
    const supabase = createServerSupabase();

    const { data: variant, error } = await supabase
      .from('product_variants')
      .update(data)
      .eq('id', variantId)
      .select('*')
      .single();

    if (error || !variant) throw new Error(error?.message || 'Failed to update variant');
    return variant;
  },

  async deleteVariant(variantId: string) {
    const supabase = createServerSupabase();

    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', variantId);

    if (error) throw new Error(error.message);
  },
};
