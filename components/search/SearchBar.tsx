import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'recipe' | 'chef' | 'masterclass';
  title: string;
  subtitle?: string;
  link: string;
}

interface SearchBarProps {
  className?: string;
  onResultSelect?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ className, onResultSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();

    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'recipe',
        title: 'Risotto ai Funghi',
        subtitle: 'by Massimo Bottura',
        link: '/recipes/risotto-ai-funghi',
      },
      {
        id: '2',
        type: 'chef',
        title: 'Massimo Bottura',
        subtitle: 'Osteria Francescana',
        link: '/chefs/massimo-bottura',
      },
      {
        id: '3',
        type: 'masterclass',
        title: 'Modern Italian Cooking',
        subtitle: 'by Massimo Bottura',
        link: '/masterclasses/modern-italian-cooking',
      },
    ].filter(
      (result) =>
        result.title.toLowerCase().includes(lowerQuery) ||
        result.subtitle?.toLowerCase().includes(lowerQuery)
    );

    setResults(mockResults);
  }, [query]);

  const handleSelectResult = () => {
    setQuery('');
    setIsOpen(false);
    onResultSelect?.();
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search recipes, chefs, classes..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-gold-500 focus:ring-1 focus:ring-gold-500 font-sans"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (results.length > 0 || query.length >= 2) && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={result.link}
                    onClick={handleSelectResult}
                    className="flex items-start gap-4 px-4 py-3 hover:bg-gold-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-gold-100 flex items-center justify-center text-xs font-semibold text-gold-700">
                      {result.type === 'recipe' && '📖'}
                      {result.type === 'chef' && '👨‍🍳'}
                      {result.type === 'masterclass' && '🎓'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-sm text-gray-500">{result.subtitle}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                No results found for "{query}"
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
