import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { activityService } from '@/features/activity';

export const getUserActivityTool = new DynamicStructuredTool({
  name: 'get_user_activity',
  description:
    "Get a summary of the current user's browsing activity including recently viewed products, search queries, and cart additions. Use this to understand what the customer has been looking at and personalize recommendations. Requires a user_id.",
  schema: z.object({
    user_id: z.string().describe('The authenticated user ID'),
  }),
  func: async ({ user_id }) => {
    try {
      if (!user_id) {
        return JSON.stringify({
          error: 'User must be logged in to get activity data.',
        });
      }

      const summary = await activityService.getSummary(user_id);

      if (summary.totalActivities === 0) {
        return JSON.stringify({
          has_activity: false,
          message: 'No browsing history found for this user.',
        });
      }

      return JSON.stringify({
        has_activity: true,
        total_activities: summary.totalActivities,
        recently_viewed_products: summary.recentViews,
        recent_searches: summary.recentSearches,
        recent_cart_adds: summary.recentCartAdds,
      });
    } catch (error: unknown) {
      console.error('Get user activity tool error:', error);
      return JSON.stringify({
        error: 'Failed to retrieve user activity.',
      });
    }
  },
});
