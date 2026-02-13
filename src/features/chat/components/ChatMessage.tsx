'use client';

import { MessageCircle, User } from 'lucide-react';
import { ChatProductCard } from './ChatProductCard';
import type { MessageRole } from '@/features/chat/types';

interface ChatMessageProps {
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
  onAddToCart?: (productId: string) => void;
}

export function ChatMessage({ role, content, products, onAddToCart }: ChatMessageProps) {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex gap-2.5 px-4 py-2 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
          isAssistant ? 'bg-accent-600/10' : 'bg-primary-900/10'
        }`}
      >
        {isAssistant ? (
          <MessageCircle className="h-3.5 w-3.5 text-accent-700" />
        ) : (
          <User className="h-3.5 w-3.5 text-primary-600" />
        )}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[80%] space-y-1 ${isAssistant ? '' : 'items-end'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isAssistant
              ? 'rounded-bl-md bg-neutral-100 text-primary-900'
              : 'rounded-br-md bg-accent-600 text-primary-900'
          }`}
        >
          <div className="whitespace-pre-wrap">{content}</div>
        </div>

        {/* Product cards in response */}
        {isAssistant && products && products.length > 0 && (
          <div className="space-y-1">
            {products.map((product) => (
              <ChatProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
