import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { createServerSupabase } from '@/lib/supabase/server';

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
    switch (msg.role) {
      case 'user':
        return new HumanMessage(msg.content);
      case 'assistant':
        return new AIMessage(msg.content);
      case 'system':
        return new SystemMessage(msg.content);
      default:
        return new HumanMessage(msg.content);
    }
  });
}
