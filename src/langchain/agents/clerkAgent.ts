import { StructuredToolInterface } from '@langchain/core/tools';
import {
  BaseMessage,
  HumanMessage,
  AIMessage,
  SystemMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { createGeminiLLM } from '../config/geminiConfig';
import { CLERK_SYSTEM_PROMPT } from '../prompts/clerkPersonality';
import { allTools } from '../tools';

const MAX_ITERATIONS = 5;

/** UUID pattern for product IDs that should never appear in user-facing text */
const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/**
 * Sanitize the agent's final output before it reaches the user.
 * Strips internal data that the model may have leaked.
 */
function sanitizeAgentOutput(text: string): string {
  return text
    // Strip UUIDs (product IDs the model shouldn't show)
    .replace(/\(ID:\s*[0-9a-f-]{36}\)/gi, '')
    .replace(/\bID:\s*[0-9a-f-]{36}\b/gi, '')
    .replace(UUID_PATTERN, '')
    // Strip any HAGGLE codes or placeholders
    .replace(/HAGGLE-[A-Z0-9]{4,8}/gi, (match) => {
      // Keep the code only if it's a real new code (will be validated downstream)
      // But since we can't tell here, let it through — the structured discountCode field is the source of truth
      return match;
    })
    .replace(/\[DISCOUNT-ALREADY-APPLIED\]/gi, '')
    // Strip other internal markers
    .replace(/\[User ID:[^\]]*\]/gi, '')
    .replace(/\[Recently shown products:[^\]]*\]/gi, '')
    // Clean up extra whitespace from removals
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,!?])/g, '$1')
    .trim();
}

const PRODUCT_TOOLS = ['get_recommendations', 'search_products', 'filter_products'] as const;

/** Tools that accept a user_id parameter */
const USER_ID_TOOLS = new Set([
  'add_to_cart',
  'get_cart',
  'get_recommendations',
  'get_user_activity',
  'haggle_price',
  'remove_from_cart',
  'update_cart_quantity',
  'get_order_history',
]);

function extractProductsFromToolResult(
  toolName: string,
  result: string
): Array<{ id: string; name: string; slug: string; base_price: number; image_url?: string | null; rating?: number; review_count?: number; stock_quantity?: number }> {
  if (!PRODUCT_TOOLS.includes(toolName as (typeof PRODUCT_TOOLS)[number])) return [];
  try {
    const parsed = JSON.parse(result) as { products?: Array<{ id?: string; name?: string; slug?: string; price?: number; base_price?: number; image?: string | null; image_url?: string | null; rating?: number; review_count?: number; stock_quantity?: number }> };
    const products = parsed?.products;
    if (!Array.isArray(products) || products.length === 0) return [];
    return products.map((p) => ({
      id: String(p.id ?? ''),
      name: String(p.name ?? ''),
      slug: String(p.slug ?? ''),
      base_price: Number(p.base_price ?? p.price ?? 0),
      image_url: p.image_url ?? p.image ?? null,
      rating: p.rating,
      review_count: p.review_count,
      stock_quantity: p.stock_quantity,
    })).filter((p) => p.id);
  } catch {
    return [];
  }
}

export interface ClerkAgentResult {
  output: string;
  toolCalls: { name: string; args: Record<string, unknown> }[];
  products?: Array<{
    id: string;
    name: string;
    slug: string;
    base_price: number;
    image_url?: string | null;
    rating?: number;
    review_count?: number;
    stock_quantity?: number;
  }>;
  discountCode?: string;
}

/**
 * Lightweight intent classifier. Detects high-confidence intents from the
 * user's message using keyword matching and injects a hint so the LLM
 * picks the correct tool. Returns null for ambiguous messages.
 */
