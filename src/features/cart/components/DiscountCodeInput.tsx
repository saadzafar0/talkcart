'use client';

import { useState } from 'react';
import { Tag, Check, AlertCircle, X } from 'lucide-react';

interface DiscountCodeInputProps {
  onApply: (code: string) => void;
  onRemove?: () => void;
  appliedCode?: string;
  error?: string;
}

export function DiscountCodeInput({ onApply, onRemove, appliedCode, error }: DiscountCodeInputProps) {
  const [code, setCode] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim()) {
      onApply(code.trim().toUpperCase());
    }
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-success-600/30 bg-success-600/10 px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-success-600" />
          <span className="font-medium text-success-600">
            Code &ldquo;{appliedCode}&rdquo; applied
          </span>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-success-600 hover:text-success-700 transition-colors"
            title="Remove discount code"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter discount code"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-primary-900 placeholder:text-neutral-500 transition-colors focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg border border-accent-600 px-4 py-2.5 text-sm font-semibold text-accent-700 transition-colors hover:bg-accent-600/10"
        >
          Apply
        </button>
      </form>
      {error && (
        <div className="mt-2 flex items-center gap-1 text-xs text-error-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}
