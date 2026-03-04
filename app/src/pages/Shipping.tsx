import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Package, 
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const Shipping = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const shippingOptions = [
    {
      title: 'Standard Shipping',
      duration: '3-7 Business Days',
      price: '₦1,500 - ₦2,500',
      features: [
        'Free on orders over ₦10,000',
        '3-5 days within Lagos',
        '5-7 days for other states',
        'Tracking included'
      ]
    },
    {
      title: 'Express Shipping',
      duration: '1-2 Business Days',
      price: '₦3,500 - ₦5,000',
      features: [
        'Next-day delivery in Lagos',
        '1-2 days for major cities',
        'Priority handling',
        'Real-time tracking'
      ]
    }
  ];

  const deliveryAreas = [
    { region: 'Lagos (Mainland)', standard: '1-2 days', express: 'Same day' },
    { region: 'Lagos (Island)', standard: '1-2 days', express: 'Same day' },
    { region: 'Abuja', standard: '3-4 days', express: '1-2 days' },
    { region: 'Port Harcourt', standard: '4-5 days', express: '2 days' },
    { region: 'Ibadan', standard: '3-4 days', express: '1-2 days' },
    { region: 'Kano', standard: '5-7 days', express: '2-3 days' },
    { region: 'Other States', standard: '5-7 days', express: '2-3 days' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-[#5D3A1A]">
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[#D4C4A8] uppercase tracking-widest text-sm mb-4">
              Delivery Information
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Shipping Information
            </h1>
            <p className="text-xl text-[#FAF7F2]/80 leading-relaxed">
              Fast, reliable delivery to your doorstep. Learn about our shipping 
              options, delivery times, and policies.
            </p>
          </div>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              Delivery Options
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Choose Your Shipping Method
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {shippingOptions.map((option, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm border border-[#E8DFD0] hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#8B5A2B]/10 rounded-xl flex items-center justify-center">
                    <Truck className="text-[#8B5A2B]" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#5D3A1A]">{option.title}</h3>
                    <p className="text-[#A67B5B]">{option.duration}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#8B5A2B] mb-6">{option.price}</p>
                <ul className="space-y-3">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="text-[#8B5A2B] flex-shrink-0" size={18} />
                      <span className="text-[#5D3A1A]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Areas */}
      <section className="py-16 lg:py-24 bg-[#F5F1E8]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              Coverage Areas
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Delivery Times by Location
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-3 gap-4 p-4 bg-[#8B5A2B] text-white font-medium">
                <div>Region</div>
                <div>Standard</div>
                <div>Express</div>
              </div>
              {deliveryAreas.map((area, index) => (
                <div 
                  key={index}
                  className="grid grid-cols-3 gap-4 p-4 border-b border-[#E8DFD0] last:border-b-0 hover:bg-[#F5F1E8] transition-colors"
                >
                  <div className="flex items-center gap-2 text-[#5D3A1A]">
                    <MapPin size={16} className="text-[#8B5A2B]" />
                    {area.region}
                  </div>
                  <div className="flex items-center gap-2 text-[#A67B5B]">
                    <Clock size={16} />
                    {area.standard}
                  </div>
                  <div className="flex items-center gap-2 text-[#8B5A2B] font-medium">
                    <Package size={16} />
                    {area.express}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              The Process
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              How Shipping Works
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Place Order',
                description: 'Complete your purchase and select your preferred shipping method at checkout.'
              },
              {
                step: '2',
                title: 'Order Processing',
                description: 'We process and pack your order within 24 hours of placement.'
              },
              {
                step: '3',
                title: 'Shipped',
                description: 'Your order is handed to our courier partners with tracking information sent to you.'
              },
              {
                step: '4',
                title: 'Delivered',
                description: 'Receive your package at your doorstep. Sign to confirm delivery.'
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#8B5A2B] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-[#5D3A1A] mb-2">{item.title}</h3>
                <p className="text-[#A67B5B]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 lg:py-24 bg-[#F5F1E8]">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-xl border border-[#E8DFD0]">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="text-[#8B5A2B]" size={24} />
                <h2 className="text-xl font-semibold text-[#5D3A1A]">Important Information</h2>
              </div>
              <ul className="space-y-4">
                {[
                  'Orders placed before 2 PM WAT on business days are processed the same day.',
                  'Delivery times are estimates and may vary due to unforeseen circumstances.',
                  'Someone must be available to receive and sign for the package.',
                  'We will attempt delivery twice before returning the package to our facility.',
                  'Remote areas may require additional delivery time.',
                  'You will receive SMS and email updates about your delivery status.'
                ].map((note, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-[#8B5A2B] flex-shrink-0 mt-1" size={18} />
                    <span className="text-[#5D3A1A]">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-[#8B5A2B] rounded-2xl p-8 lg:p-12 text-center">
            <h2 
              className="text-2xl lg:text-3xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Ready to Shop?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-6">
              Browse our collection and enjoy fast, reliable delivery to your doorstep.
            </p>
            <Link 
              to="/shop"
              className="inline-flex items-center gap-2 bg-white text-[#8B5A2B] px-8 py-3 rounded-lg font-medium hover:bg-[#F5F1E8] transition-colors"
            >
              Start Shopping
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
