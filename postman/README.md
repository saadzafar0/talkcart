# TalkCart Products API - Postman Collection

This collection contains comprehensive test cases for the TalkCart Products API endpoints.

## Import Instructions

1. Open Postman
2. Click **Import** button
3. Select `TalkCart-Products-API.postman_collection.json`
4. The collection will appear in your workspace

## Environment Setup

The collection uses a `baseUrl` variable that defaults to `http://localhost:3000`.

### To change the base URL:

1. Click on the collection name
2. Go to the **Variables** tab
3. Update the `baseUrl` value
4. Save the collection

## API Endpoints

### 1. Products Listing (`GET /api/products`)

**Features:**
- List all active products
- Filter by category, price range
- Text search in name/description
- Sort by: price (asc/desc), rating, newest
- Pagination support

**Test Cases:**
- ✅ Get All Products
- ✅ Get Products with Filters
- ✅ Get Products by Category
- ✅ Sort by Price (Low to High)
- ✅ Sort by Price (High to Low)
- ✅ Sort by Rating
- ✅ Sort by Newest
- ✅ Pagination (Page 2)
- ✅ Text Search
- ⚠️ Invalid Page Number (validation test)
- ⚠️ Invalid Limit (validation test)
- ⚠️ Invalid Price Range (validation test)

### 2. Product Details (`GET /api/products/:slug`)

**Features:**
- Get single product by slug
- Include/exclude variants
- Include/exclude reviews
- Include/exclude related products

**Test Cases:**
- ✅ Get Product by Slug
- ✅ Get Product without Variants
- ✅ Get Product without Reviews
- ✅ Get Product with Related Products
- ✅ Get Product - Minimal Response
- ⚠️ Product Not Found (404 test)

### 3. Product Search (`POST /api/products/search`)

**Features:**
- RAG-based semantic search
- Intelligent product discovery
- Custom result limits

**Test Cases:**
- ✅ Semantic Search - Summer Wedding
- ✅ Semantic Search - Casual Style
- ✅ Semantic Search - Specific Item
- ✅ Semantic Search with Custom Limit
- ⚠️ Missing Query (validation test)
- ⚠️ Empty Query (validation test)
- ⚠️ Query Too Long (validation test)

## Query Parameters Reference

### GET /api/products

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `category` | string | Filter by category slug | `fashion` |
| `minPrice` | number | Minimum price filter | `50` |
| `maxPrice` | number | Maximum price filter | `300` |
| `search` | string | Text search query | `linen` |
| `sortBy` | string | Sort order: `price_asc`, `price_desc`, `rating`, `newest` | `price_asc` |
| `page` | number | Page number (≥1) | `2` |
| `limit` | number | Items per page (1-100) | `20` |

### GET /api/products/:slug

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `includeVariants` | boolean | Include product variants | `true` |
| `includeReviews` | boolean | Include product reviews | `true` |
| `includeRelated` | boolean | Include related products | `false` |

### POST /api/products/search

**Body (JSON):**
```json
{
  "query": "summer wedding outfit",
  "limit": 10
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Search query (1-500 chars) |
| `limit` | number | No | Max results (1-50), default: 10 |

## Response Format

All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Testing Tips

1. **Run All Tests**: Click the collection → **Run** to execute all requests sequentially
2. **Pre-populated Tests**: Each request has automated tests that validate responses
3. **Sample Products**: The collection assumes sample products from `schema.sql` exist:
   - `italian-linen-summer-suit`
   - `aviator-sunglasses-gold`

## Sample Test Scenarios

### Scenario 1: Browse Products by Category
```
1. GET /api/products?category=fashion
2. GET /api/products?category=fashion&sortBy=price_asc
3. GET /api/products/italian-linen-summer-suit
```

### Scenario 2: Price Range Filter
```
1. GET /api/products?minPrice=50&maxPrice=300
2. GET /api/products?minPrice=50&maxPrice=300&sortBy=rating
```

### Scenario 3: Smart Search (RAG)
```
1. POST /api/products/search
   Body: { "query": "outfit for summer wedding in Italy" }
2. GET /api/products/italian-linen-summer-suit?includeRelated=true
```

## Prerequisites

Before testing, ensure:
- ✅ Next.js server is running (`npm run dev`)
- ✅ Supabase is configured (`.env.local` file)
- ✅ Database tables are created (`schema.sql`)
- ✅ Sample products are inserted

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### 500 Internal Server Error
- Check that Supabase is configured correctly
- Verify environment variables are set
- Check server logs for detailed error messages

### 404 Product Not Found
- Verify product slug exists in database
- Check that product `is_active = true`

### Empty Results
- Verify sample data is inserted in database
- Check category slugs match database values
- Ensure products are set to active

## Next Steps

After testing the Products API:
1. Test Cart API endpoints
2. Test Chat/AI Clerk endpoints
3. Test Haggle/Negotiation endpoints
4. Test Checkout & Orders endpoints

## Support

For issues or questions:
- Check the technical documentation in `/docs/techdoc.txt`
- Review the schema in `/docs/schema.txt`
- Check API route implementations in `/src/app/api/products/`
