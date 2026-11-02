import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services';
import { clearVerifiedUser, refreshVerifiedUser, verifiedSession } from '../lib/verifiedSession';

let authIntent = 0;
let profileRequest = 0;

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
      isLoading: true,
      error: null,

      login: async (credentials) => {
        const intent = ++authIntent;
        clearVerifiedUser();
        set({ user: null, isAuthenticated: false, isLoading: true, error: null });
        try {
          const data = await authService.login(credentials);
          if (intent !== authIntent) throw new Error('Sign-in was cancelled.');
          await refreshVerifiedUser();
          if (intent !== authIntent || verifiedSession.getState().userId !== data.user.id) throw new Error('Could not verify your account. Please sign in again.');
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          if (intent === authIntent) set({ user: null, isAuthenticated: false, isLoading: false, error: error instanceof Error ? error.message : 'Login failed' });
          throw error;
        }
      },

      register: async (data) => {
        const intent = ++authIntent;
        clearVerifiedUser();
        set({ user: null, isAuthenticated: false, isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          if (intent !== authIntent) throw new Error('Registration was cancelled.');
          await refreshVerifiedUser();
          if (intent !== authIntent) return;
          const authenticated = verifiedSession.getState().userId === response.user.id;
          set({ user: authenticated ? response.user : null, isAuthenticated: authenticated, isLoading: false });
        } catch (error) {
          if (intent === authIntent) set({ isLoading: false, error: error instanceof Error ? error.message : 'Registration failed' });
          throw error;
        }
      },

      logout: async () => {
        ++authIntent;
        // Clear verified identity and all cart observers before sign-out can wait on network.
        clearVerifiedUser();
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        await authService.logout();
      },

      fetchUser: async () => {
        const expected = verifiedSession.getState().userId;
        const request = ++profileRequest;
        if (!expected) return;
        set({ isLoading: true });
        try {
          const user = await authService.getMe();
          if (request !== profileRequest || verifiedSession.getState().userId !== expected || user.id !== expected) return;
          set({ user, isAuthenticated: true, isLoading: false, error: null });
        } catch {
          if (request === profileRequest && verifiedSession.getState().userId === expected) {
            set({ user: null, isAuthenticated: false, isLoading: false, error: 'Could not load your account. Please sign in again.' });
          }
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

// Cross-tab/session changes invalidate persisted UI identity and old profile requests.
verifiedSession.subscribe(identity => {
  ++profileRequest;
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: identity.isLoading || Boolean(identity.userId) });
  if (identity.userId) void useAuthStore.getState().fetchUser();
});
