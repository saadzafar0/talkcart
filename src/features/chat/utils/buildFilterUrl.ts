import { normalizeCategorySlug } from '@/core/utils/categorySlug';

interface ToolAction {
  name: string;
  args: Record<string, unknown>;
}

export interface VibeFilterResult {
  url: string;
  message: string;
}

const SORT_MESSAGES: Record<string, string> = {
  price_asc: 'Showing cheaper options!',
  price_desc: 'Showing premium options!',
  rating: 'Showing top-rated products!',
  newest: 'Showing newest arrivals!',
};

/**
 * Builds a friendly message for the vibe filter based on applied filters.
 */
function buildVibeFilterMessage(params: URLSearchParams): string {
  const sortBy = params.get('sortBy');
  if (sortBy && SORT_MESSAGES[sortBy]) return SORT_MESSAGES[sortBy];

  const search = params.get('search');
  if (search) return `Showing results for "${search}"`;

  const category = params.get('category');
  if (category) {
    const names: Record<string, string> = {
      clothing: 'Clothing',
      fashion: 'Fashion',
      electronics: 'Electronics',
      'home-kitchen': 'Home & Kitchen',
      'home-living': 'Home & Living',
      'sports-outdoors': 'Sports & Outdoors',
      'books-stationery': 'Books & Stationery',
      'beauty-personal-care': 'Beauty & Personal Care',
    };
    return `Showing ${names[category] || category} products`;
  }

  const maxPrice = params.get('maxPrice');
  if (maxPrice) return `Showing products under $${maxPrice}`;

  const minPrice = params.get('minPrice');
  if (minPrice) return `Showing products from $${minPrice}`;

  return 'Filters applied!';
}

/**
 * Inspects agent tool call actions and builds a /products URL + friendly message.
 * Merges filter_products and search_products so both can apply together.
 * Returns null if no navigation-worthy actions exist.
 */
export function buildFilterUrl(actions: ToolAction[]): VibeFilterResult | null {
  const params = new URLSearchParams();
  let shouldNavigate = false;

  for (const action of actions) {
    if (action.name === 'filter_products') {
      shouldNavigate = true;
      const { category, sort_by, min_price, max_price } = action.args;
      const slug = category ? normalizeCategorySlug(String(category)) : null;
      if (slug) params.set('category', slug);
      if (sort_by) params.set('sortBy', String(sort_by));
      if (min_price !== undefined && min_price !== null) params.set('minPrice', String(min_price));
      if (max_price !== undefined && max_price !== null) params.set('maxPrice', String(max_price));
    }

    if (action.name === 'search_products') {
      shouldNavigate = true;
      const { query } = action.args;
      if (query) params.set('search', String(query));
    }
  }

  if (!shouldNavigate) return null;

  const queryString = params.toString();
  const url = queryString ? `/products?${queryString}` : '/products';
  const message = queryString ? buildVibeFilterMessage(params) : 'Showing products!';
  return { url, message };
}