function classifyIntent(message: string): string | null {
  const lower = message.toLowerCase().trim();

  // Greetings — just respond naturally, do NOT call any tools
  if (/^(h(i|ello|ey|lo|ola)|yo|sup|good (morning|afternoon|evening)|what'?s up|howdy|greetings|hlo|hii+)\b/i.test(lower) && lower.length < 30) {
    return '[INTENT: This is a greeting. Respond with a friendly greeting. Do NOT call any tools or search for products.]';
  }

  // Confirmations — user is agreeing to something you offered. Re-read your last message.
  if (/^(ok|okay|yes|yeah|yep|sure|go ahead|do it|please do|yes please|ok do it|alright|go for it|yea)\b/i.test(lower) && lower.length < 40) {
    return '[INTENT: User is confirming/agreeing to YOUR LAST offer. Re-read your previous message carefully and do exactly what you offered. Do NOT default to filtering products or adding to cart.]';
  }

  // Cart queries — must NOT trigger product search
  if (/\b(what'?s in my cart|show my cart|my cart items|cart contents|view cart|see my cart)\b/.test(lower)) {
    return '[INTENT: Use get_cart tool ONLY. Do NOT search or filter products.]';
  }

  // Checkout
  if (/\b(checkout|check out|proceed to checkout|complete (my )?purchase|place (my )?order)\b/.test(lower)) {
    return '[INTENT: Use go_to_checkout tool.]';
  }

  // Order history
  if (/\b(my orders|order history|what did i (buy|order)|past (orders|purchases)|show my orders)\b/.test(lower)) {
    return '[INTENT: Use get_order_history tool.]';
  }

  // Remove from cart
  if (/\b(remove|delete|take out).*(cart|from cart)\b/.test(lower) || /\bcart.*(remove|delete)\b/.test(lower)) {
    return '[INTENT: Use get_cart first, then remove_from_cart.]';
  }

  // Haggle — only when explicitly asking for discount/deal
  if (/\b(haggle|negotiate|give me a (deal|discount)|can i get a discount|make me a deal|lower the price)\b/.test(lower)) {
    return '[INTENT: User wants to haggle. Use haggle_price if they specify a product.]';
  }

  return null;
}

/**
 * Main clerk agent — handles general shopping conversations.
 * Uses Gemini LLM with tool calling (bindTools) for search, cart, stock,
 * discounts, and haggling. Implements a manual agentic loop.
 */
export async function clerkAgent(
  message: string,
  context?: {
    chatHistory?: BaseMessage[];
    userId?: string | null;
    lastShownProducts?: Array<{ id: string; name: string }>;
  }
): Promise<ClerkAgentResult> {
  const llm = createGeminiLLM(0.3);
  const llmWithTools = llm.bindTools(allTools);
  const toolsByName = new Map<string, StructuredToolInterface>(allTools.map((t) => [t.name, t]));

  const collectedToolCalls: { name: string; args: Record<string, unknown> }[] = [];
  let lastProducts: ClerkAgentResult['products'] = [];
  let haggleDiscountCode: string | undefined;

  // Build message history
  const messages: BaseMessage[] = [
    new SystemMessage(CLERK_SYSTEM_PROMPT),
    ...(context?.chatHistory || []),
  ];

  // Build context prefix for the human message
  const contextParts: string[] = [];
  if (context?.userId) {
    contextParts.push(`[User ID: ${context.userId}]`);
  }
  if (context?.lastShownProducts && context.lastShownProducts.length > 0) {
    const productList = context.lastShownProducts
      .map((p, i) => `${i + 1}. ${p.name} (ID: ${p.id})`)
      .join(', ');
    contextParts.push(`[Recently shown products: ${productList}]`);
  }

  // Intent classifier: inject a strong hint for high-confidence intents
  const intentHint = classifyIntent(message);
  if (intentHint) {
    contextParts.push(intentHint);
  }

  const enrichedInput = contextParts.length > 0
    ? `${contextParts.join(' ')} ${message}`
    : message;

  messages.push(new HumanMessage(enrichedInput));

  // Agentic tool-calling loop
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let response;
    try {
      response = await llmWithTools.invoke(messages);
    } catch (err: unknown) {
      console.error('LLM invocation failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      // If this is the first iteration, we have no prior output to fall back on
      if (i === 0) {
        return {
          output: "I'm sorry, I'm having trouble right now. Could you try again?",
          toolCalls: collectedToolCalls,
        };
      }
      // Otherwise, return whatever we have so far
      break;
    }
    messages.push(response);

    // Check if the model made tool calls
    const toolCalls = response.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      // No tool calls — return final text response
      const rawText =
        typeof response.content === 'string'
          ? response.content
          : response.content.toString();
      return { output: sanitizeAgentOutput(rawText), toolCalls: collectedToolCalls, products: lastProducts.length > 0 ? lastProducts : undefined, discountCode: haggleDiscountCode };
    }

    // Execute each tool call and append results
    for (const tc of toolCalls) {
      const tool = toolsByName.get(tc.name);
      let result: string;

      // Inject userId directly into tool args for tools that need it
      const toolArgs = { ...tc.args } as Record<string, unknown>;
      if (USER_ID_TOOLS.has(tc.name) && context?.userId) {
        toolArgs.user_id = context.userId;
      }

      // Block auth-required tools for anonymous users with a clear message
      if (USER_ID_TOOLS.has(tc.name) && !context?.userId) {
        result = JSON.stringify({
          success: false,
          message: 'You need to be logged in to do this. Please sign in first.',
          _instruction: 'IMPORTANT: Tell the customer they need to log in to use this feature.',
        });

        collectedToolCalls.push({ name: tc.name, args: toolArgs });
        messages.push(
          new ToolMessage({ content: result, tool_call_id: tc.id || tc.name })
        );
        continue;
      }

      if (tool) {
        try {
          result = await tool.invoke(toolArgs);

          // Check for tool-level failures and append clear instructions for the LLM
          try {
            const parsed = JSON.parse(result);
            if (parsed.success === false && parsed.message) {
              result = JSON.stringify({
                ...parsed,
                _instruction: `IMPORTANT: The tool failed. Tell the customer exactly: "${parsed.message}". Do NOT make up a different response.`,
              });
            }
          } catch {
            // result is not JSON — that's fine
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Tool execution failed';
          result = JSON.stringify({
            error: errMsg,
            _instruction: `IMPORTANT: The tool crashed. Tell the customer: "Sorry, something went wrong. Please try again."`,
          });
        }
      } else {
        result = JSON.stringify({ error: `Unknown tool: ${tc.name}` });
      }

      collectedToolCalls.push({
        name: tc.name,
        args: toolArgs,
      });

      const extracted = extractProductsFromToolResult(tc.name, result);
      if (extracted.length > 0) {
        const existingIds = new Set(lastProducts.map((p) => p.id));
        for (const p of extracted) {
          if (!existingIds.has(p.id)) {
            lastProducts.push(p);
            existingIds.add(p.id);
          }
        }
      }

      if (tc.name === 'haggle_price') {
        try {
          const parsed = JSON.parse(result) as { discount_code?: { code?: string } };
          if (parsed?.discount_code?.code) haggleDiscountCode = parsed.discount_code.code;
        } catch {
          /* ignore */
        }
      }

      messages.push(
        new ToolMessage({
          content: result,
          tool_call_id: tc.id || tc.name,
        })
      );
    }
  }

  // If we exhausted iterations, return the last response
  const lastAI = messages.filter((m) => m instanceof AIMessage).pop();
  const fallback = lastAI
    ? typeof lastAI.content === 'string'
      ? lastAI.content
      : lastAI.content.toString()
    : "I'm still working on that! Could you try again?";

  return { output: sanitizeAgentOutput(fallback), toolCalls: collectedToolCalls, products: lastProducts.length > 0 ? lastProducts : undefined, discountCode: haggleDiscountCode };
}
