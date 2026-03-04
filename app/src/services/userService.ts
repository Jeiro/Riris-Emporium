import api from './api';
import type { ApiResponse, User, ShippingAddress, PaginationMeta } from '../types';

interface UsersResponse {
  data: User[];
  meta: PaginationMeta;
}

export const userService = {
  // Get profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/users/profile');
    return response.data.data.user;
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<{ user: User }>>('/users/profile', data);
    return response.data.data.user;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put<ApiResponse<void>>('/users/password', { currentPassword, newPassword });
  },

  // Add address
  addAddress: async (address: Omit<ShippingAddress, '_id'>): Promise<ShippingAddress[]> => {
    const response = await api.post<ApiResponse<ShippingAddress[]>>('/users/addresses', address);
    return response.data.data;
  },

  // Update address
  updateAddress: async (
    addressId: string,
    address: Partial<ShippingAddress>
  ): Promise<ShippingAddress[]> => {
    const response = await api.put<ApiResponse<ShippingAddress[]>>(
      `/users/addresses/${addressId}`,
      address
    );
    return response.data.data;
  },

  // Delete address
  deleteAddress: async (addressId: string): Promise<ShippingAddress[]> => {
    const response = await api.delete<ApiResponse<ShippingAddress[]>>(
      `/users/addresses/${addressId}`
    );
    return response.data.data;
  },

  // Get all users (admin)
  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<UsersResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    
    const response = await api.get<ApiResponse<User[]>>(`/users/admin/all?${queryParams}`);
    return {
      data: response.data.data,
      meta: response.data.meta!
    };
  },

  // Get user (admin)
  getUser: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/admin/${id}`);
    return response.data.data;
  },

  // Update user (admin)
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/admin/${id}`, data);
    return response.data.data;
  },

  // Delete user (admin)
  deleteUser: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/users/admin/${id}`);
  },

  // Get user stats (admin)
  getUserStats: async (): Promise<{
    total: number;
    newThisMonth: number;
    admins: number;
    active: number;
  }> => {
    const response = await api.get<ApiResponse<any>>('/users/admin/stats');
    return response.data.data;
  }
};
