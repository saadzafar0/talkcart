import { SendMessageRequest, ChatResponse, ChatMessage, ChatSession } from '../types';
import { createServerSupabase } from '@/lib/supabase/server';
import { clerkAgent } from '@/langchain/agents/clerkAgent';
import { createChatMemory } from '@/langchain/memory/chatMemory';

export const chatService = {
  /**
   * Send a message and get AI response via the Clerk Agent
   */
  async sendMessage(userId: string | null, data: SendMessageRequest): Promise<ChatResponse> {
    const { message, session_id } = data;

    // Get or create chat session
    const session = await this.getOrCreateSession(userId, session_id);

    // Save user message
    await this.saveMessage(session.id, 'user', message);

    // Load chat history as LangChain messages
    const chatHistory = await createChatMemory(session.id, 20);

    // Execute clerk agent with tools
    const agentResult = await clerkAgent(message, {
      chatHistory,
      userId,
    });

    // Build function_calls array from tool invocations
    const functionCalls = agentResult.toolCalls.length > 0
      ? agentResult.toolCalls.map((tc) => ({ name: tc.name, args: tc.args }))
      : null;

    // Save assistant message with tool call metadata
    const assistantMessage = await this.saveMessage(
      session.id,
      'assistant',
      agentResult.output,
      functionCalls
    );

    return {
      message: assistantMessage,
      actions: functionCalls || undefined,
    };
  },

  /**
   * Get chat history for a session
   */
  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    const supabase = createServerSupabase();

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch chat history: ${error.message}`);
    }

    return messages || [];
  },

  /**
   * Get or create a chat session
   */
  async getOrCreateSession(
    userId: string | null,
    sessionId?: string
  ): Promise<ChatSession> {
    const supabase = createServerSupabase();

    // If session_id provided, try to get existing session
    if (sessionId) {
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (existingSession) {
        return existingSession;
      }
    }

    // If user_id provided, try to get their latest active session
    if (userId) {
      const { data: userSession } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (userSession) {
        return userSession;
      }
    }

    // Create new session
    const { data: newSession, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        session_id: sessionId,
        metadata: {},
      })
      .select()
      .single();

    if (error || !newSession) {
      throw new Error('Failed to create chat session');
    }

    return newSession;
  },

  /**
   * Save a message to the database
   */
  async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    functionCalls?: any
  ): Promise<ChatMessage> {
    const supabase = createServerSupabase();

    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_session_id: sessionId,
        role,
        content,
        function_calls: functionCalls || null,
      })
      .select()
      .single();

    if (error || !message) {
      throw new Error('Failed to save message');
    }

    return message;
  },

  /**
   * End a chat session
   */
  async endSession(sessionId: string): Promise<void> {
    const supabase = createServerSupabase();

    const { error } = await supabase
      .from('chat_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      throw new Error('Failed to end session');
    }
  },
};
