'use client';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (text: string) => void;
  show: boolean;
}

export function SuggestionChips({ suggestions, onSelect, show }: SuggestionChipsProps) {
  if (!show) return null;

  return (
    <div className="px-4 py-2 bg-gray-50/80">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            className="flex-shrink-0 px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-amazon-orange/10 hover:border-amazon-orange/40 hover:text-amazon-dark active:scale-95 transition-all"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
