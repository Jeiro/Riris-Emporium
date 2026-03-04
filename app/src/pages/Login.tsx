import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks';
import { useUIStore } from '../store';

interface LocationState {
  from?: { pathname: string };
}

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      addNotification({ type: 'success', message: 'Welcome back! 👋' });
      navigate(from, { replace: true });
    } catch { }
  };

  const testimonials = [
    { text: "Absolutely love the quality! My new favorite store.", author: "Amara K." },
    { text: "Fast shipping, stunning packaging. 10/10 experience.", author: "David O." },
    { text: "The curation here is unmatched. Always find something special.", author: "Funmi A." },
  ];

  return (
    <div className="min-h-screen flex bg-[#FAF7F2]">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#5D3A1A] to-[#8B5A2B]">
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-pattern opacity-40" />
        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#5D3A1A]/60 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <span className="text-white text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>R</span>
            </div>
            <div>
              <span className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Riris</span>
              <span className="text-xs text-white/70 uppercase tracking-widest ml-2">Emporium</span>
            </div>
          </Link>

          {/* Center content */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={20} className="text-[#D4C4A8]" />
              <span className="text-[#D4C4A8] text-sm uppercase tracking-widest font-medium">Customer Stories</span>
            </div>
            <blockquote className="text-3xl font-light leading-relaxed mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
              "Discover elegance, curated just for you."
            </blockquote>

            {/* Testimonials */}
            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-5 py-4">
                  <p className="text-white/90 text-sm italic mb-2">"{t.text}"</p>
                  <p className="text-[#D4C4A8] text-xs font-medium">— {t.author}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Riris Emporium. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 animate-fade-in">
        {/* Back to home */}
        <div className="w-full max-w-md mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#A67B5B] hover:text-[#8B5A2B] transition-colors">
            <ArrowLeft size={16} /> Back to store
          </Link>
        </div>

        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <span className="text-3xl font-bold text-[#8B5A2B]" style={{ fontFamily: 'Playfair Display, serif' }}>Riris</span>
          <span className="text-sm text-[#A67B5B] uppercase tracking-widest ml-2">Emporium</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#5D3A1A] mb-2">Welcome back</h1>
            <p className="text-[#A67B5B]">Sign in to your account to continue shopping.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#5D3A1A] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 border border-[#D4C4A8] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/25 focus:border-[#8B5A2B] transition-all text-[#5D3A1A] placeholder:text-[#A67B5B]/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-[#5D3A1A]">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#8B5A2B] hover:text-[#6B4423] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-12 py-3.5 border border-[#D4C4A8] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/25 focus:border-[#8B5A2B] transition-all text-[#5D3A1A] placeholder:text-[#A67B5B]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A67B5B] hover:text-[#8B5A2B] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 rounded-xl text-base mt-2"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={18} /> Signing in…</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-[#A67B5B]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#8B5A2B] font-semibold hover:text-[#6B4423] transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
