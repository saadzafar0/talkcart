import { Product, ProductFilters, ProductSearchResult } from '../types';

export const productService = {
  async getAll(filters: ProductFilters): Promise<ProductSearchResult> {
    // TODO: implement - query products from Supabase with filters
    throw new Error('Not implemented');
  },

  async getBySlug(slug: string): Promise<Product | null> {
    // TODO: implement - query single product by slug
    throw new Error('Not implemented');
  },

  async search(query: string): Promise<Product[]> {
    // TODO: implement - RAG semantic search via LangChain
    throw new Error('Not implemented');
  },
};
