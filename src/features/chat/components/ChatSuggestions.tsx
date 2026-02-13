'use client';

interface ChatSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function ChatSuggestions({ suggestions, onSelect }: ChatSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {suggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(suggestion)}
          className="rounded-full border border-accent-600/30 bg-accent-600/5 px-3 py-1.5 text-xs font-medium text-accent-700 transition-colors hover:bg-accent-600/10"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
