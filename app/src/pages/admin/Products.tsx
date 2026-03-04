import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Star,
  Image as ImageIcon,
  RefreshCw,
  Filter
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { productService } from '../../services';
import type { Product } from '../../types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

export const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await productService.getProducts({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });
      setProducts(response.data);
      setTotalPages(response.meta?.totalPages || 1);

      // Extract unique categories for filter
      const allCats = await productService.getCategories();
      setCategories(allCats);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching products:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedCategory, searchQuery]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, searchQuery ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await productService.deleteProduct(productToDelete._id);
      setProducts(products.filter(p => p._id !== productToDelete._id));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const getStockStatus = (product: Product) => {
    const qty = product.inventory.quantity;
    const low = product.inventory.lowStockThreshold;

    if (qty === 0) return { label: 'Out of Stock', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' };
    if (qty <= low) return { label: 'Low Stock', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' };
    return { label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' };
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <p className="text-xs text-[#A67B5B] uppercase tracking-widest font-semibold mb-1">Inventory</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Products
            </h1>
            <p className="text-[#A67B5B] text-sm mt-1">Manage and track your store's collection.</p>
          </div>
          <Button
            onClick={() => navigate('/admin/products/add')}
            className="bg-[#8B5A2B] hover:bg-[#6B4423] text-white rounded-xl px-6 h-12 shadow-lg shadow-[#8B5A2B]/20 transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} className="mr-2" />
            Add New Product
          </Button>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-[#E8DFD0] p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={18} />
              <input
                type="text"
                placeholder="Search products by name, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-[#D4C4A8] rounded-xl bg-[#FAF7F2] text-[#5D3A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#F5F1E8] rounded-xl border border-[#E8DFD0]">
                <Filter size={16} className="text-[#8B5A2B]" />
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent text-sm font-semibold text-[#5D3A1A] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => fetchProducts()}
                className="p-2.5 bg-white border border-[#E8DFD0] rounded-xl text-[#5D3A1A] hover:bg-[#F5F1E8] transition-all"
                title="Refresh"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-sm overflow-hidden">
          {isLoading && products.length === 0 ? (
            <div className="p-20 flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-[#F5F1E8] border-t-[#8B5A2B] rounded-full animate-spin mb-4" />
              <p className="text-[#A67B5B] text-sm font-medium">Fetching catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-[#D4C4A8]" />
              </div>
              <h3 className="text-lg font-bold text-[#5D3A1A] mb-1">No products found</h3>
              <p className="text-[#A67B5B] text-sm mb-6">Start by adding your first masterpiece to the store.</p>
              <Button onClick={() => navigate('/admin/products/add')} className="bg-[#8B5A2B] hover:bg-[#6B4423]">
                Add Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#F5F1E8]">
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#A67B5B] uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#A67B5B] uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#A67B5B] uppercase tracking-wider">Pricing</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#A67B5B] uppercase tracking-wider">Inventory</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#A67B5B] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-[#A67B5B] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F1E8]">
                  {products.map((product) => {
                    const status = getStockStatus(product);
                    return (
                      <tr key={product._id} className="hover:bg-[#FAF7F2]/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#F5F1E8] rounded-xl overflow-hidden shadow-sm border border-[#E8DFD0] group-hover:scale-105 transition-transform">
                              {product.images[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-[#D4C4A8]" /></div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-[#5D3A1A] text-sm">{product.name}</p>
                                {product.isFeatured && <Star size={14} className="fill-[#8B5A2B] text-[#8B5A2B]" />}
                              </div>
                              <p className="text-[10px] text-[#A67B5B] font-mono mt-0.5">SKU: {product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold px-2.5 py-1 bg-[#F5F1E8] text-[#5D3A1A] rounded-full uppercase tracking-tighter">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#5D3A1A] text-sm">₦{product.price.toLocaleString()}</p>
                          {product.compareAtPrice && (
                            <p className="text-[10px] text-[#A67B5B] line-through">₦{product.compareAtPrice.toLocaleString()}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-[80px] h-1.5 bg-[#F5F1E8] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${status.dot}`}
                                style={{ width: `${Math.min(100, (product.inventory.quantity / 50) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-[#5D3A1A]">{product.inventory.quantity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F1E8] rounded-xl text-[#A67B5B] transition-all">
                                <MoreVertical size={18} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-[#E8DFD0] shadow-xl p-1">
                              <DropdownMenuItem onClick={() => navigate(`/product/${product._id}`)} className="rounded-lg gap-2 text-xs py-2 cursor-pointer">
                                <Eye size={14} /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/admin/products/edit/${product._id}`)} className="rounded-lg gap-2 text-xs py-2 cursor-pointer">
                                <Edit size={14} /> Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setProductToDelete(product); setDeleteDialogOpen(true); }} className="rounded-lg gap-2 text-xs py-2 text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer">
                                <Trash2 size={14} /> Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#F5F1E8] bg-[#FAF7F2]/30">
              <p className="text-xs text-[#A67B5B] font-medium">
                Page <span className="text-[#5D3A1A]">{currentPage}</span> of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center border border-[#D4C4A8] rounded-xl hover:bg-white disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center border border-[#D4C4A8] rounded-xl hover:bg-white disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-3xl border-[#E8DFD0] p-8 max-w-sm">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-sm text-[#A67B5B] pt-2">
              Are you sure you want to delete <span className="text-[#5D3A1A] font-bold">&quot;{productToDelete?.name}&quot;</span>? This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-col gap-3 mt-6">
            <button
              onClick={handleDelete}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/10"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full py-3 bg-[#F5F1E8] text-[#5D3A1A] font-bold rounded-2xl hover:bg-[#E8DFD0] transition-all"
            >
              Keep Product
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};
