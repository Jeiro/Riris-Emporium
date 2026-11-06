import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  Truck,
  Info
} from 'lucide-react';
import { useCart } from '../hooks';
import { useAuth } from '../hooks';
import { Button } from '../components/ui/button';
import { createWhatsAppOrder, WHATSAPP_CHECKOUT_NOTICE } from '../lib/whatsappCheckout';
import { useCartStore } from '../store/cartStore';

export const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, items, subtotal: calculatedSubtotal, isLoading: cartLoading,
    status: cartStatus, error: cartError, retry, canCheckout, notices } = useCart();

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

  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ url: string; message: string; cart: typeof cart; userId: string } | null>(null);
  const currentDraft = draft?.cart === cart && draft?.userId === user?.id ? draft : null;

  useEffect(() => {
    if (!cartLoading && !cartError && cartStatus === 'ready' && items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartLoading, cartError, cartStatus, items.length, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setDraft(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDraft(null);
    try {
      const latest = useCartStore.getState();
      if (!user || !cart || cartLoading || cartError || cartStatus !== 'ready' || !canCheckout ||
          latest.cart !== cart || latest.ownerId !== user.id || latest.isLoading || latest.status !== 'ready') {
        throw new Error('Please wait for your cart to load and review any unavailable products.');
      }
      const order = createWhatsAppOrder(items, formData, canCheckout);
      setDraft({ ...order, cart, userId: user.id });
      // Browser handoff only. No order/payment writes, cart clearing or sent-message claim.
      // noopener can return null even on success; always provide a fallback link.
      try { window.open(order.url, '_blank', 'noopener,noreferrer'); }
      catch { setError('Your browser could not open WhatsApp. Use the prepared link below.'); }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not prepare your WhatsApp order. Please check your details.');
    }
  };

  if (cartLoading) return <div role="status" className="min-h-screen flex items-center justify-center text-[#A67B5B]">Loading cart…</div>;
  if (cartError) return <div role="alert" className="container-custom py-24 text-center text-[#5D3A1A]">
    <h1 className="text-2xl font-bold mb-3">Checkout unavailable</h1><p>{cartError}</p>
    <button className="btn-primary mt-4" onClick={() => void retry()}>Retry</button>
  </div>;
  if (cartStatus !== 'ready' || items.length === 0) return null;

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
              <p className="text-[#A67B5B] text-sm mt-1">Review your items and shipping information.</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-3 text-xs font-bold text-[#A67B5B] uppercase tracking-widest bg-white px-6 py-3 rounded-full border border-[#E8DFD0] shadow-sm">
            <ShieldCheck size={16} className="text-emerald-500" />
            Checkout overview
          </div>
        </div>

        <div id="whatsapp-checkout-info" role="status" className="bg-white border border-[#E8DFD0] rounded-2xl p-4 mb-8 text-[#5D3A1A] text-sm flex items-center gap-3">
          <Info size={18} className="shrink-0" /> <p>{WHATSAPP_CHECKOUT_NOTICE}</p>
        </div>

        {error && <p role="alert" className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-red-700 text-sm">{error}</p>}
        {currentDraft && <div className="bg-white border border-[#E8DFD0] rounded-2xl p-4 mb-8 text-[#5D3A1A] text-sm space-y-3">
          <p role="status">Your draft is ready. Nothing has been sent. Review and send the message in WhatsApp. Your cart has not been changed.</p>
          <a href={currentDraft.url} target="_blank" rel="noopener noreferrer" className="underline font-semibold">Open WhatsApp if it did not open automatically</a>
          <details><summary className="cursor-pointer">Review order message</summary><pre className="whitespace-pre-wrap break-words mt-3 font-sans">{currentDraft.message}</pre></details>
        </div>}

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
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
                      <label htmlFor="phone" className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Phone *</label>
                      <input
                        id="phone"
                        type="tel"
                        required
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
                      <label htmlFor="city" className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest pl-1">City *</label>
                      <input id="city" required name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 text-[#5D3A1A]" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="state" className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest pl-1">State *</label>
                      <input id="state" required name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 text-[#5D3A1A]" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="zipCode" className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Zip Code</label>
                      <input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/20 text-[#5D3A1A]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual order handoff */}
              <div className="bg-white rounded-3xl shadow-sm border border-[#E8DFD0] overflow-hidden opacity-90">
                <div className="px-8 py-6 bg-[#F5F1E8] border-b border-[#E8DFD0] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4C4A8] text-[#5D3A1A] flex items-center justify-center font-bold">2</div>
                  <h2 className="font-bold text-[#5D3A1A] uppercase tracking-wider text-sm">Order Method</h2>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 p-4 bg-[#FAF7F2] border-2 border-[#8B5A2B] rounded-2xl">
                    <div className="w-10 h-10 bg-[#8B5A2B] text-white rounded-full flex items-center justify-center">
                      <MessageCircle size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#5D3A1A] text-sm">WhatsApp Order</p>
                      <p className="text-[#A67B5B] text-[10px] uppercase tracking-widest font-bold">Payment details confirmed by our team</p>
                    </div>
                    <div className="w-6 h-6 rounded-full border-4 border-[#8B5A2B] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#8B5A2B]" />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={cartLoading || !canCheckout}
                aria-describedby="whatsapp-checkout-info"
                className="w-full min-h-12 bg-[#8B5A2B] hover:bg-[#6B4423] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#8B5A2B]/20 transition-all hover:-translate-y-1"
              >
                Order via WhatsApp
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
                {notices.map((notice, index) => <p key={index} role="status" className="text-sm text-[#A67B5B]">{notice}</p>)}
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
                  <div className="flex justify-between items-center text-sm font-medium gap-4"><span className="text-[#A67B5B]">Delivery</span><span className="text-[#5D3A1A]">To be confirmed</span></div>
                  <div className="flex justify-between items-center text-sm font-medium gap-4"><span className="text-[#A67B5B]">Taxes and discounts</span><span className="text-[#5D3A1A]">To be confirmed</span></div>

                  <div className="pt-6 border-t border-[#F5F1E8] flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-[#A67B5B] uppercase tracking-widest">Estimated Total (items only)</p>
                      <p className="text-3xl font-bold text-[#8B5A2B] mt-1">₦{calculatedSubtotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-8 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD0]">
                    <Truck size={18} className="text-[#8B5A2B]" />
                    <div>
                      <p className="text-[10px] font-bold text-[#5D3A1A] uppercase tracking-wider">Delivery arrangements</p>
                      <p className="text-[9px] text-[#A67B5B]">Timing and fee confirmed by our team</p>
                    </div>
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
