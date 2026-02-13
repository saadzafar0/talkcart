import { SendMessageRequest, ChatResponse, ChatMessage, ChatSession } from '../types';
import { createServerSupabase } from '@/lib/supabase/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

// Initialize Gemini via LangChain
const createGeminiModel = () => {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.7,
  });
};

export const chatService = {
  /**
   * Send a message and get AI response
   */
  async sendMessage(userId: string | null, data: SendMessageRequest): Promise<ChatResponse> {
    const supabase = createServerSupabase();
    const { message, session_id } = data;

    // Get or create chat session
    const session = await this.getOrCreateSession(userId, session_id);

    // Save user message
    const userMessage = await this.saveMessage(session.id, 'user', message);

    // Get chat history for context
    const history = await this.getHistory(session.id);

    // Generate AI response using Gemini
    const aiResponse = await this.generateAIResponse(message, history, userId);

    // Save assistant message
    const assistantMessage = await this.saveMessage(
      session.id,
      'assistant',
      aiResponse.content,
      aiResponse.function_calls || null
    );

    return {
      message: assistantMessage,
      actions: aiResponse.function_calls || undefined,
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
   * Generate AI response using Gemini via LangChain
   * This is a basic implementation - can be enhanced with full agent system later
   */
  async generateAIResponse(
    userMessage: string,
    history: ChatMessage[],
    userId: string | null
  ): Promise<{ content: string; function_calls?: any[] }> {
    try {
      const model = createGeminiModel();

      // Build conversation context
      const context = this.buildConversationContext(history);

      // System prompt for the AI Clerk
      const systemPrompt = `You are a friendly, helpful AI shopping assistant for TalkCart, an e-commerce store.

Your personality:
- Warm, enthusiastic, and slightly playful
- You love helping customers find exactly what they need
- You understand fashion, style, and product recommendations
- You're knowledgeable about inventory and can check stock
- You can help with purchases, discounts, and haggling

Your capabilities:
- Search and recommend products based on customer needs
- Check product availability and stock
- Add items to the shopping cart
- Apply discount codes
- Negotiate prices (within reasonable limits)
- Answer questions about products, shipping, returns

Guidelines:
- Be conversational and natural
- Ask clarifying questions when needed
- Provide specific product recommendations with details
- If you don't have information, be honest about it
- Keep responses concise but informative
- Use emojis occasionally to add personality 😊

Current conversation context:
${context}

Respond to the customer's message naturally and helpfully.`;

      const prompt = `${systemPrompt}\n\nCustomer: ${userMessage}\n\nAssistant:`;

      // Invoke the model
      const response = await model.invoke(prompt);
      const text = typeof response.content === 'string' 
        ? response.content 
        : response.content.toString();

      // For now, return simple text response
      // TODO: Implement function calling with LangChain tools
      return {
        content: text,
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      // Fallback response
      return {
        content: "I'm here to help! I can assist you with finding products, checking stock, adding items to your cart, and more. What would you like to do today?",
      };
    }
  },

  /**
   * Build conversation context from history
   */
  buildConversationContext(history: ChatMessage[]): string {
    if (history.length === 0) {
      return 'This is the start of a new conversation.';
    }

    // Get last 5 messages for context
    const recentMessages = history.slice(-5);
    
    return recentMessages
      .map((msg) => `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`)
      .join('\n');
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
