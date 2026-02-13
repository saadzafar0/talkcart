/**
 * Canonical category slugs (must match database).
 * Includes both seed categories and schema categories for compatibility.
 */
export const CATEGORY_SLUGS = [
  'electronics',
  'clothing',
  'fashion',           // schema.txt
  'home-kitchen',
  'home-living',       // schema.txt
  'sports-outdoors',
  'books-stationery',
  'beauty-personal-care',
] as const;

/** Map common user input / display names to canonical slugs */
const CATEGORY_ALIASES: Record<string, string> = {
  // Clothing / Fashion (both exist in different setups)
  clothing: 'clothing',
  clothes: 'clothing',
  apparel: 'clothing',
  fashion: 'fashion',
  // Electronics
  electronics: 'electronics',
  tech: 'electronics',
  gadgets: 'electronics',
  // Home & Kitchen / Home & Living
  'home-kitchen': 'home-kitchen',
  'home-living': 'home-living',
  'home & living': 'home-living',
  home: 'home-kitchen',
  kitchen: 'home-kitchen',
  living: 'home-living',
  'home & kitchen': 'home-kitchen',
  // Sports & Outdoors
  'sports-outdoors': 'sports-outdoors',
  sports: 'sports-outdoors',
  outdoors: 'sports-outdoors',
  fitness: 'sports-outdoors',
  'sports & outdoors': 'sports-outdoors',
  // Books & Stationery
  'books-stationery': 'books-stationery',
  books: 'books-stationery',
  stationery: 'books-stationery',
  'books & stationery': 'books-stationery',
  // Beauty & Personal Care
  'beauty-personal-care': 'beauty-personal-care',
  beauty: 'beauty-personal-care',
  'personal care': 'beauty-personal-care',
  skincare: 'beauty-personal-care',
  haircare: 'beauty-personal-care',
  'beauty & personal care': 'beauty-personal-care',
};

/**
 * Normalize user input (e.g. "clothes", "Clothing") to canonical category slug.
 * Returns the slug if found, otherwise null.
 */
export function normalizeCategorySlug(input: string | undefined | null): string | null {
  if (!input || typeof input !== 'string') return null;
  const normalized = input.trim().toLowerCase();
  if (!normalized) return null;
  return CATEGORY_ALIASES[normalized] ?? (CATEGORY_SLUGS.includes(normalized as typeof CATEGORY_SLUGS[number]) ? normalized : null);
}
