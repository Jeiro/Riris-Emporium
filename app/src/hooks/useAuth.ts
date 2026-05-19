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

  // Dev-only force admin/auth toggle for local testing
  const devForceAdmin = import.meta.env.DEV && localStorage.getItem('DEV_FORCE_ADMIN') === 'true';

  return {
    user: devForceAdmin ? { ...(user || {}), role: 'admin', firstName: 'Dev' } : user,
    isAuthenticated: devForceAdmin ? true : isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    changePassword,
    clearError,
    isAdmin: devForceAdmin ? true : (user?.role === 'admin')
  };
};
