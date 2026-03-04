import { useEffect } from 'react';
import { useAuthStore } from '../store';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    changePassword,
    clearError
  } = useAuthStore();

  useEffect(() => {
    // Try to fetch user on mount if token exists
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      fetchUser();
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    changePassword,
    clearError,
    isAdmin: user?.role === 'admin'
  };
};
