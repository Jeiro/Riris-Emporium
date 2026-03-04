import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Store,
  BarChart3,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../hooks';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (item: typeof navItems[0]) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/10 ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4C4A8] to-[#8B5A2B] flex items-center justify-center flex-shrink-0 shadow-md">
          <Store size={18} className="text-[#3B1F0A]" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-white text-base leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>Riris</p>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${active
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/55 hover:bg-white/8 hover:text-white/90'
                } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} className={`flex-shrink-0 ${active ? 'text-[#D4C4A8]' : ''}`} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4C4A8]" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick link to store */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/8 transition-all text-xs font-medium"
          >
            <ExternalLink size={14} /> View Store
          </a>
        </div>
      )}

      {/* User card */}
      <div className={`p-3 border-t border-white/10 ${collapsed ? 'px-2' : ''}`}>
        <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white/8 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4C4A8] to-[#A67B5B] flex items-center justify-center flex-shrink-0 text-[#3B1F0A] font-bold text-sm shadow">
            {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-white/45 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`mt-1 w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={14} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-[#3B1F0A] transition-all duration-300 relative ${isSidebarOpen ? 'w-60' : 'w-16'
          }`}
      >
        <SidebarContent collapsed={!isSidebarOpen} />

        {/* Collapse toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#8B5A2B] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#6B4423] transition-colors z-10"
          title={isSidebarOpen ? 'Collapse' : 'Expand'}
        >
          <ChevronLeft size={12} className={`transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#3B1F0A] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#8B5A2B] flex items-center justify-center">
            <Store size={14} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>Riris Admin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="lg:hidden fixed top-14 left-0 bottom-0 w-64 z-50 bg-[#3B1F0A] flex flex-col animate-slide-in-right">
            <SidebarContent collapsed={false} />
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        <div className="lg:hidden h-14" />
        {children}
      </main>
    </div>
  );
};
