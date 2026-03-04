import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Truck,
  ChevronRight,
  Info
} from 'lucide-react';
import { useCart } from '../hooks';
import { useAuth } from '../hooks';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';

export const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  };

  const calculatedSubtotal = total && total > 0 ? total : calculateSubtotal();
  const calculatedTax = calculatedSubtotal * 0.075;
  const calculatedShipping = calculatedSubtotal > 10000 ? 0 : 2500;
  const calculatedTotal = calculatedSubtotal + calculatedTax + calculatedShipping;

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
      return;
    }
    if (items.length === 0 && !success) {
      navigate('/cart');
    }
  }, [user, items, navigate, success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      if (!formData.firstName || !formData.email || !formData.address) {
        throw new Error('Please fill in all required fields');
      }

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user!.id,
            order_number: orderNumber,
            total: calculatedTotal,
            status: 'pending',
            shipping_address: {
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode
            },
            items: items,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      clearCart();
      setSuccess(true);
      setTimeout(() => {
        navigate(`/orders/${orderData.id}`);
      }, 2500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete checkout';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-[#E8DFD0] p-12 max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#5D3A1A] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Order Placed!</h2>
          <p className="text-[#A67B5B] mb-8 leading-relaxed">Thank you for your purchase. We've sent a confirmation email to <span className="text-[#8B5A2B] font-bold">{formData.email}</span>.</p>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#F5F1E8] border-t-[#8B5A2B] rounded-full animate-spin" />
            <p className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest">Preparing your summary...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/cart')}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-[#E8DFD0] text-[#5D3A1A] hover:bg-[#8B5A2B] hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Checkout
              </h1>
              <p className="text-[#A67B5B] text-sm mt-1">Review your items and complete your purchase.</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-xs font-bold text-[#A67B5B] uppercase tracking-widest bg-white px-6 py-3 rounded-full border border-[#E8DFD0] shadow-sm">
            <ShieldCheck size={16} className="text-emerald-500" />
            Secure 256-Bit SSL Encryption
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 text-red-700 text-sm flex items-center gap-3 animate-shake">
            <Info size={18} /> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-white rounded-3xl shadow-sm border border-[#E8DFD0] overflow-hidden">
                <div className="px-8 py-6 bg-[#F5F1E8] border-b border-[#E8DFD0] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#8B5A2B] text-white flex items-center justify-center font-bold">1</div>
                  <h2 className="font-bold text-[#5D3A1A] uppercase tracking-wider text-sm">Shipping Information</h2>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest pl-1">First Name *</label>
                      <input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 text-[#5D3A1A] transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Last Name</label>
                      <input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 text-[#5D3A1A] transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Email *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 text-[#5D3A1A] transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Phone</label>
                      <input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+234..."
                        className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 text-[#5D3A1A] transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Delivery Address *</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street address, apartment, suite, etc."
                      rows={3}
                      className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 text-[#5D3A1A] transition-all"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest pl-1">City</label>
                      <input id="city" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 text-[#5D3A1A]" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="state" className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest pl-1">State</label>
                      <input id="state" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 text-[#5D3A1A]" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="zipCode" className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Zip Code</label>
                      <input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 text-[#5D3A1A]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Stub */}
              <div className="bg-white rounded-3xl shadow-sm border border-[#E8DFD0] overflow-hidden opacity-90">
                <div className="px-8 py-6 bg-[#F5F1E8] border-b border-[#E8DFD0] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4C4A8] text-[#5D3A1A] flex items-center justify-center font-bold">2</div>
                  <h2 className="font-bold text-[#5D3A1A] uppercase tracking-wider text-sm">Payment Method</h2>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 p-4 bg-[#FAF7F2] border-2 border-[#8B5A2B] rounded-2xl">
                    <div className="w-10 h-10 bg-[#8B5A2B] text-white rounded-full flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#5D3A1A] text-sm">Paystack / Card Payment</p>
                      <p className="text-[#A67B5B] text-[10px] uppercase tracking-widest font-bold">Secure Online Payment</p>
                    </div>
                    <div className="w-6 h-6 rounded-full border-4 border-[#8B5A2B] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#8B5A2B]" />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#8B5A2B] hover:bg-[#6B4423] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#8B5A2B]/20 transition-all hover:-translate-y-1"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Processing Securely...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Pay ₦{calculatedTotal.toLocaleString()}</span>
                    <ChevronRight size={20} />
                  </div>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-[#E8DFD0] overflow-hidden sticky top-8">
              <div className="px-8 py-6 border-b border-[#F5F1E8]">
                <h2 className="text-xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>Order Summary</h2>
              </div>

              <div className="p-8 space-y-6">
                {/* Items */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="flex gap-4">
                      <div className="w-16 h-20 bg-[#F5F1E8] rounded-xl overflow-hidden flex-shrink-0 border border-[#E8DFD0]">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#5D3A1A] text-sm truncate">{item.name}</p>
                        <p className="text-xs text-[#A67B5B] font-medium mt-1">QTY: {item.quantity}</p>
                        <p className="text-sm font-bold text-[#8B5A2B] mt-1">₦{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals */}
                <div className="space-y-3 pt-6 border-t border-[#F5F1E8]">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-[#A67B5B]">Subtotal</span>
                    <span className="text-[#5D3A1A]">₦{calculatedSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-[#A67B5B]">VAT (7.5%)</span>
                    <span className="text-[#5D3A1A]">₦{calculatedTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-[#A67B5B]">Shipping</span>
                      {calculatedSubtotal > 10000 && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">FREE</span>}
                    </div>
                    <span className="text-[#5D3A1A]">
                      {calculatedShipping === 0 ? '₦0' : `₦${calculatedShipping.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="pt-6 border-t border-[#F5F1E8] flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest">Grand Total</p>
                      <p className="text-3xl font-bold text-[#8B5A2B] mt-1">₦{calculatedTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-8 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD0]">
                    <Truck size={18} className="text-[#8B5A2B]" />
                    <div>
                      <p className="text-[10px] font-bold text-[#5D3A1A] uppercase tracking-wider">Fast Delivery</p>
                      <p className="text-[9px] text-[#A67B5B]">Ships within 24-48 hours</p>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 opacity-40">
                    <img src="/visa-logo.png" alt="Visa" className="h-4 object-contain grayscale" />
                    <img src="/mastercard-logo.png" alt="Mastercard" className="h-4 object-contain grayscale" />
                    <img src="/paystack-logo.png" alt="Paystack" className="h-4 object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
