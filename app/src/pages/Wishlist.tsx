import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../types';

// Mock wishlist data - in a real app, this would come from an API/database
const mockWishlistItems: Product[] = [
  {
    _id: '1',
    name: 'Classic Leather Handbag',
    description: 'Elegant leather handbag perfect for any occasion',
    price: 45000,
    compareAtPrice: 55000,
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80'],
    category: 'Accessories',
    subcategory: 'Bags',
    tags: ['leather', 'handbag', 'classic'],
    sku: 'BAG-001',
    inventory: { quantity: 15, lowStockThreshold: 5 },
    attributes: [],
    variants: [],
    ratings: { average: 4.8, count: 124 },
    reviews: [],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'Premium Silk Scarf',
    description: 'Luxurious silk scarf with beautiful patterns',
    price: 15000,
    images: ['https://images.unsplash.com/photo-1584030373081-f37b7bb4fa33?w=400&q=80'],
    category: 'Accessories',
    subcategory: 'Scarves',
    tags: ['silk', 'scarf', 'premium'],
    sku: 'SCF-001',
    inventory: { quantity: 25, lowStockThreshold: 5 },
    attributes: [],
    variants: [],
    ratings: { average: 4.6, count: 89 },
    reviews: [],
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const Wishlist = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [wishlistItems, setWishlistItems] = useState<Product[]>(mockWishlistItems);

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prev => prev.filter(item => item._id !== productId));
    toast.success('Item removed from wishlist');
  };

  const addToCart = (product: Product) => {
    toast.success(`${product.name} added to cart`);
  };

  const clearWishlist = () => {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      setWishlistItems([]);
      toast.success('Wishlist cleared');
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container-custom py-16 lg:py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-[#D4C4A8]" size={48} />
            </div>
            <h1 
              className="text-3xl font-bold text-[#5D3A1A] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Your Wishlist is Empty
            </h1>
            <p className="text-[#A67B5B] mb-8">
              Save items you love to your wishlist and revisit them anytime.
            </p>
            <Link 
              to="/shop"
              className="btn-primary inline-flex items-center gap-2"
            >
              Start Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container-custom py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#A67B5B] mb-8">
          <Link to="/" className="hover:text-[#8B5A2B]">Home</Link>
          <ArrowRight size={14} />
          <span className="text-[#5D3A1A]">Wishlist</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              My Wishlist
            </h1>
            <p className="text-[#A67B5B] mt-2">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <button
            onClick={clearWishlist}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 size={18} />
            Clear Wishlist
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div 
              key={product._id}
              className="bg-white rounded-xl border border-[#E8DFD0] overflow-hidden group hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-[#F5F1E8]">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.compareAtPrice && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                    Sale
                  </div>
                )}
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-md"
                >
                  <Trash2 size={18} />
                </button>
                <Link
                  to={`/product/${product._id}`}
                  className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#5D3A1A] hover:bg-[#F5F1E8] transition-colors shadow-md opacity-0 group-hover:opacity-100"
                >
                  <Eye size={18} />
                </Link>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-xs text-[#A67B5B] uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <Link 
                  to={`/product/${product._id}`}
                  className="block font-medium text-[#5D3A1A] hover:text-[#8B5A2B] transition-colors mb-2 line-clamp-1"
                >
                  {product.name}
                </Link>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-semibold text-[#8B5A2B]">
                    ₦{product.price.toLocaleString()}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-[#A67B5B] line-through">
                      ₦{product.compareAtPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link 
            to="/shop"
            className="inline-flex items-center gap-2 text-[#8B5A2B] hover:text-[#6B4423] font-medium transition-colors"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};
