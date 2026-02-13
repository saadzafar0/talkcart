import { successResponse, errorResponse } from '@/lib/api/response';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description')
      .order('name');

    if (error) throw error;
    return successResponse(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch categories';
    return errorResponse(message, 500);
  }
}
