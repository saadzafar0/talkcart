import { createServerSupabase } from '@/lib/supabase/server';
import { generateSlug } from '../utils/slugGenerator';

export const categoryAdminService = {
  async getAll() {
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async create(name: string, description?: string) {
    const supabase = createServerSupabase();
    const slug = generateSlug(name);

    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, description: description || null })
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to create category');
    return data;
  },

  async update(categoryId: string, data: { name?: string; description?: string }) {
    const supabase = createServerSupabase();

    const updateData: Record<string, unknown> = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = generateSlug(data.name);
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select('*')
      .single();

    if (error || !category) throw new Error(error?.message || 'Failed to update category');
    return category;
  },

  async delete(categoryId: string) {
    const supabase = createServerSupabase();

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw new Error(error.message);
  },
};
