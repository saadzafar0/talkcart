'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { ChatSuggestions } from './ChatSuggestions';
import type { MessageRole } from '@/features/chat/types';

interface LocalMessage {
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

const DEFAULT_SUGGESTIONS = [
  'Show me products',
  'I need something for a summer wedding',
  'What do you recommend?',
  'Can I get a discount?',
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hey there! I'm your AI shopping clerk. I can help you find products, add items to your cart, check stock, and even negotiate prices. What are you looking for today?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  async function handleSend(content: string) {
    const userMessage: LocalMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          session_id: sessionId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const responseData = data.data || data;

        // Set session ID for future messages
        if (responseData.session_id) {
          setSessionId(responseData.session_id);
        }

        const assistantMessage: LocalMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: responseData.message?.content || responseData.message || "I'm sorry, I couldn't process that. Could you try again?",
          products: responseData.products || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: "I'm having trouble connecting right now. Please try again in a moment.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleAddToCart(productId: string) {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `cart-${Date.now()}`,
            role: 'assistant',
            content: 'Added to your cart! You can view your cart anytime or keep shopping.',
          },
        ]);
      } else {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `cart-error-${Date.now()}`,
            role: 'assistant',
            content: data.error || 'Could not add to cart. You may need to sign in first.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `cart-error-${Date.now()}`,
          role: 'assistant',
          content: 'Something went wrong while adding to cart.',
        },
      ]);
    }
  }

  // Floating button when chat is closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-primary-900 shadow-lg transition-all hover:bg-accent-500 hover:shadow-xl"
        style={{ boxShadow: '0 4px 20px rgba(227, 178, 60, 0.3)' }}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl transition-all ${
        isMinimized ? 'h-14 w-80' : 'h-[520px] w-[380px]'
      }`}
      style={{ boxShadow: '0 8px 40px rgba(66, 62, 55, 0.15)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: 'linear-gradient(135deg, #423E37 0%, #6E675F 100%)' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-600/20">
            <MessageCircle className="h-4 w-4 text-accent-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-50">AI Clerk</div>
            <div className="flex items-center gap-1 text-[10px] text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
              Online
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-200"
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="py-2">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  products={msg.products}
                  onAddToCart={handleAddToCart}
                />
              ))}
              {isTyping && <ChatTypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <ChatSuggestions
              suggestions={DEFAULT_SUGGESTIONS}
              onSelect={handleSend}
            />
          )}

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </>
      )}
    </div>
  );
}
