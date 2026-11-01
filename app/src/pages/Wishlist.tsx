import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useWishlist } from '../hooks/useWishlist';
import { productService } from '../services/productService';
import { useCartStore } from '../store/cartStore';
import { supabase } from '../lib/supabase';
import { isProductInStock } from '../types';
import type { Product } from '../types';

export const Wishlist = () => {
  const wishlist = useWishlist();
  const { userId, ids, isLoading, error } = wishlist;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; products: Product[]; error?: string }>();
  const [pending, setPending] = useState<string | null>(null);
  const busy = useRef(false);
  const requestKey = JSON.stringify([userId, ids, attempt]);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!userId || !ids.length || error) return;
    let active = true;
    const requestedIds: string[] = JSON.parse(requestKey)[1];
    productService.getProductsByIds(requestedIds).then(products => {
      if (active) setResult({ key: requestKey, products });
    }).catch(() => {
      if (active) setResult({ key: requestKey, products: [], error: 'Could not load saved products. Please retry.' });
    });
    return () => { active = false; };
  }, [requestKey, userId, ids.length, error]);
  const wishlistItems = result?.key === requestKey ? result.products : [];
  const loadError = error || (result?.key === requestKey ? result.error : null);
  const removeFromWishlist = async (id: string) => {
    try { await wishlist.remove(id); toast.success('Item removed from wishlist'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Could not remove item'); }
  };
  const clearWishlist = async () => {
    if (!confirm('Are you sure you want to clear your wishlist on this device?')) return;
    try { await wishlist.clear(); toast.success('Wishlist cleared'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Could not clear wishlist'); }
  };
  const addToCart = async (product: Product) => {
    if (busy.current || !isProductInStock(product)) return;
    busy.current = true;
    setPending(product._id);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !userId || data.user?.id !== userId) throw new Error('Your account changed. Please sign in again.');
      await useCartStore.getState().addItem(product._id, {
        name: product.name, price: product.price, image: product.images[0] || '', quantity: 1,
      });
      toast.success(`${product.name} added to cart`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not add item to cart'); }
    finally { busy.current = false; setPending(null); }
  };
  if (isLoading || (!loadError && userId && ids.length > 0 && result?.key !== requestKey)) {
    return <div role="status" className="container-custom py-24 text-center text-[#5D3A1A]">Loading your wishlist…</div>;
  }
  if (loadError) return <div role="alert" className="container-custom py-24 text-center text-[#5D3A1A]">
    <h1 className="text-3xl font-bold mb-4">Wishlist unavailable</h1><p>{loadError}</p>
    <button className="btn-primary mt-4" onClick={() => { setAttempt(value => value + 1); void wishlist.retry(); }}>Retry</button>
    {userId && <button className="ml-4" onClick={clearWishlist}>Clear saved wishlist</button>}
  </div>;
  if (!userId) return <div className="container-custom py-24 text-center"><p>Sign in to view your wishlist.</p><Link to="/login">Sign in</Link></div>;
  if (ids.length === 0) {
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
              Save items you love on this device. Your wishlist is private to your account here and does not sync between devices.
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
              {ids.length} {ids.length === 1 ? 'item' : 'items'} saved
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

        <p className="text-sm text-[#A67B5B] mb-6">Saved on this device for your account. Wishlists do not sync between devices.</p>
        {ids.filter(id => !wishlistItems.some(product => product._id === id)).map(id => (
          <div key={id} className="bg-white rounded-xl border border-[#E8DFD0] p-6 mb-4">
            <p>A saved product is no longer available.</p>
            <button onClick={() => removeFromWishlist(id)} className="text-red-600 mt-2">Remove unavailable item</button>
          </div>
        ))}
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
                  src={product.images[0] || undefined}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.compareAtPrice && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                    Sale
                  </div>
                )}
                <button
                  aria-label={`Remove ${product.name} from wishlist`}
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-md"
                >
                  <Trash2 size={18} />
                </button>
                <Link
                  to={`/product/${product._id}`}
                  aria-label={`View ${product.name}`}
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
                  disabled={pending !== null || !isProductInStock(product)}
                  onClick={() => addToCart(product)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  {pending === product._id ? 'Adding…' : isProductInStock(product) ? 'Add to Cart' : 'Out of stock'}
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
