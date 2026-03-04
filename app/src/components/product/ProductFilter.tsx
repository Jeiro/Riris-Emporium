import { useState } from 'react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import type { ProductFilters } from '../../types';

interface ProductFilterProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  categories: string[];
}

export const ProductFilter = ({ filters, onFilterChange, categories }: ProductFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const cleared = {};
    setLocalFilters(cleared);
    onFilterChange(cleared);
    setIsOpen(false);
  };

  const hasActiveFilters = Object.keys(filters).some(
    key => filters[key as keyof ProductFilters] !== undefined && 
           filters[key as keyof ProductFilters] !== '' &&
           key !== 'page' && 
           key !== 'limit'
  );

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
    { value: '-name', label: 'Name: Z to A' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Sort Dropdown */}
      <div className="relative">
        <select
          value={filters.sort || '-createdAt'}
          onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
          className="appearance-none bg-white border border-[#D4C4A8] rounded-lg px-4 py-2 pr-10 text-[#5D3A1A] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A67B5B] pointer-events-none" 
          size={18} 
        />
      </div>

      {/* Category Filter */}
      <div className="relative">
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value || undefined })}
          className="appearance-none bg-white border border-[#D4C4A8] rounded-lg px-4 py-2 pr-10 text-[#5D3A1A] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <ChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A67B5B] pointer-events-none" 
          size={18} 
        />
      </div>

      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
          hasActiveFilters
            ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]'
            : 'bg-white text-[#5D3A1A] border-[#D4C4A8] hover:border-[#8B5A2B]'
        }`}
      >
        <SlidersHorizontal size={18} />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="ml-1 w-5 h-5 bg-white text-[#8B5A2B] rounded-full text-xs flex items-center justify-center font-bold">
            {Object.keys(filters).filter(k => k !== 'page' && k !== 'limit' && k !== 'sort').length}
          </span>
        )}
      </button>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-1 text-sm text-[#A67B5B] hover:text-[#8B5A2B] transition-colors"
        >
          <X size={16} />
          Clear all
        </button>
      )}

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-6 bg-white rounded-xl shadow-xl border border-[#E8DFD0] z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <h4 className="font-medium text-[#5D3A1A] mb-3">Price Range</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minPrice || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      minPrice: e.target.value ? Number(e.target.value) : undefined
                    })
                  }
                  className="w-full px-3 py-2 border border-[#D4C4A8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30"
                />
                <span className="text-[#A67B5B]">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxPrice || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      maxPrice: e.target.value ? Number(e.target.value) : undefined
                    })
                  }
                  className="w-full px-3 py-2 border border-[#D4C4A8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <h4 className="font-medium text-[#5D3A1A] mb-3">Availability</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.inStock || false}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      inStock: e.target.checked || undefined
                    })
                  }
                  className="w-4 h-4 text-[#8B5A2B] border-[#D4C4A8] rounded focus:ring-[#8B5A2B]"
                />
                <span className="text-[#5D3A1A]">In Stock Only</span>
              </label>
            </div>

            {/* Featured */}
            <div>
              <h4 className="font-medium text-[#5D3A1A] mb-3">Featured</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localFilters.featured || false}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      featured: e.target.checked || undefined
                    })
                  }
                  className="w-4 h-4 text-[#8B5A2B] border-[#D4C4A8] rounded focus:ring-[#8B5A2B]"
                />
                <span className="text-[#5D3A1A]">Featured Products</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E8DFD0]">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-[#A67B5B] hover:text-[#5D3A1A] transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-[#8B5A2B] text-white rounded-lg hover:bg-[#6B4423] transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
