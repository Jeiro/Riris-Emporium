import { supabase } from '../lib/supabase';
import type { Cart } from '../types';

export const cartService = {
  // Get cart
  getCart: async (): Promise<Cart> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Handle guest users (not authenticated)
      if (!user) {
        // Return empty guest cart
        return {
          id: '',
          items: [],
          total: 0,
          coupon: undefined,
          discountAmount: 0
        };
      }

      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      return data || {
        id: '',
        items: [],
        total: 0,
        coupon: undefined,
        discountAmount: 0
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching cart:', error);
      }
      // Return empty cart instead of fallback to prevent API errors
      return {
        id: '',
        items: [],
        total: 0,
        coupon: undefined,
        discountAmount: 0
      };
    }
  },

  // Add item to cart
  addItem: async (productId: string, itemData: { name: string; price: number; image: string; quantity: number }): Promise<Cart> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get or create cart
      let { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!cart && !cartError) {
        // Create new cart
        const { data: newCart, error } = await supabase
          .from('carts')
          .insert({
            user_id: user.id,
            items: [],
            total: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        cart = newCart;
      } else if (cartError) {
        throw cartError;
      }

      // Add item to cart with product data
      const { data: updatedCart, error } = await supabase
        .from('carts')
        .update({
          items: [...(cart?.items || []), { 
            productId, 
            name: itemData.name,
            price: itemData.price,
            image: itemData.image,
            quantity: itemData.quantity 
          }],
          updated_at: new Date().toISOString()
        })
        .eq('id', cart!.id)
        .select()
        .single();

      if (error) throw error;

      return updatedCart || { id: '', items: [], total: 0 };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error adding item to cart:', error);
      }
      throw error;
    }
  },

  // Update item quantity
  updateItem: async (productId: string, quantity: number, variantId?: string): Promise<Cart> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (cartError) throw cartError;

      // Update item
      const updatedItems = (cart?.items || []).map((item: any) => {
        if (item.productId === productId && item.variantId === variantId) {
          return { ...item, quantity };
        }
        return item;
      });

      const { data: updatedCart, error } = await supabase
        .from('carts')
        .update({
          items: updatedItems,
          updated_at: new Date().toISOString()
        })
        .eq('id', cart!.id)
        .select()
        .single();

      if (error) throw error;

      return updatedCart || { id: '', items: [], total: 0 };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating cart item:', error);
      }
      throw error;
    }
  },

  // Remove item from cart
  removeItem: async (productId: string, variantId?: string): Promise<Cart> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (cartError) throw cartError;

      // Remove item
      const updatedItems = (cart?.items || []).filter((item: any) => {
        return !(item.productId === productId && item.variantId === variantId);
      });

      const { data: updatedCart, error } = await supabase
        .from('carts')
        .update({
          items: updatedItems,
          updated_at: new Date().toISOString()
        })
        .eq('id', cart!.id)
        .select()
        .single();

      if (error) throw error;

      return updatedCart || { id: '', items: [], total: 0 };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error removing cart item:', error);
      }
      throw error;
    }
  },

  // Clear cart
  clearCart: async (): Promise<Cart> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: updatedCart, error } = await supabase
        .from('carts')
        .update({
          items: [],
          coupon: null,
          discount_amount: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return updatedCart || { id: '', items: [], total: 0 };
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Apply coupon
  applyCoupon: async (code: string): Promise<Cart> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get coupon details
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .single();

      if (couponError) throw couponError;

      const { data: updatedCart, error } = await supabase
        .from('carts')
        .update({
          coupon: code,
          discount_amount: coupon?.discount || 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return updatedCart || { id: '', items: [], total: 0 };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error applying coupon:', error);
      }
      throw error;
    }
  },

  // Remove coupon
  removeCoupon: async (): Promise<Cart> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: updatedCart, error } = await supabase
        .from('carts')
        .update({
          coupon: null,
          discount_amount: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return updatedCart || { id: '', items: [], total: 0 };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error removing coupon:', error);
      }
      throw error;
    }
  },

  // Merge guest cart with user cart
  mergeCart: async (_sessionId: string): Promise<Cart> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Implementation depends on your guest cart storage mechanism
      // For now, return empty cart as guest carts are not yet implemented
      return {
        id: '',
        items: [],
        total: 0,
        coupon: undefined,
        discountAmount: 0
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error merging cart:', error);
      }
      throw error;
    }
  }
};
