import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  Star,
  Minus,
  Plus,
  Check,
  Info
} from 'lucide-react';
import { productService } from '../services';
import type { Product } from '../types';
import { isProductInStock, isProductLowStock } from '../types';
import { useCart } from '../hooks';
import { useUIStore } from '../store';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'shipping' | 'reviews'>('description');

  const { addItem } = useCart();
  const { openCart, addNotification } = useUIStore();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await productService.getProduct(id);
        setProduct(data);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching product:', error);
        }
        navigate('/shop');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!product || isAdding) return;

    setIsAdding(true);
    try {
      const productImage = product.images && product.images.length > 0
        ? product.images[selectedImage]
        : '/placeholder-product.jpg';

      await addItem(product._id || (product as any).id, {
        name: product.name,
        price: product.price,
        image: productImage,
        quantity: quantity
      });
      addNotification({
        type: 'success',
        message: `${product.name} added to cart`
      });
      openCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to cart';
      addNotification({
        type: 'error',
        message
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A2B]"></div>
          <p className="text-[#A67B5B] font-medium animate-pulse">Loading perfection...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="text-center">
          <Info size={48} className="mx-auto text-[#D4C4A8] mb-4" />
          <h2 className="text-2xl font-bold text-[#5D3A1A] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Product Not Found</h2>
          <p className="text-[#A67B5B] mb-6">The item you're looking for might have been moved or removed.</p>
          <button onClick={() => navigate('/shop')} className="btn-primary">Back to Shop</button>
        </div>
      </div>
    );
  }

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20">
      <div className="container-custom pt-8 lg:pt-12">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-[#A67B5B] hover:text-[#8B5A2B] mb-8 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-[#E8DFD0] flex items-center justify-center group-hover:bg-[#8B5A2B] group-hover:text-white transition-all shadow-sm">
            <ChevronLeft size={18} />
          </div>
          <span className="text-sm font-medium">Back to collection</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* ── Left Column: Images ── */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E8DFD0] relative group">
              <img
                src={product.images[selectedImage] || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {discount > 0 && (
                <div className="absolute top-6 left-6 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  -{discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-32 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-sm ${selectedImage === index
                      ? 'border-[#8B5A2B] ring-4 ring-[#8B5A2B]/10 scale-95'
                      : 'border-transparent hover:border-[#D4C4A8]'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right Column: Info ── */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-[#8B5A2B]/10 text-[#8B5A2B] text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                {product.category}
              </span>
              <h1
                className="text-4xl lg:text-5xl font-bold text-[#5D3A1A] leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-[#E8DFD0] shadow-sm">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold text-[#5D3A1A]">{product.ratings.average}</span>
              </div>
              <span className="text-sm text-[#A67B5B] underline underline-offset-4 cursor-pointer hover:text-[#8B5A2B] transition-colors">
                {product.ratings.count} Verified Reviews
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4 mb-8">
              <span className="text-4xl font-bold text-[#8B5A2B]">
                ₦{product.price.toLocaleString()}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-[#A67B5B] line-through mb-1">
                  ₦{product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="p-6 bg-white rounded-3xl border border-[#E8DFD0] shadow-sm mb-8">
              {/* Tabs */}
              <div className="flex gap-8 border-b border-[#F5F1E8] mb-6">
                {['description', 'shipping', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? 'text-[#8B5A2B]' : 'text-[#A67B5B] hover:text-[#5D3A1A]'
                      }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5A2B] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[100px]">
                {activeTab === 'description' && (
                  <p className="text-[#5D3A1A]/80 leading-relaxed text-sm">
                    {product.description}
                  </p>
                )}
                {activeTab === 'shipping' && (
                  <ul className="space-y-3">
                    {['Free standard delivery on orders over ₦10,000', 'Express delivery available (2-3 business days)', '30-day easy return policy'].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[#5D3A1A]/80">
                        <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === 'reviews' && (
                  <p className="text-[#A67B5B] text-sm text-center py-4 italic">No reviews yet for this product. Be the first to share your thoughts!</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center bg-white border border-[#D4C4A8] rounded-2xl p-1 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F5F1E8] disabled:opacity-30 transition-all"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold text-[#5D3A1A]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.inventory.quantity}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F5F1E8] disabled:opacity-30 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Status Badge */}
                <div className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold border ${isProductInStock(product)
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${isProductInStock(product) ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  {isProductInStock(product)
                    ? isProductLowStock(product)
                      ? `Only ${product.inventory.quantity} left!`
                      : 'Available In Stock'
                    : 'Currently Out of Stock'}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || !isProductInStock(product)}
                  className="flex-1 btn-primary h-14 flex items-center justify-center gap-3 shadow-xl shadow-[#8B5A2B]/20 disabled:opacity-50 disabled:shadow-none transition-all hover:-translate-y-1"
                >
                  <ShoppingBag size={20} />
                  <span className="font-bold tracking-wide">
                    {isAdding ? 'Adding to Cart...' : 'Add to Shopping Bag'}
                  </span>
                </button>

                <button className="w-14 h-14 bg-white border border-[#E8DFD0] rounded-2xl flex items-center justify-center text-[#5D3A1A] hover:bg-[#F5F1E8] hover:text-[#8B5A2B] transition-all shadow-sm">
                  <Heart size={22} />
                </button>

                <button className="w-14 h-14 bg-white border border-[#E8DFD0] rounded-2xl flex items-center justify-center text-[#5D3A1A] hover:bg-[#F5F1E8] hover:text-[#8B5A2B] transition-all shadow-sm">
                  <Share2 size={22} />
                </button>
              </div>
            </div>

            {/* Trust Features */}
            <div className="grid grid-cols-3 gap-2 py-8 border-t border-[#E8DFD0]">
              {[
                { icon: Truck, text: 'Free Shipping', sub: 'On all orders' },
                { icon: Shield, text: 'Secure Payment', sub: 'Safe & Encrypted' },
                { icon: RefreshCw, text: 'Easy Returns', sub: '30-day window' }
              ].map((item, i) => (
                <div key={i} className="text-center group">
                  <div className="w-10 h-10 rounded-full bg-[#8B5A2B]/5 border border-[#8B5A2B]/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-[#8B5A2B] group-hover:text-white transition-all">
                    <item.icon size={18} />
                  </div>
                  <p className="text-[10px] font-bold text-[#5D3A1A] uppercase leading-tight mb-0.5">{item.text}</p>
                  <p className="text-[9px] text-[#A67B5B] uppercase tracking-tighter">{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-[#A67B5B] uppercase tracking-widest text-center mt-4">
              SKU: <span className="text-[#5D3A1A] font-bold">{product.sku}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
