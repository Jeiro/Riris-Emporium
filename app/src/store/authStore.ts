import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.login(credentials);
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          const errorMessage = error.message || 'Registration failed';
          set({
            error: errorMessage,
            isLoading: false
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          if (import.meta.env.DEV) console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null
          });
        }
      },

      // Checks live Supabase session instead of relying on localStorage tokens
      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }
          const user = await authService.getMe();
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.updateProfile(data);
          set({
            user,
            isLoading: false
          });
        } catch (error: any) {
          set({
            error: error.message || 'Update failed',
            isLoading: false
          });
          throw error;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await authService.changePassword(currentPassword, newPassword);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.message || 'Password change failed',
            isLoading: false
          });
          throw error;
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);
