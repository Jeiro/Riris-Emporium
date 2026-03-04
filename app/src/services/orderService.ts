import api from './api';
import { supabase } from '../lib/supabase';
import type { ApiResponse, Order, Address, PaginationMeta } from '../types';

interface OrdersResponse {
  data: Order[];
  meta: PaginationMeta;
}

export const orderService = {
  // Create order
  createOrder: async (
    shippingAddress: Address,
    billingAddress?: Address,
    notes?: string
  ): Promise<Order> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          shipping_address: shippingAddress,
          billing_address: billingAddress,
          notes,
          status: 'pending',
          total: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        items: data.items || [],
        total: data.total,
        status: data.status,
        shippingAddress: data.shipping_address,
        billingAddress: data.billing_address,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Supabase error creating order:', error);
      // Fallback to API
      const response = await api.post<ApiResponse<Order>>('/orders', {
        shippingAddress,
        billingAddress,
        notes
      });
      return response.data.data;
    }
  },

  // Get user orders
  getOrders: async (params?: { page?: number; limit?: number; status?: string }): Promise<OrdersResponse> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id);

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      // Get total count
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: (data || []).map(o => ({
          id: o.id,
          userId: o.user_id,
          items: o.items || [],
          total: o.total,
          status: o.status,
          shippingAddress: o.shipping_address,
          billingAddress: o.billing_address,
          notes: o.notes,
          createdAt: o.created_at,
          updatedAt: o.updated_at
        })),
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Supabase error fetching orders:', error);
      // Fallback to API
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.status) queryParams.append('status', params.status);
      
      const response = await api.get<ApiResponse<Order[]>>(`/orders?${queryParams}`);
      return {
        data: response.data.data,
        meta: response.data.meta!
      };
    }
  },

  // Get single order
  getOrder: async (id: string): Promise<Order> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        items: data.items || [],
        total: data.total,
        status: data.status,
        shippingAddress: data.shipping_address,
        billingAddress: data.billing_address,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Supabase error fetching order:', error);
      // Fallback to API
      const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
      return response.data.data;
    }
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<Order> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        items: data.items || [],
        total: data.total,
        status: data.status,
        shippingAddress: data.shipping_address,
        billingAddress: data.billing_address,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Supabase error cancelling order:', error);
      // Fallback to API
      const response = await api.put<ApiResponse<Order>>(`/orders/${id}/cancel`);
      return response.data.data;
    }
  },

  // Get all orders (admin)
  getAllOrders: async (
    page = 1,
    limit = 20,
    filters?: { status?: string; search?: string }
  ): Promise<OrdersResponse> => {
    try {
      const offset = (page - 1) * limit;

      let query = supabase.from('orders').select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      // Get total count
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: (data || []).map(o => ({
          id: o.id,
          userId: o.user_id,
          items: o.items || [],
          total: o.total,
          status: o.status,
          shippingAddress: o.shipping_address,
          billingAddress: o.billing_address,
          notes: o.notes,
          createdAt: o.created_at,
          updatedAt: o.updated_at
        })),
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Supabase error fetching all orders:', error);
      // Fallback to API
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      
      const response = await api.get<ApiResponse<Order[]>>(`/orders/admin/all?${params}`);
      return {
        data: response.data.data,
        meta: response.data.meta!
      };
    }
  },

  // Update order status (admin)
  updateOrderStatus: async (
    id: string,
    status: string,
    trackingNumber?: string
  ): Promise<Order> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        items: data.items || [],
        total: data.total,
        status: data.status,
        shippingAddress: data.shipping_address,
        billingAddress: data.billing_address,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Supabase error updating order status:', error);
      // Fallback to API
      const response = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, {
        status,
        trackingNumber
      });
      return response.data.data;
    }
  },

  // Get order stats (admin)
  getOrderStats: async (): Promise<{
    overview: {
      total: number;
      pending: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
    totalRevenue: number;
    recentOrders: Order[];
  }> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const orders = data || [];
      const statusCounts = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      };

      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

      return {
        overview: statusCounts,
        totalRevenue,
        recentOrders: orders.slice(0, 10).map(o => ({
          id: o.id,
          userId: o.user_id,
          items: o.items || [],
          total: o.total,
          status: o.status,
          shippingAddress: o.shipping_address,
          billingAddress: o.billing_address,
          notes: o.notes,
          createdAt: o.created_at,
          updatedAt: o.updated_at
        }))
      };
    } catch (error) {
      console.error('Supabase error fetching order stats:', error);
      // Fallback to API
      const response = await api.get<ApiResponse<any>>('/orders/admin/stats');
      return response.data.data;
    }
  }
};
