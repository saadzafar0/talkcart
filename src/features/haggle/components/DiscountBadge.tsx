'use client';

import { BadgePercent } from 'lucide-react';

interface DiscountBadgeProps {
  code: string;
  value: string;
  onClick?: () => void;
}

export function DiscountBadge({ code, value, onClick }: DiscountBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-success-600/30 bg-success-600/10 px-3 py-1.5 text-sm font-medium text-success-600 transition-colors hover:bg-success-600/20"
    >
      <BadgePercent className="h-3.5 w-3.5" />
      {code} ({value})
    </button>
  );
}
