import { supabase } from '../lib/supabase';
import type { LoginCredentials, RegisterData, User } from '../types';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  // Register with Supabase only
  register: async (data: RegisterData): Promise<AuthData> => {
    try {
      // Validate input
      if (!data.email || !data.password) {
        throw new Error('Email and password are required');
      }
      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Register with Supabase Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.firstName || '',
            lastName: data.lastName || ''
          }
        }
      });

      if (error) {
        let errorMessage = error.message || 'Registration failed';
        if (error.message?.includes('already registered')) {
          errorMessage = 'This email is already registered. Please login instead.';
        } else if (error.message?.includes('Password')) {
          errorMessage = 'Password does not meet requirements (min 6 characters)';
        }
        throw new Error(errorMessage);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create user profile in database
      const profileDataToInsert: Record<string, string | null | undefined> = {
        id: authData.user.id,
        email: authData.user.email || '',
        name: data.firstName || '',
        last_name: data.lastName || '',
        role: 'customer',
        phone: data.phone || null,
        avatar_url: null,
        bio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: insertedProfile, error: profileError } = await supabase
        .from('users')
        .insert([profileDataToInsert])
        .select()
        .single();

      if (profileError) {
        if (profileError.message?.includes('permission') || profileError.code === 'PGRST301') {
          throw new Error('Database permission error. Check RLS policies are correctly set.');
        }
        console.debug('Profile sync info:', profileError.code);
      }

      const session = authData.session;

      if (session) {
        localStorage.setItem('accessToken', session.access_token);
        localStorage.setItem('refreshToken', session.refresh_token);
      }

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || '',
          firstName: insertedProfile?.name || data.firstName || '',
          lastName: insertedProfile?.last_name || data.lastName || '',
          role: insertedProfile?.role || 'customer'
        },
        accessToken: session?.access_token || '',
        refreshToken: session?.refresh_token || ''
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Registration error:', err);
      throw new Error(err.message || 'Registration failed. Please try again.');
    }
  },

  // Login with Supabase only
  login: async (credentials: LoginCredentials): Promise<AuthData> => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw error;
      if (!authData.user || !authData.session) throw new Error('Login failed');

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Store tokens
      localStorage.setItem('accessToken', authData.session.access_token);
      localStorage.setItem('refreshToken', authData.session.refresh_token);

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || '',
          firstName: profileData?.name || '',
          lastName: profileData?.last_name || '',
          role: profileData?.role || 'customer'
        },
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new Error(err.message || 'Login failed. Please check your credentials.');
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase logout error:', error);
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error || !data.session) throw error;

      localStorage.setItem('accessToken', data.session.access_token);
      localStorage.setItem('refreshToken', data.session.refresh_token);

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token
      };
    } catch (error: unknown) {
      console.error('Token refresh error:', error);
      throw new Error('Token refresh failed');
    }
  },

  // Get current user
  getMe: async (): Promise<User> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) throw error;

      // Fetch full profile data
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      return {
        id: user.id,
        email: user.email || '',
        firstName: profileData?.name || user.user_metadata?.name || '',
        lastName: profileData?.last_name || user.user_metadata?.lastName || '',
        role: profileData?.role || 'customer'
      };
    } catch (error: unknown) {
      console.error('Fetch user error:', error);
      throw new Error('Failed to fetch user data');
    }
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Forgot password error:', error);
      throw new Error('Failed to send password reset email');
    }
  },

  // Reset password
  resetPassword: async (_token: string, password: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      throw new Error('Failed to reset password');
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Verify email error:', error);
      throw new Error('Failed to verify email');
    }
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError;

      // Update auth user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: data.firstName || '',
          lastName: data.lastName || ''
        }
      });
      if (updateError) throw updateError;

      // Update profile in database
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .update({
          name: data.firstName,
          last_name: data.lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      return {
        id: user.id,
        email: user.email || '',
        firstName: profileData?.name || '',
        lastName: profileData?.last_name || '',
        role: profileData?.role || 'customer'
      };
    } catch (error: unknown) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  },

  // Change password
  changePassword: async (_currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    } catch (error: unknown) {
      console.error('Change password error:', error);
      throw new Error('Failed to change password');
    }
  }
};
