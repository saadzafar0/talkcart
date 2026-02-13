'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useVibeFilterStore } from '@/stores/useVibeFilterStore';

const TOAST_DURATION_MS = 4000;

/**
 * Toast that appears when the AI clerk applies filters via chat (Vibe Filter).
 * Shows a friendly message like "Showing cheaper options!" and auto-dismisses.
 */
export function VibeFilterToast() {
  const message = useVibeFilterStore((s) => s.message);
  const appliedAt = useVibeFilterStore((s) => s.appliedAt);
  const clearVibeFilter = useVibeFilterStore((s) => s.clearVibeFilter);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message || !appliedAt) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      clearVibeFilter();
    }, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [message, appliedAt, clearVibeFilter]);

  if (!visible || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-20 z-[100] -translate-x-1/2 flex items-center gap-3 rounded-xl border border-accent-500/30 bg-accent-600/10 px-4 py-3 shadow-lg transition-all duration-300"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-600/20">
        <Sparkles className="h-4 w-4 text-accent-600" />
      </div>
      <p className="text-sm font-medium text-primary-900">{message}</p>
    </div>
  );
}
