import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { useCart, useAuth } from '../hooks';

export const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, isLoading, updateQuantity, removeItem, subtotal, tax, shipping, total, discount } = useCart();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const getProductId = (productId: string | { _id: string }) =>
    typeof productId === 'string' ? productId : productId._id;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#E8DFD0] border-t-[#8B5A2B] rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-[#A67B5B] text-sm">Loading cart…</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={36} className="text-[#D4C4A8]" />
          </div>
          <h1 className="text-2xl font-bold text-[#5D3A1A] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Your Cart is Empty
          </h1>
          <p className="text-[#A67B5B] mb-8">Looks like you haven't added anything yet. Start exploring our curated collection!</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={18} /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white border border-[#E8DFD0] rounded-xl hover:bg-[#F5F1E8] transition-colors"
          >
            <ArrowLeft size={20} className="text-[#5D3A1A]" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Shopping Cart
            </h1>
            <p className="text-sm text-[#A67B5B] mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div
                key={`${getProductId(item.productId)}-${index}`}
                className="bg-white rounded-2xl border border-[#E8DFD0] p-5 flex gap-5 animate-fade-in-up transition-shadow hover:shadow-md"
              >
                {/* Image */}
                <Link to={`/product/${getProductId(item.productId)}`} className="flex-shrink-0">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                    alt={item.name}
                    className="w-24 h-24 lg:w-28 lg:h-28 object-cover rounded-xl border border-[#E8DFD0]"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'; }}
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${getProductId(item.productId)}`}>
                    <h3 className="font-semibold text-[#5D3A1A] mb-1 hover:text-[#8B5A2B] transition-colors line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-[#8B5A2B] font-bold text-lg mb-3">₦{item.price.toLocaleString()}</p>

                  {/* Quantity */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#E8DFD0] rounded-xl overflow-hidden bg-[#FAF7F2]">
                      <button
                        onClick={() => updateQuantity(getProductId(item.productId), item.quantity - 1, item.variantId)}
                        disabled={isLoading || item.quantity <= 1}
                        className="w-9 h-9 flex items-center justify-center text-[#A67B5B] hover:bg-[#F5F1E8] disabled:opacity-40 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-[#5D3A1A]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(getProductId(item.productId), item.quantity + 1, item.variantId)}
                        disabled={isLoading}
                        className="w-9 h-9 flex items-center justify-center text-[#A67B5B] hover:bg-[#F5F1E8] disabled:opacity-40 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(getProductId(item.productId), item.variantId)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>

                {/* Line total */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-[#5D3A1A]">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm text-[#8B5A2B] hover:text-[#6B4423] font-medium transition-colors group mt-2"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#E8DFD0] p-6 sticky top-24">
              <h2 className="text-xl font-bold text-[#5D3A1A] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm text-[#A67B5B]">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-sm text-[#A67B5B]">
                    <span>Tax (7.5%)</span>
                    <span>₦{tax.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-[#A67B5B]">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : `₦${shipping.toLocaleString()}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-emerald-600"><Tag size={12} /> Discount</span>
                    <span className="text-emerald-600 font-medium">-₦{discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-[#F5F1E8] pt-4 mb-6">
                <div className="flex justify-between font-bold text-[#5D3A1A]">
                  <span className="text-lg">Total</span>
                  <span className="text-xl text-[#8B5A2B]">₦{total.toLocaleString()}</span>
                </div>
                {subtotal >= 10000 && (
                  <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">✓ You qualify for free shipping!</p>
                )}
              </div>

              <button
                onClick={() => navigate('/checkout')}
                disabled={isLoading || items.length === 0}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 rounded-xl text-base mb-3"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <p className="text-xs text-center text-[#A67B5B] flex items-center justify-center gap-1">
                🔒 Secure checkout powered by Flutterwave
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
