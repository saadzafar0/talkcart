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

const PRODUCT_TOOLS = ['get_recommendations', 'search_products', 'filter_products'] as const;

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
 * Main clerk agent — handles general shopping conversations.
 * Uses Gemini LLM with tool calling (bindTools) for search, cart, stock,
 * discounts, and haggling. Implements a manual agentic loop.
 */
export async function clerkAgent(
  message: string,
  context?: {
    chatHistory?: BaseMessage[];
    userId?: string | null;
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

  // Inject userId context
  const enrichedInput = context?.userId
    ? `[User ID: ${context.userId}] ${message}`
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
      const text =
        typeof response.content === 'string'
          ? response.content
          : response.content.toString();
      return { output: text, toolCalls: collectedToolCalls, products: lastProducts.length > 0 ? lastProducts : undefined, discountCode: haggleDiscountCode };
    }

    // Execute each tool call and append results
    for (const tc of toolCalls) {
      const tool = toolsByName.get(tc.name);
      let result: string;

      if (tool) {
        try {
          result = await tool.invoke(tc.args);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Tool execution failed';
          result = JSON.stringify({ error: message });
        }
      } else {
        result = JSON.stringify({ error: `Unknown tool: ${tc.name}` });
      }

      collectedToolCalls.push({
        name: tc.name,
        args: tc.args as Record<string, unknown>,
      });

      const extracted = extractProductsFromToolResult(tc.name, result);
      if (extracted.length > 0) lastProducts = extracted;

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

  return { output: fallback, toolCalls: collectedToolCalls, products: lastProducts.length > 0 ? lastProducts : undefined, discountCode: haggleDiscountCode };
}
