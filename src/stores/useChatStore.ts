import { create } from 'zustand';
import type { MessageRole } from '@/features/chat/types';

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
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
}

interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: ChatMessageData[];
  sessionId: string | null;
  currentUserId: string | null; // Track which user owns this chat session
  setOpen: (open: boolean) => void;
  setMinimized: (minimized: boolean) => void;
  addMessage: (message: ChatMessageData) => void;
  setSessionId: (id: string) => void;
  setCurrentUserId: (userId: string | null) => void;
  clearChat: () => void; // Clear all chat data
}

const WELCOME_MESSAGE: ChatMessageData = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hey there! I'm your AI shopping clerk. I can help you find products, add items to your cart, check stock, and even negotiate prices. What are you looking for today?",
};

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  isMinimized: false,
  messages: [WELCOME_MESSAGE],
  sessionId: null,
  currentUserId: null,
  setOpen: (open: boolean) => set({ isOpen: open }),
  setMinimized: (minimized: boolean) => set({ isMinimized: minimized }),
  addMessage: (message: ChatMessageData) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setSessionId: (id: string) => set({ sessionId: id }),
  setCurrentUserId: (userId: string | null) => set({ currentUserId: userId }),
  clearChat: () =>
    set({
      messages: [WELCOME_MESSAGE],
      sessionId: null,
      currentUserId: null,
      isOpen: false,
      isMinimized: false,
    }),
}));
