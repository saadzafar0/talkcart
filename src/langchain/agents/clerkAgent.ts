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

export interface ClerkAgentResult {
  output: string;
  toolCalls: { name: string; args: Record<string, unknown> }[];
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
  const llm = createGeminiLLM(0.7);
  const llmWithTools = llm.bindTools(allTools);
  const toolsByName = new Map<string, StructuredToolInterface>(allTools.map((t) => [t.name, t]));

  const collectedToolCalls: { name: string; args: Record<string, unknown> }[] = [];

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
    const response = await llmWithTools.invoke(messages);
    messages.push(response);

    // Check if the model made tool calls
    const toolCalls = response.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      // No tool calls — return final text response
      const text =
        typeof response.content === 'string'
          ? response.content
          : response.content.toString();
      return { output: text, toolCalls: collectedToolCalls };
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

  return { output: fallback, toolCalls: collectedToolCalls };
}
