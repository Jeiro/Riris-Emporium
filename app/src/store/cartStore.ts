import { create } from 'zustand';
import type { Cart } from '../types';
import { cartService } from '../services';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (productId: string, itemData: { name: string; price: number; image: string; quantity: number }) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  removeItem: (productId: string, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  mergeCart: (sessionId: string) => Promise<void>;
}

const calculateItemCount = (cart: Cart | null): number => {
  if (!cart || !cart.items) return 0;
  return cart.items.reduce((total, item) => total + item.quantity, 0);
};

export const useCartStore = create<CartState>()((set) => ({
  cart: null,
  isLoading: false,
  itemCount: 0,

  fetchCart: async () => {
    try {
      const cart = await cartService.getCart();
      set({
        cart,
        itemCount: calculateItemCount(cart)
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Fetch cart error:', error);
    }
  },

  addItem: async (productId: string, itemData: { name: string; price: number; image: string; quantity: number }) => {
    set({ isLoading: true });
    try {
      if (!productId) {
        throw new Error('Invalid product: missing ID');
      }
      const cart = await cartService.addItem(productId, itemData);
      set({
        cart,
        itemCount: calculateItemCount(cart),
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (productId: string, quantity: number, variantId?: string) => {
    set({ isLoading: true });
    try {
      const cart = await cartService.updateItem(productId, quantity, variantId);
      set({
        cart,
        itemCount: calculateItemCount(cart),
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  removeItem: async (productId: string, variantId?: string) => {
    set({ isLoading: true });
    try {
      const cart = await cartService.removeItem(productId, variantId);
      set({
        cart,
        itemCount: calculateItemCount(cart),
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartService.clearCart();
      set({
        cart,
        itemCount: 0,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  applyCoupon: async (code: string) => {
    set({ isLoading: true });
    try {
      const cart = await cartService.applyCoupon(code);
      set({
        cart,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  removeCoupon: async () => {
    set({ isLoading: true });
    try {
      const cart = await cartService.removeCoupon();
      set({
        cart,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  mergeCart: async (sessionId: string) => {
    try {
      const cart = await cartService.mergeCart(sessionId);
      set({
        cart,
        itemCount: calculateItemCount(cart)
      });
      localStorage.removeItem('sessionId');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Merge cart error:', error);
    }
  }
}));
