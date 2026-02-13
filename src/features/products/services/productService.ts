import { createServerSupabase } from '@/lib/supabase/server';
import { Product, ProductFilters, ProductSearchResult } from '../types';

export const productService = {
  /**
   * Get all products with optional filters, sorting, and pagination
   */
  async getAll(filters: ProductFilters = {}): Promise<ProductSearchResult> {
    const supabase = createServerSupabase();
    
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'newest',
      page = 1,
      limit = 20,
    } = filters;

    // Build query
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (category) {
      // Get category by slug
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }

    if (minPrice !== undefined) {
      query = query.gte('base_price', minPrice);
    }

    if (maxPrice !== undefined) {
      query = query.lte('base_price', maxPrice);
    }

    if (search) {
      // Basic text search (for non-RAG queries)
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        query = query.order('base_price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('base_price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return {
      products: (data as Product[]) || [],
      total: count || 0,
      page,
      limit,
    };
  },

  /**
   * Get a single product by slug with full details
   */
  async getBySlug(slug: string): Promise<Product | null> {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data as Product;
  },

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<Product | null> {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data as Product;
  },

  /**
   * Get product variants for a product
   */
  async getVariants(productId: string) {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch variants: ${error.message}`);
    }

    return data;
  },

  /**
   * Get product reviews
   */
  async getReviews(productId: string, limit = 10) {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('product_reviews')
      .select('*, users(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }

    return data;
  },

  /**
   * RAG semantic search using vector embeddings
   * Falls back to text search if embedding generation fails
   */
  async search(query: string, limit = 10): Promise<Product[]> {
    const supabase = createServerSupabase();

    try {
      // Step 1: Generate embedding for the query
      const { embeddingService } = await import(
        '@/langchain/embeddings/embeddingService'
      );
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // Step 2: Vector similarity search via Supabase RPC
      const { data: matches, error: rpcError } = await supabase.rpc(
        'search_products_by_embedding',
        {
          query_embedding: `[${queryEmbedding.join(',')}]`,
          match_threshold: 0.7,
          match_count: limit,
        }
      );

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      if (!matches || matches.length === 0) {
        return [];
      }

      // Step 3: Fetch full product details for matched IDs
      const productIds = matches.map(
        (m: { product_id: string }) => m.product_id
      );

      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)
        .eq('is_active', true);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Preserve similarity-based ordering from the RPC
      const productMap = new Map(
        (products || []).map((p) => [p.id, p])
      );
      return productIds
        .map((id: string) => productMap.get(id))
        .filter((p: Product | undefined): p is Product => !!p);
    } catch (error) {
      // Fallback to basic text search if vector search fails
      console.error('Vector search failed, falling back to text search:', error);

      const { data, error: textError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(
          `name.ilike.%${query}%,description.ilike.%${query}%,metadata::text.ilike.%${query}%`
        )
        .limit(limit);

      if (textError) {
        throw new Error(`Failed to search products: ${textError.message}`);
      }

      return (data as Product[]) || [];
    }
  },

  /**
   * Check product stock availability
   */
  async checkStock(productId: string, variantId?: string): Promise<number> {
    const supabase = createServerSupabase();

    if (variantId) {
      const { data, error } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', variantId)
        .single();

      if (error) {
        throw new Error(`Failed to check variant stock: ${error.message}`);
      }

      return data?.stock_quantity || 0;
    }

    const { data, error } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single();

    if (error) {
      throw new Error(`Failed to check stock: ${error.message}`);
    }

    return data?.stock_quantity || 0;
  },

  /**
   * Get related products based on category
   */
  async getRelated(productId: string, limit = 4): Promise<Product[]> {
    const supabase = createServerSupabase();

    // First get the product's category
    const { data: product } = await supabase
      .from('products')
      .select('category_id')
      .eq('id', productId)
      .single();

    if (!product?.category_id) {
      return [];
    }

    // Get products in same category, excluding current product
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', product.category_id)
      .eq('is_active', true)
      .neq('id', productId)
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch related products: ${error.message}`);
    }

    return (data as Product[]) || [];
  },
};
