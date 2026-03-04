import { supabase } from '../lib/supabase';
import type { User, ShippingAddress, PaginationMeta } from '../types';

interface UsersResponse {
  data: User[];
  meta: PaginationMeta;
}

export const userService = {
  // Get profile
  getProfile: async (): Promise<User> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw authError;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      firstName: data.name,
      lastName: data.last_name,
      role: data.role || 'customer'
    };
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw authError;

    const { data: updatedData, error } = await supabase
      .from('users')
      .update({
        name: data.firstName,
        last_name: data.lastName,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: updatedData.id,
      email: updatedData.email,
      firstName: updatedData.name,
      lastName: updatedData.last_name,
      role: updatedData.role
    };
  },

  // Change password
  changePassword: async (_currentPassword: string, newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  // Add address
  addAddress: async (address: Omit<ShippingAddress, '_id'>): Promise<ShippingAddress[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Addresses are stored in user metadata or a separate table.
    // Assuming a 'user_addresses' table for this implementation.
    const { data, error } = await supabase
      .from('user_addresses')
      .insert({ ...address, user_id: user.id })
      .select();

    if (error) throw error;
    return data as any[];
  },

  // Update address
  updateAddress: async (
    addressId: string,
    address: Partial<ShippingAddress>
  ): Promise<ShippingAddress[]> => {
    const { data, error } = await supabase
      .from('user_addresses')
      .update(address)
      .eq('id', addressId)
      .select();

    if (error) throw error;
    return data as any[];
  },

  // Delete address
  deleteAddress: async (addressId: string): Promise<ShippingAddress[]> => {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;

    // Fetch remaining addresses
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('user_addresses').select('*').eq('user_id', user?.id);
    return data || [];
  },

  // Get all users (admin)
  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<UsersResponse> => {
    let query = supabase.from('users').select('*', { count: 'exact' });

    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }
    if (params?.role) {
      query = query.eq('role', params.role);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const offset = (page - 1) * limit;

    const { data, count, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: (data || []).map(d => ({
        id: d.id,
        email: d.email,
        firstName: d.name,
        lastName: d.last_name,
        role: d.role
      })),
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  },

  // Get user (admin)
  getUser: async (id: string): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      id: data.id,
      email: data.email,
      firstName: data.name,
      lastName: data.last_name,
      role: data.role
    };
  },

  // Update user (admin)
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const { data: updatedData, error } = await supabase
      .from('users')
      .update({
        name: data.firstName,
        last_name: data.lastName,
        role: data.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      id: updatedData.id,
      email: updatedData.email,
      firstName: updatedData.name,
      lastName: updatedData.last_name,
      role: updatedData.role
    };
  },

  // Delete user (admin)
  deleteUser: async (id: string): Promise<void> => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  },

  // Get user stats (admin)
  getUserStats: async (): Promise<{
    total: number;
    newThisMonth: number;
    admins: number;
    active: number;
  }> => {
    const { count: total } = await supabase.from('users').select('*', { count: 'exact', head: true });

    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { count: newThisMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString());

    const { count: admins } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    return {
      total: total || 0,
      newThisMonth: newThisMonth || 0,
      admins: admins || 0,
      active: total || 0 // Simulated active
    };
  }
};
