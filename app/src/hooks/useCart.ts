import { useEffect } from 'react';
import { useCartStore } from '../store';

export const useCart = () => {
  const {
    cart,
    isLoading,
    itemCount,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    mergeCart
  } = useCartStore();

  useEffect(() => {
    // Generate session ID for guest users
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      localStorage.setItem('sessionId', Math.random().toString(36).substring(2, 15));
    }
    
    // Fetch cart on mount
    fetchCart();
  }, []);

  return {
    cart,
    isLoading,
    itemCount,
    items: cart?.items || [],
    subtotal: cart?.subtotal || 0,
    tax: cart?.tax || 0,
    shipping: cart?.shipping || 0,
    total: cart?.total || 0,
    discount: cart?.discount || 0,
    couponCode: cart?.couponCode,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    mergeCart
  };
};
