'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { ChatSuggestions } from './ChatSuggestions';
import { buildFilterUrl } from '@/features/chat/utils/buildFilterUrl';
import { useCartStore } from '@/stores/useCartStore';
import { useChatStore } from '@/stores/useChatStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useVibeFilterStore } from '@/stores/useVibeFilterStore';

const DEFAULT_SUGGESTIONS = [
  'Show me products',
  'Show me cheaper options',
  'I need something for a summer wedding',
  'What do you recommend?',
];

export function ChatWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isOpen = useChatStore((s) => s.isOpen);
  const setOpen = useChatStore((s) => s.setOpen);
  const isMinimized = useChatStore((s) => s.isMinimized);
  const setMinimized = useChatStore((s) => s.setMinimized);
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const sessionId = useChatStore((s) => s.sessionId);
  const setSessionId = useChatStore((s) => s.setSessionId);
  const currentUserId = useChatStore((s) => s.currentUserId);
  const setCurrentUserId = useChatStore((s) => s.setCurrentUserId);
  const clearChat = useChatStore((s) => s.clearChat);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clear chat if user changes (login/logout/switch account)
  useEffect(() => {
    const newUserId = user?.id || null;
    
    // If user changed (not initial load), clear chat
    if (currentUserId !== null && currentUserId !== newUserId) {
      clearChat();
    }
    
    // Always update current user ID
    if (currentUserId !== newUserId) {
      setCurrentUserId(newUserId);
    }
  }, [user?.id, currentUserId, clearChat, setCurrentUserId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  async function applyHaggleCodeToCart(code: string): Promise<boolean> {
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const meta = data.data;
        sessionStorage.setItem('discount_code', meta.code);
        sessionStorage.setItem('discount_meta', JSON.stringify({
          discount_type: meta.discount_type,
          discount_value: meta.discount_value,
          max_discount_amount: meta.max_discount_amount,
          min_purchase_amount: meta.min_purchase_amount,
          product_id: meta.product_id,
        }));
        useCartStore.getState().fetchCount();
        window.dispatchEvent(new CustomEvent('discount-code-applied'));
        return true;
      }
    } catch {
      // Non-critical
    }
    return false;
  }

  async function handleSend(content: string) {
    addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    });
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

        addMessage({
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: responseData.message?.content || responseData.message || "I'm sorry, I couldn't process that. Could you try again?",
          products: responseData.products || [],
        });

        // Vibe Filter: if agent used filter/search tools, update UI instantly
        const actions = responseData.actions;
        if (actions && Array.isArray(actions)) {
          const filterResult = buildFilterUrl(actions);
          if (filterResult) {
            // Set message for toast (products page will show it)
            useVibeFilterStore.getState().setVibeFilter(filterResult.message);
            // Navigate to products page with filters (or update if already there)
            const isOnProductsPage = pathname?.startsWith('/products');
            router.push(filterResult.url);
            // If already on products page, scroll to top so user sees the update
            if (isOnProductsPage) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }

          // Sync cart badge if agent added items to cart
          if (actions.some((a: { name: string }) => a.name === 'add_to_cart')) {
            useCartStore.getState().fetchCount();
          }

          // Navigate to checkout when agent uses go_to_checkout
          if (actions.some((a: { name: string }) => a.name === 'go_to_checkout')) {
            router.push('/checkout');
          }

          // Navigate to cart when agent uses go_to_cart
          if (actions.some((a: { name: string }) => a.name === 'go_to_cart')) {
            router.push('/cart');
          }
        }

        // Auto-apply haggle coupon — only use the structured field from the API,
        // never regex on message content (prevents applying hallucinated codes)
        if (responseData.discountCode) {
          applyHaggleCodeToCart(responseData.discountCode);
        }
      } else {
        addMessage({
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
        });
      }
    } catch {
      addMessage({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
      });
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
        useCartStore.getState().fetchCount();
        addMessage({
          id: `cart-${Date.now()}`,
          role: 'assistant',
          content: 'Added to your cart! You can view your cart anytime or keep shopping.',
        });
      } else {
        const data = await res.json();
        addMessage({
          id: `cart-error-${Date.now()}`,
          role: 'assistant',
          content: data.error || 'Could not add to cart. You may need to sign in first.',
        });
      }
    } catch {
      addMessage({
        id: `cart-error-${Date.now()}`,
        role: 'assistant',
        content: 'Something went wrong while adding to cart.',
      });
    }
  }

  // Floating button when chat is closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setOpen(true)}
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
            onClick={() => setMinimized(!isMinimized)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-200"
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setOpen(false)}
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
