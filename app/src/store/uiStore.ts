import { create } from 'zustand';

interface UIState {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Sidebar/Cart drawer
  isCartOpen: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Mobile menu
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Theme
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  // Cart drawer
  isCartOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  
  // Mobile menu
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  
  // Notifications
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { ...notification, id };
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    // Auto-remove after duration
    const duration = notification.duration || 5000;
    setTimeout(() => {
      get().removeNotification(id);
    }, duration);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }));
  },
  clearNotifications: () => set({ notifications: [] }),
  
  // Loading states
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  
  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isSearchOpen: false,
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false, searchQuery: '' })
}));
