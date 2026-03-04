import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilter } from '../components/product/ProductFilter';
import { productService } from '../services';
import type { Product, ProductFilters } from '../types';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12
  });

  // Parse URL params on mount
  useEffect(() => {
    const urlFilters: ProductFilters = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 12,
      sort: searchParams.get('sort') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      featured: searchParams.get('featured') === 'true' || undefined,
      inStock: searchParams.get('inStock') === 'true' || undefined
    };
    setFilters(urlFilters);
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching categories:', error);
        }
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await productService.getProducts(filters);
      setProducts(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching products:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL when filters change
  const handleFilterChange = (newFilters: ProductFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== false) {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  };

  const totalPages = Math.ceil(total / (filters.limit || 12));

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* ── Page Header ── */}
      <div className="bg-[#5D3A1A] text-white py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5A2B]/20 rounded-full blur-3xl" />
        <div className="container-custom relative z-10 text-center">
          <p className="section-label text-[#D4C4A8] mb-4">Curated Collection</p>
          <h1
            className="text-4xl lg:text-5xl font-bold mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            The Store
          </h1>
          <p className="text-white/70 max-w-xl mx-auto leading-relaxed">
            Discover a world of elegance with our handpicked selection of premium products,
            crafted for those who appreciate fine things in life.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar Filters ── */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E8DFD0] p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-[#5D3A1A]">
                <SlidersHorizontal size={18} />
                <h2 className="font-bold">Filters</h2>
              </div>
              <ProductFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
              />
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ ...filters, search: e.target.value || undefined, page: 1 })}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-4">
                <p className="text-sm text-[#A67B5B]">
                  Showing <span className="text-[#5D3A1A] font-semibold">{products.length}</span> of <span className="text-[#5D3A1A] font-semibold">{total}</span>
                </p>
                <div className="flex bg-white rounded-lg border border-[#E8DFD0] p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#F5F1E8] text-[#8B5A2B]' : 'text-[#A67B5B] hover:text-[#5D3A1A]'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[#F5F1E8] text-[#8B5A2B]' : 'text-[#A67B5B] hover:text-[#5D3A1A]'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <ProductGrid
              products={products}
              isLoading={isLoading}
              emptyMessage="No products found matching your criteria"
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <button
                  onClick={() => handleFilterChange({ ...filters, page: (filters.page || 1) - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 bg-white border border-[#D4C4A8] rounded-xl text-sm font-medium text-[#5D3A1A] hover:bg-[#F5F1E8] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1.5">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isActive = page === filters.page;

                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= (filters.page || 1) - 1 && page <= (filters.page || 1) + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handleFilterChange({ ...filters, page })}
                          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${isActive
                              ? 'bg-[#8B5A2B] text-white shadow-md shadow-[#8B5A2B]/20'
                              : 'bg-white border border-[#D4C4A8] text-[#5D3A1A] hover:bg-[#F5F1E8]'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    }

                    if (
                      page === (filters.page || 1) - 2 ||
                      page === (filters.page || 1) + 2
                    ) {
                      return <span key={page} className="px-1 text-[#A67B5B]">...</span>;
                    }

                    return null;
                  })}
                </div>

                <button
                  onClick={() => handleFilterChange({ ...filters, page: (filters.page || 1) + 1 })}
                  disabled={filters.page === totalPages}
                  className="px-4 py-2 bg-white border border-[#D4C4A8] rounded-xl text-sm font-medium text-[#5D3A1A] hover:bg-[#F5F1E8] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
