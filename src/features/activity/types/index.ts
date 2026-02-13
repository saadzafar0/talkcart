export type ActivityType =
  | 'view_product'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'search'
  | 'purchase'
  | 'chat';

export interface UserActivity {
  id: string;
  user_id: string;
  session_id: string | null;
  activity_type: ActivityType;
  product_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TrackActivityRequest {
  activity_type: ActivityType;
  product_id?: string;
  metadata?: Record<string, unknown>;
}
