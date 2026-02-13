import { HaggleRequest, HaggleResponse } from '../types';

export const haggleService = {
  async negotiate(userId: string | null, data: HaggleRequest): Promise<HaggleResponse> {
    // TODO: implement - negotiate price via LangChain haggle agent
    throw new Error('Not implemented');
  },

  async accept(userId: string | null, sessionId: string): Promise<HaggleResponse> {
    // TODO: implement - accept haggle deal, generate discount code
    throw new Error('Not implemented');
  },
};
