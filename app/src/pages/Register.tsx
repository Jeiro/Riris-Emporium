import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Store
} from 'lucide-react';
import { useAuth } from '../hooks';
import { useUIStore } from '../store';

export const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const { register, isLoading, error, clearError } = useAuth();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError('');

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined
      });

      addNotification({
        type: 'success',
        message: 'Account created successfully!'
      });
      navigate('/');
    } catch (err) {
      // Error handled by store
    }
  };

  const benefits = [
    'Exclusive early access to New Arrivals',
    'Personalized luxury recommendations',
    'Seamless multi-device checkout',
    'Priority customer concierge service'
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left Panel: Brand & Benefits ── */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-[#3B1F0A]">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <circle cx="90" cy="10" r="40" stroke="white" strokeWidth="0.1" />
            <circle cx="10" cy="90" r="60" stroke="white" strokeWidth="0.1" />
          </svg>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8B5A2B]/20 rounded-full blur-[120px] pointer-events-none" />

        <Link to="/" className="flex items-center gap-3 relative z-10 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#D4C4A8] to-[#8B5A2B] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Store size={20} className="text-[#3B1F0A]" />
          </div>
          <div>
            <span className="text-3xl font-bold text-white block leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>Riris</span>
            <span className="text-[10px] text-[#A67B5B] uppercase tracking-[0.3em] font-bold">Emporium</span>
          </div>
        </Link>

        <div className="relative z-10 space-y-8">
          <h2 className="text-5xl font-bold text-white leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Elevate Your <br />Lifestyle.
          </h2>
          <div className="space-y-5">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <CheckCircle2 size={16} />
                </div>
                <p className="text-[#D4C4A8] font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs tracking-widest uppercase font-bold">
          &copy; {new Date().getFullYear()} Riris Emporium Limited.
        </div>
      </div>

      {/* ── Right Panel: Register Form ── */}
      <div className="flex items-center justify-center p-8 lg:p-12 bg-[#FAF7F2]">
        <div className="w-full max-w-lg space-y-10 animate-fade-in">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-[#5D3A1A] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Create Account</h1>
            <p className="text-[#A67B5B]">Join the circle. Enter your details to begin your journey.</p>
          </div>

          {(error || passwordError) && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm animate-shake">
              {error || passwordError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B] group-focus-within:text-[#8B5A2B] transition-colors" size={18} />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="E.g. Alexander"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#D4C4A8] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Last Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B] group-focus-within:text-[#8B5A2B] transition-colors" size={18} />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="E.g. McQueen"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#D4C4A8] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B] group-focus-within:text-[#8B5A2B] transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#D4C4A8] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Phone (Optional)</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B] group-focus-within:text-[#8B5A2B] transition-colors" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#D4C4A8] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Security Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B] group-focus-within:text-[#8B5A2B] transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-[#D4C4A8] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] transition-all text-sm font-medium"
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
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Confirm Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B] group-focus-within:text-[#8B5A2B] transition-colors" size={18} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-[#D4C4A8] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A67B5B] hover:text-[#8B5A2B] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <input type="checkbox" id="terms" required className="w-5 h-5 accent-[#8B5A2B] border-[#D4C4A8] rounded-lg cursor-pointer transition-all" />
              <label htmlFor="terms" className="text-xs text-[#5D3A1A] font-medium leading-tight">
                I agree to the <Link to="/terms" className="text-[#8B5A2B] font-bold hover:underline underline-offset-4">Terms</Link> and <Link to="/privacy" className="text-[#8B5A2B] font-bold hover:underline underline-offset-4">Privacy Policy</Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#8B5A2B] hover:bg-[#6B4423] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-[#8B5A2B]/20 transition-all hover:-translate-y-1 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[#A67B5B] text-sm">
            Already part of the circle?{' '}
            <Link
              to="/login"
              className="text-[#8B5A2B] font-bold hover:text-[#6B4423] transition-colors underline underline-offset-8 decoration-transparent hover:decoration-[#8B5A2B]"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
