import { createServerSupabase } from '@/lib/supabase/server';
import type { UserActivity, ActivityType } from '../types';

export const activityService = {
  /**
   * Track a user activity. Fails silently — tracking is non-critical.
   */
  async track(
    userId: string,
    activityType: ActivityType,
    productId?: string | null,
    metadata?: Record<string, unknown> | null
  ): Promise<void> {
    try {
      const supabase = createServerSupabase();
      await supabase.from('user_activities').insert({
        user_id: userId,
        activity_type: activityType,
        product_id: productId || null,
        metadata: metadata || null,
      });
    } catch (error) {
      console.error('Activity tracking failed (non-critical):', error);
    }
  },

  /**
   * Get recent activity for a user, ordered by most recent first.
   */
  async getRecent(userId: string, limit = 50): Promise<UserActivity[]> {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch user activities:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Get recently viewed product IDs (deduplicated).
   */
  async getRecentlyViewedProductIds(userId: string, limit = 20): Promise<string[]> {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('user_activities')
      .select('product_id')
      .eq('user_id', userId)
      .eq('activity_type', 'view_product')
      .not('product_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    const ids = (data || []).map((d) => d.product_id).filter(Boolean) as string[];
    return [...new Set(ids)];
  },

  /**
   * Get activity summary for a user — suitable for feeding to LLM context.
   */
  async getSummary(userId: string): Promise<{
    recentViews: { product_id: string; count: number }[];
    recentSearches: string[];
    recentCartAdds: string[];
    totalActivities: number;
  }> {
    const supabase = createServerSupabase();

    const { data: activities, error } = await supabase
      .from('user_activities')
      .select('activity_type, product_id, metadata')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !activities) {
      return { recentViews: [], recentSearches: [], recentCartAdds: [], totalActivities: 0 };
    }

    const viewCounts = new Map<string, number>();
    const searches: string[] = [];
    const cartAdds: string[] = [];

    for (const a of activities) {
      if (a.activity_type === 'view_product' && a.product_id) {
        viewCounts.set(a.product_id, (viewCounts.get(a.product_id) || 0) + 1);
      }
      if (a.activity_type === 'search' && a.metadata && typeof a.metadata === 'object') {
        const query = (a.metadata as Record<string, unknown>).query;
        if (typeof query === 'string') searches.push(query);
      }
      if (a.activity_type === 'add_to_cart' && a.product_id) {
        cartAdds.push(a.product_id);
      }
    }

    const recentViews = Array.from(viewCounts.entries())
      .map(([product_id, count]) => ({ product_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      recentViews,
      recentSearches: [...new Set(searches)].slice(0, 10),
      recentCartAdds: [...new Set(cartAdds)].slice(0, 10),
      totalActivities: activities.length,
    };
  },
};
