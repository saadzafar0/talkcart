# TalkCart API - Postman Collections

This folder contains comprehensive test collections for the TalkCart API endpoints.

## 📦 Available Collections

1. **TalkCart-Products-API.postman_collection.json** - Product catalog endpoints
2. **TalkCart-Cart-API.postman_collection.json** - Shopping cart endpoints
3. **TalkCart-Chat-API.postman_collection.json** - AI Chat assistant endpoints (NEW!)

## Import Instructions

1. Open Postman
2. Click **Import** button
3. Select the collection JSON file(s) you want to import
4. The collection(s) will appear in your workspace

## Environment Setup

All collections use variables that can be configured:

### Collection Variables:
- `baseUrl` - API base URL (default: `http://localhost:3000`)
- `authToken` - JWT authentication token (auto-populated after login)
- `sessionId` - Chat session ID (auto-populated)
- `testProductId` - Sample product ID for testing (auto-populated)
- `testItemId` - Sample cart item ID for testing (auto-populated)

### To change variables:

1. Click on the collection name
2. Go to the **Variables** tab
3. Update the values as needed
4. Save the collection

---

## 🤖 Chat API Collection (NEW!)

### Overview
The Chat API powers TalkCart's AI Shopping Assistant - "The Clerk". This AI can help customers find products, check inventory, add items to cart, negotiate prices, and complete purchases through natural conversation.

### Key Features
- 💬 Natural language product search
- 🛍️ Conversational shopping assistance
- 📦 Stock checking and availability
- 🛒 Add to cart without clicking buttons
- 💰 Price negotiation (Haggle Mode)
- 📝 Conversation history tracking
- 👤 Works for both authenticated and anonymous users

### API Endpoints

#### 1. Send Message (`POST /api/chat`)

Chat with the AI shopping assistant. Send messages and get intelligent responses.

**Request Body:**
```json
{
  "message": "I'm looking for a summer wedding outfit",
  "session_id": "optional-existing-session-id"
}
```

**Authentication:** Optional (works for anonymous users, but auth enables cart features)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "uuid",
      "chat_session_id": "uuid",
      "role": "assistant",
      "content": "AI response text...",
      "function_calls": null,
      "created_at": "timestamp"
    },
    "actions": []
  }
}
```

**What the AI can do:**
- 🔍 **Search Products**: "Show me summer dresses"
- 📋 **Check Stock**: "Do you have this in blue?"
- 🛒 **Add to Cart**: "Add the linen suit to my cart" (requires auth)
- 💰 **Negotiate**: "Can you give me a discount?"
- ℹ️ **Product Info**: "Tell me more about the Italian suit"
- 🎯 **Recommendations**: "What should I wear to a beach wedding?"

**Test Cases:**
- ✅ First message (creates session)
- ✅ Continue conversation (with session_id)
- ✅ Product search requests
- ✅ Stock availability questions
- ✅ Add to cart requests (authenticated)
- ✅ Price negotiation attempts
- ✅ General product inquiries

---

#### 2. Get Chat History (`GET /api/chat/history`)

Retrieve the complete conversation history for a chat session.

**Query Parameters:**
- `session_id` (required): The chat session UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "chat_session_id": "uuid",
        "role": "user",
        "content": "User message...",
        "function_calls": null,
        "created_at": "timestamp"
      },
      {
        "id": "uuid",
        "chat_session_id": "uuid",
        "role": "assistant",
        "content": "AI response...",
        "function_calls": [...],
        "created_at": "timestamp"
      }
    ]
  }
}
```

**Test Cases:**
- ✅ Get history for existing session
- ✅ Verify message order (chronological)
- ✅ Validate message structure
- ⚠️ Missing session_id error

---

### 🎭 The AI Clerk Personality

The AI assistant has a unique personality:
- **Warm & Friendly**: Uses emojis and conversational language
- **Helpful**: Proactively suggests products and asks clarifying questions
- **Knowledgeable**: Understands fashion, style, and product details
- **Empowered**: Can check stock, add to cart, and negotiate prices
- **Professional**: Maintains boundaries and store policies

### 🔄 Chat Workflow

**Complete test workflow included in collection:**

1. **Start Conversation** → "Hi! What do you have for summer?"
2. **Get Recommendations** → "Show me something stylish for a wedding"
3. **Check Stock** → "Do you have this in size M?"
4. **Try to Haggle** → "Can you give me a discount? I'm buying two!"
5. **Get History** → Retrieve full conversation

Run the "Test Workflow" folder in Collection Runner for automated testing.

---

### 💰 Haggle Mode

The AI can negotiate prices! Examples:

**Good approaches (may get discount):**
```
"Can you give me a discount? It's my birthday! 🎂"
"I'm buying multiple items, any deals available?"
"I've been a loyal customer, can you help me out?"
```

**Poor approaches (may backfire):**
```
"Give me 50% off or I'm leaving!" (rude)
"This is too expensive!" (no reason)
"I'll pay $10 for this $300 item" (unrealistic)
```

**In full implementation:**
- AI analyzes sentiment (polite vs. rude)
- Calculates fair discount based on reason
- Has a "bottom price" it won't go below
- Generates unique coupon codes (e.g., "BDAY-20")
- Can raise prices if customer is rude!

---

### 📚 Example Conversations

#### Example 1: Product Search
```
User: "I need an outfit for a summer wedding in Italy"
AI: "Perfect! For a summer wedding in Italy, I'd recommend our 
     Italian Linen Summer Suit - it's lightweight, breathable, 
     and absolutely stunning! Would you like to see it?"
```

#### Example 2: Stock Check
```
User: "Do you have the linen suit in blue?"
AI: "Let me check that for you! The Italian Linen Summer Suit 
     is currently available in Beige and Light Gray. We don't 
     have it in blue at the moment. Would either of these colors 
     work for you?"
```

#### Example 3: Add to Cart
```
User: "I'll take the suit in size 42!"
AI: "Excellent choice! I've added the Italian Linen Summer Suit 
     (Size 42) to your cart. That's $299.99. Would you like to 
     add anything else, or proceed to checkout?"
```

---

### 🔧 Implementation Notes

**Current Implementation:**
- ✅ Database storage for chat sessions/messages
- ✅ Basic Gemini AI integration
- ✅ Conversation context (last 5 messages)
- ✅ Personality system prompt
- ✅ Works for authenticated & anonymous users

**Coming Soon (with full LangChain):**
- 🔄 Real tool calling (search_products, add_to_cart, etc.)
- 🔄 RAG semantic search integration
- 🔄 Sentiment analysis for haggling
- 🔄 Automatic coupon code generation
- 🔄 UI actions triggering (vibe filter)

---

## 🛍️ Cart API Collection

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
