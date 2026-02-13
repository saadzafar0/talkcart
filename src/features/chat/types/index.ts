export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  chat_session_id: string;
  role: MessageRole;
  content: string;
  function_calls: FunctionCall[] | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string | null;
  session_id: string | null;
  started_at: string;
  ended_at: string | null;
  metadata: Record<string, unknown> | null;
}

export interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface SendMessageRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  message: ChatMessage;
  actions?: FunctionCall[];
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
