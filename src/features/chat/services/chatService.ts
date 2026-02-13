import { SendMessageRequest, ChatResponse, ChatMessage } from '../types';

export const chatService = {
  async sendMessage(userId: string | null, data: SendMessageRequest): Promise<ChatResponse> {
    // TODO: implement - send message to LangChain clerk agent, return response
    throw new Error('Not implemented');
  },

  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    // TODO: implement - fetch chat history for session
    throw new Error('Not implemented');
  },
};
