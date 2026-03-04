import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react';
import type { Product } from '../../types';
import { isProductInStock } from '../../types';
import { useCart, useAuth } from '../../hooks';
import { useUIStore } from '../../store';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { openCart, addNotification } = useUIStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [wishlistActive, setWishlistActive] = useState(false);

  if (!product) return null;

  const productId = (product as any)._id || (product as any).id || '';
  if (!productId) return null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      addNotification({ type: 'warning', message: 'Please log in to add items to cart' });
      navigate('/login');
      return;
    }
    if (isAdding) return;

    setIsAdding(true);
    try {
      await addItem(productId, {
        name: product.name,
        price: product.price,
        image: productImage,
        quantity: 1
      });
      addNotification({ type: 'success', message: `${product.name} added to cart` });
      openCart();
    } catch (error) {
      addNotification({ type: 'error', message: error instanceof Error ? error.message : 'Failed to add to cart' });
    } finally {
      setIsAdding(false);
    }
  };

  const discount = product.compareAtPrice && product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const productImage = (product as any).images?.length ? (product as any).images[0]
    : (product as any).image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

  const inStock = isProductInStock(product);
  const avgRating = product.ratings?.average || 0;
  const ratingCount = product.ratings?.count || 0;

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-[#E8DFD0]/70 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:border-[#D4C4A8]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link to={`/product/${productId}`} className="block relative aspect-[3/4] overflow-hidden bg-[#F5F1E8]">
        <img
          src={productImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${isHovered ? 'scale-108' : 'scale-100'
            }`}
          style={{ transform: isHovered ? 'scale(1.07)' : 'scale(1)' }}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80'; }}
        />

        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge bg-red-500 text-white shadow-sm">-{discount}%</span>
          )}
          {((product as any).isFeatured || (product as any).featured) && discount === 0 && (
            <span className="badge bg-[#8B5A2B] text-white shadow-sm">✦ Featured</span>
          )}
          {!inStock && (
            <span className="badge bg-gray-500/90 text-white">Out of Stock</span>
          )}
        </div>

        {/* Quick Actions (right side) */}
        <div className={`absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'
          }`}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlistActive(!wishlistActive); }}
            className={`w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 ${wishlistActive ? 'text-red-500' : 'text-[#5D3A1A] hover:text-red-400'
              }`}
            aria-label="Add to wishlist"
          >
            <Heart size={16} fill={wishlistActive ? 'currentColor' : 'none'} />
          </button>
          <button
            className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center text-[#5D3A1A] hover:text-[#8B5A2B] transition-all duration-200 hover:scale-110"
            aria-label="Quick view"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/product/${productId}`); }}
          >
            <Eye size={16} />
          </button>
        </div>

        {/* Add to Cart — slides up on hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${isHovered && inStock ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !inStock}
            className="w-full bg-white/95 backdrop-blur-sm text-[#5D3A1A] py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#8B5A2B] hover:text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={16} />
            {isAdding ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <p className="section-label mb-1">{product.category || 'Uncategorized'}</p>
        <Link to={`/product/${productId}`}>
          <h3 className="font-medium text-[#5D3A1A] mb-2 line-clamp-2 hover:text-[#8B5A2B] transition-colors leading-snug text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#8B5A2B]">
              ₦{product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-[#A67B5B] line-through">
                ₦{product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stars */}
          {ratingCount > 0 && (
            <div className="flex items-center gap-1">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-xs text-[#A67B5B] font-medium">{avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
