import { useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { useVerifiedUser } from './useVerifiedUser';

export const useCart = () => {
  const state = useCartStore();
  const identity = useVerifiedUser();
  const { status, fetchCart } = state;
  useEffect(() => {
    if (identity.userId && status === 'idle') void fetchCart();
  }, [identity.userId, status, fetchCart]);
  const matches = !identity.isLoading && identity.userId === state.ownerId;
  const cart = matches && state.status === 'ready' ? state.cart : null;
  return {
    ...state, cart, userId: identity.userId,
    isLoading: identity.isLoading || state.isLoading || state.status === 'idle',
    error: identity.error || state.error,
    retry: async () => { if (identity.error) await identity.retry(); else await state.fetchCart(); },
    items: cart?.items ?? [], itemCount: cart ? state.itemCount : 0,
    subtotal: cart?.subtotal ?? 0, tax: cart?.tax ?? 0, shipping: cart?.shipping ?? 0,
    total: cart?.total ?? 0, discount: cart?.discount ?? 0, couponCode: cart?.couponCode,
    notices: cart?.notices ?? [], canCheckout: Boolean(cart?.canCheckout) && !state.isLoading,
    // Event handlers display the store's error state rather than leaking rejections.
    updateQuantity: (...args: Parameters<typeof state.updateQuantity>) => state.updateQuantity(...args).catch(() => {}),
    removeItem: (...args: Parameters<typeof state.removeItem>) => state.removeItem(...args).catch(() => {}),
    clearCart: () => state.clearCart().catch(() => {}),
  };
};
