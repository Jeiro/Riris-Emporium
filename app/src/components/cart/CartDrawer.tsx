import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../hooks';
import { useUIStore } from '../../store';

export const CartDrawer = () => {
  const { isCartOpen, closeCart } = useUIStore();
  const {
    items = [],
    isLoading = false,
    updateQuantity,
    removeItem,
    subtotal = 0,
  } = useCart();
  const navigate = useNavigate();

  // Calculate totals from items if useCart doesn't provide them
  const calculateSubtotal = () => {
    return items.reduce((sum, item) =>
      sum + ((item.price || 0) * (item.quantity || 1)),
      0
    );
  };

  const calculatedSubtotal = subtotal && subtotal > 0 ? subtotal : calculateSubtotal();
  const calculatedTax = calculatedSubtotal * 0.075;
  const calculatedShipping = 0; // Free shipping
  const calculatedTotal = calculatedSubtotal + calculatedTax + calculatedShipping;

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };

    if (isCartOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, closeCart]);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    closeCart();
    navigate('/shop');
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#FAF7F2] shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E8DFD0]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-[#8B5A2B]" size={24} />
            <h2 className="text-xl font-semibold text-[#5D3A1A]">
              Your Cart ({items.length})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-[#5D3A1A] hover:bg-[#F5F1E8] rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-[#F5F1E8] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="text-[#A67B5B]" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-[#5D3A1A] mb-2">
              Your cart is empty
            </h3>
            <p className="text-[#A67B5B] mb-6">
              Looks like you haven&apos;t added anything to your cart yet
            </p>
            <button
              onClick={handleContinueShopping}
              className="px-6 py-2 bg-[#8B5A2B] hover:bg-[#6B4423] text-white rounded-lg font-medium transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex gap-4 p-3 bg-white rounded-lg border border-[#E8DFD0]"
                  >
                    {/* Product Image */}
                    <img
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name || 'Product'}
                      className="w-20 h-20 object-cover rounded-lg bg-[#F5F1E8]"
                    />

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[#5D3A1A] truncate">
                        {item.name || 'Unknown Product'}
                      </h4>
                      <p className="text-sm text-[#A67B5B] mb-2">
                        ₦{((item.price || 0).toLocaleString())}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                typeof item.productId === 'string' ? item.productId : (item.productId as any)._id,
                                (item.quantity || 1) - 1,
                                item.variantId
                              )
                            }
                            disabled={isLoading || (item.quantity || 1) <= 1}
                            className="w-8 h-8 flex items-center justify-center bg-[#F5F1E8] hover:bg-[#E8DFD0] rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-medium text-[#5D3A1A]">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                typeof item.productId === 'string' ? item.productId : (item.productId as any)._id,
                                (item.quantity || 1) + 1,
                                item.variantId
                              )
                            }
                            disabled={isLoading}
                            className="w-8 h-8 flex items-center justify-center bg-[#F5F1E8] hover:bg-[#E8DFD0] rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(
                              typeof item.productId === 'string' ? item.productId : (item.productId as any)._id,
                              item.variantId
                            )
                          }
                          disabled={isLoading}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-semibold text-[#8B5A2B]">
                        ₦{(((item.price || 0) * (item.quantity || 1)).toLocaleString())}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#E8DFD0] p-4 space-y-4 bg-white">
              {/* Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#A67B5B]">
                  <span>Subtotal</span>
                  <span>₦{calculatedSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#A67B5B]">
                  <span>Tax (7.5%)</span>
                  <span>₦{calculatedTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#A67B5B]">
                  <span>Shipping</span>
                  <span>{calculatedShipping === 0 ? 'Free' : `₦${(calculatedShipping as number).toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-[#5D3A1A] pt-2 border-t border-[#E8DFD0]">
                  <span>Total</span>
                  <span>₦{calculatedTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-[#8B5A2B] hover:bg-[#6B4423] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>
              <button
                onClick={handleContinueShopping}
                className="w-full border-2 border-[#8B5A2B] text-[#8B5A2B] hover:bg-[#F5F1E8] py-3 rounded-lg font-medium transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
