import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  Menu,
  X,
  Search,
  Heart,
  LogOut,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { useCartStore, useUIStore } from '../../store';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { itemCount } = useCartStore();
  const { openCart, toggleMobileMenu, isMobileMenuOpen, openSearch } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-[#FAF7F2]/90 backdrop-blur-xl shadow-sm border-b border-[#E8DFD0]/60'
          : 'bg-transparent'
        }`}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-[#5D3A1A] hover:bg-[#F5F1E8] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B5A2B] to-[#5D3A1A] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white text-sm font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>R</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl lg:text-2xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Riris
              </span>
              <span className="text-[9px] text-[#A67B5B] uppercase tracking-[0.2em]">
                Emporium
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${isActive(link.href)
                    ? 'text-[#8B5A2B] bg-[#8B5A2B]/8'
                    : 'text-[#5D3A1A] hover:text-[#8B5A2B] hover:bg-[#F5F1E8]'
                  }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#8B5A2B] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={openSearch}
              className="p-2.5 text-[#5D3A1A] hover:bg-[#F5F1E8] rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="hidden sm:flex p-2.5 text-[#5D3A1A] hover:bg-[#F5F1E8] rounded-lg transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={19} />
            </Link>

            {/* User Menu */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-2 text-[#5D3A1A] hover:bg-[#F5F1E8] rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8B5A2B] to-[#5D3A1A] flex items-center justify-center text-white text-xs font-semibold">
                    {user?.firstName?.[0]?.toUpperCase() || <User size={14} />}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{user?.firstName}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-[#8B5A2B] text-white rounded-lg text-sm font-medium hover:bg-[#6B4423] transition-colors"
                >
                  <User size={16} />
                  <span className="hidden md:inline">Sign In</span>
                </Link>
              )}

              {/* User Dropdown */}
              {isUserMenuOpen && isAuthenticated && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#E8DFD0] py-1.5 z-20 animate-scale-in">
                    <div className="px-4 py-2.5 border-b border-[#F5F1E8] mb-1">
                      <p className="text-sm font-semibold text-[#5D3A1A]">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-[#A67B5B] truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5D3A1A] hover:bg-[#F5F1E8] transition-colors"
                    >
                      <User size={16} className="text-[#A67B5B]" />
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5D3A1A] hover:bg-[#F5F1E8] transition-colors"
                    >
                      <ShoppingBag size={16} className="text-[#A67B5B]" />
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#8B5A2B] font-medium hover:bg-[#F5F1E8] transition-colors"
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-[#F5F1E8] mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2.5 text-[#5D3A1A] hover:bg-[#F5F1E8] rounded-lg transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={19} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#8B5A2B] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-[#E8DFD0] animate-fade-in">
          <div className="container-custom py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={toggleMobileMenu}
                className={`flex items-center py-3 px-4 rounded-xl transition-colors font-medium text-sm ${isActive(link.href)
                    ? 'bg-[#8B5A2B]/10 text-[#8B5A2B]'
                    : 'text-[#5D3A1A] hover:bg-[#F5F1E8]'
                  }`}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <div className="border-t border-[#E8DFD0] my-2" />
                <Link
                  to="/profile"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-3 py-3 px-4 rounded-xl text-[#5D3A1A] hover:bg-[#F5F1E8] transition-colors text-sm"
                >
                  <User size={16} className="text-[#A67B5B]" /> My Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={toggleMobileMenu}
                  className="flex items-center gap-3 py-3 px-4 rounded-xl text-[#5D3A1A] hover:bg-[#F5F1E8] transition-colors text-sm"
                >
                  <ShoppingBag size={16} className="text-[#A67B5B]" /> My Orders
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl text-[#8B5A2B] hover:bg-[#F5F1E8] transition-colors text-sm font-medium"
                  >
                    <LayoutDashboard size={16} /> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); toggleMobileMenu(); }}
                  className="flex items-center gap-3 py-3 px-4 w-full rounded-xl text-left text-red-500 hover:bg-red-50 transition-colors text-sm"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
