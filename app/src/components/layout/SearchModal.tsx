import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Loader2 } from 'lucide-react';
import { useUIStore } from '../../store';
import { productService } from '../../services';
import type { Product } from '../../types';

export const SearchModal = () => {
  const { isSearchOpen, closeSearch, searchQuery, setSearchQuery } = useUIStore();
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isSearchOpen, closeSearch]);

  // Debounced search
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await productService.getProducts({
          search: query,
          limit: 8
        });
        setResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, debouncedSearch]);

  const handleProductClick = (productId: string) => {
    closeSearch();
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  const handleViewAll = () => {
    closeSearch();
    navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 lg:pt-24">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeSearch}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-[#FAF7F2] rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-4 p-4 border-b border-[#E8DFD0]">
          <Search className="text-[#A67B5B]" size={24} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="flex-1 bg-transparent text-lg text-[#5D3A1A] placeholder:text-[#A67B5B]/60 focus:outline-none"
          />
          {isLoading && <Loader2 className="animate-spin text-[#A67B5B]" size={20} />}
          <button
            onClick={closeSearch}
            className="p-2 text-[#5D3A1A] hover:bg-[#F5F1E8] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {!hasSearched && (
            <div className="p-8 text-center text-[#A67B5B]">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Start typing to search for products</p>
            </div>
          )}

          {hasSearched && !isLoading && results.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-[#5D3A1A] text-lg mb-2">No products found</p>
              <p className="text-[#A67B5B]">
                Try searching with different keywords
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              <p className="px-4 py-2 text-sm text-[#A67B5B]">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
              {results.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-[#F5F1E8] rounded-lg transition-colors text-left"
                >
                  <img
                    src={product.images[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg bg-[#E8DFD0]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#5D3A1A] truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-[#A67B5B]">{product.category}</p>
                  </div>
                  <p className="font-semibold text-[#8B5A2B]">
                    ₦{product.price.toLocaleString()}
                  </p>
                </button>
              ))}
              
              <button
                onClick={handleViewAll}
                className="w-full py-3 text-center text-[#8B5A2B] hover:bg-[#F5F1E8] rounded-lg transition-colors font-medium"
              >
                View all results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
