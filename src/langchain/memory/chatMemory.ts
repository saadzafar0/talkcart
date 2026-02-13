import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { createServerSupabase } from '@/lib/supabase/server';

/**
 * Sanitize assistant messages to prevent the model from re-using old discount
 * codes or other tool artifacts that might cause hallucination.
 */
function sanitizeContent(content: string, role: string): string {
  if (role !== 'assistant') return content;
  // Replace old HAGGLE codes so the model doesn't parrot them
  return content.replace(/HAGGLE-[A-Z0-9]{4,8}/gi, '[DISCOUNT-ALREADY-APPLIED]');
}

/**
 * Load chat history from the database and convert to LangChain message format.
 * Uses a sliding window of the last N messages to keep token usage bounded.
 */
export async function createChatMemory(
  sessionId: string,
  windowSize = 20
): Promise<BaseMessage[]> {
  const supabase = createServerSupabase();

  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('chat_session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(windowSize);

  if (error) {
    console.error('Failed to load chat memory:', error);
    return [];
  }

  if (!messages || messages.length === 0) {
    return [];
  }

  return messages.map((msg) => {
    const content = sanitizeContent(msg.content, msg.role);
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
