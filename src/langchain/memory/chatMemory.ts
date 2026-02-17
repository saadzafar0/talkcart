import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * Sanitize assistant messages to prevent the model from re-using old discount
 * codes or other tool artifacts that might cause hallucination.
 */
interface FunctionCallMeta {
  name: string;
  args?: Record<string, unknown>;
}

function sanitizeContent(
  content: string,
  role: string,
  functionCalls?: FunctionCallMeta[] | null
): string {
  let text = content;

  if (role === 'assistant') {
    // Remove old HAGGLE codes entirely so the model never sees or repeats them.
    text = text
      .replace(/HAGGLE-[A-Z0-9]{4,8}/gi, '')
      .replace(/\[DISCOUNT-ALREADY-APPLIED\]/gi, '')
      .replace(/discount code\s*\*{0,2}\s*\*{0,2}/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Append tool call metadata so the LLM knows what tools were actually used
    // (ground truth, prevents it from hallucinating about what happened)
    if (functionCalls && functionCalls.length > 0) {
      const toolNames = functionCalls.map((fc) => fc.name).join(', ');
      text += ` [Tools used: ${toolNames}]`;
    }
  }

  return text;
}

/** Maximum messages to fetch from DB */
const MAX_FETCH = 40;
/** If we have more than this many messages, summarize the older ones */
const SUMMARIZE_THRESHOLD = 16;
/** Keep this many recent messages verbatim */
const RECENT_WINDOW = 10;

/**
 * Build a compact summary of older messages so the LLM retains context
 * without exceeding token limits.
 */
function summarizeOlderMessages(
  older: Array<{ role: string; content: string }>
): string {
  const userMessages: string[] = [];
  const assistantTopics: string[] = [];

  for (const msg of older) {
    const text = msg.content.substring(0, 200);
    if (msg.role === 'user') {
      userMessages.push(text);
    } else if (msg.role === 'assistant') {
      // Extract first sentence as topic
      const firstSentence = text.split(/[.!?\n]/)[0]?.trim();
      if (firstSentence) assistantTopics.push(firstSentence);
    }
  }

  const parts: string[] = ['[Conversation summary of earlier messages]'];
  if (userMessages.length > 0) {
    parts.push(`Customer asked about: ${userMessages.slice(-5).join('; ')}`);
  }
  if (assistantTopics.length > 0) {
    parts.push(`Assistant discussed: ${assistantTopics.slice(-5).join('; ')}`);
  }
  return parts.join('\n');
}

/**
 * Load chat history from the database and convert to LangChain message format.
 * When history is long, older messages are summarized into a compact block
 * to preserve context without exceeding token limits.
 */
export async function createChatMemory(
  sessionId: string,
  windowSize = 20
): Promise<BaseMessage[]> {
  const supabase = createServerSupabase();

  const fetchLimit = Math.max(windowSize, MAX_FETCH);
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('role, content, function_calls')
    .eq('chat_session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(fetchLimit);

  if (error) {
    console.error('Failed to load chat memory:', error);
    return [];
  }

  if (!messages || messages.length === 0) {
    return [];
  }

  // If under the threshold, return all messages as-is
  if (messages.length <= SUMMARIZE_THRESHOLD) {
    return messages.map((msg) => {
      const content = sanitizeContent(msg.content, msg.role, msg.function_calls as FunctionCallMeta[] | null);
      switch (msg.role) {
        case 'user':
          return new HumanMessage(content);
        case 'assistant':
          return new AIMessage(content);
        case 'system':
          return new SystemMessage(content);
        default:
          return new HumanMessage(content);
      }
    });
  }

  // Split into older (summarized) and recent (verbatim)
  const olderMessages = messages.slice(0, messages.length - RECENT_WINDOW);
  const recentMessages = messages.slice(messages.length - RECENT_WINDOW);

  // Use AIMessage for the summary (not SystemMessage) because Gemini requires
  // system messages to be first, and the clerk agent already has its own system prompt.
  const summary = summarizeOlderMessages(olderMessages);
  const result: BaseMessage[] = [new AIMessage(summary)];

  for (const msg of recentMessages) {
    const content = sanitizeContent(msg.content, msg.role, msg.function_calls as FunctionCallMeta[] | null);
    switch (msg.role) {
      case 'user':
        result.push(new HumanMessage(content));
        break;
      case 'assistant':
        result.push(new AIMessage(content));
        break;
      case 'system':
        result.push(new SystemMessage(content));
        break;
      default:
        result.push(new HumanMessage(content));
    }
  }

  return result;
}
