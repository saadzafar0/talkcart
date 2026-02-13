interface ToolAction {
  name: string;
  args: Record<string, unknown>;
}

/**
 * Inspects agent tool call actions and builds a /products URL
 * if filter_products or search_products actions are found.
 * Returns null if no navigation-worthy actions exist.
 */
export function buildFilterUrl(actions: ToolAction[]): string | null {
  const params = new URLSearchParams();

  for (const action of actions) {
    if (action.name === 'filter_products') {
      const { category, sort_by, min_price, max_price } = action.args;
      if (category) params.set('category', String(category));
      if (sort_by) params.set('sortBy', String(sort_by));
      if (min_price !== undefined && min_price !== null) params.set('minPrice', String(min_price));
      if (max_price !== undefined && max_price !== null) params.set('maxPrice', String(max_price));
      return `/products?${params.toString()}`;
    }

    if (action.name === 'search_products') {
      const { query } = action.args;
      if (query) params.set('search', String(query));
      return `/products?${params.toString()}`;
    }
  }

  return null;
}
