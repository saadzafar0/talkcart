'use client';

import { useState } from 'react';
import { X, BadgePercent, Send, MessageCircle } from 'lucide-react';
import { formatPrice } from '@/core/utils/formatters';

interface HaggleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  originalPrice: number;
  minimumPrice: number;
}

interface HaggleMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function HaggleDialog({
  isOpen,
  onClose,
  productId,
  productName,
  originalPrice,
  minimumPrice,
}: HaggleDialogProps) {
  const [messages, setMessages] = useState<HaggleMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Want a deal on ${productName}? The listed price is ${formatPrice(originalPrice)}. Make me an offer or tell me why you deserve a discount!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: HaggleMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/haggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          message: trimmed,
          session_id: sessionId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const responseData = data.data || data;

        if (responseData.session?.id) {
          setSessionId(responseData.session.id);
        }

        if (responseData.discount_code) {
          setDiscountCode(responseData.discount_code.code);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: responseData.message || 'Hmm, let me think about that...',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: "I'm having trouble processing your request. Try again?",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleApplyCode() {
    if (discountCode) {
      sessionStorage.setItem('discount_code', discountCode);
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-primary-900/50 p-4">
      <div className="flex h-[480px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: 'linear-gradient(135deg, #423E37 0%, #6E675F 100%)' }}
        >
          <div className="flex items-center gap-2">
            <BadgePercent className="h-5 w-5 text-accent-400" />
            <div>
              <div className="text-sm font-semibold text-neutral-50">Haggle Mode</div>
              <div className="text-xs text-neutral-400">Negotiate your price</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'rounded-br-md bg-accent-600 text-primary-900'
                      : 'rounded-bl-md bg-neutral-100 text-primary-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-neutral-100 px-4 py-3 w-fit">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary-500 [animation-delay:300ms]" />
              </div>
            )}
          </div>
        </div>

        {/* Discount code display */}
        {discountCode && (
          <div className="border-t border-neutral-200 bg-success-600/5 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgePercent className="h-4 w-4 text-success-600" />
                <span className="text-sm font-medium text-success-600">
                  Your code: <span className="font-mono font-bold">{discountCode}</span>
                </span>
              </div>
              <button
                onClick={handleApplyCode}
                className="rounded-lg bg-success-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-success-600/90"
              >
                Apply to Cart
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-2 border-t border-neutral-200 bg-neutral-50 p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Make your case..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-primary-900 placeholder:text-neutral-500 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent-600 text-primary-900 transition-colors hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
