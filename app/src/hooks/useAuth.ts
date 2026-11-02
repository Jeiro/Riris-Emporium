import { useVerifiedUser } from './useVerifiedUser';
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

  const identity = useVerifiedUser();
  const verified = !identity.isLoading && identity.userId === user?.id;

  // Dev-only force admin/auth toggle for local testing
  const devForceAdmin = import.meta.env.DEV && localStorage.getItem('DEV_FORCE_ADMIN') === 'true';

  return {
    user: devForceAdmin ? { ...(user || {}), role: 'admin', firstName: 'Dev' } : verified ? user : null,
    isAuthenticated: devForceAdmin ? true : verified && isAuthenticated,
    isLoading: identity.isLoading || isLoading,
    verificationError: identity.error,
    retryVerification: identity.retry,
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
