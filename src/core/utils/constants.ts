export const APP_NAME = 'TalkCart';

/** Public API endpoints (no auth required) - use these for store/customer-facing pages */
export const API = {
  categories: '/api/categories',
} as const;

export const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/E5E3D0/423E37?text=No+Image';

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};
