import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package,
  CreditCard,
  AlertCircle,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

export const Returns = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const returnSteps = [
    {
      icon: Package,
      title: 'Initiate Return',
      description: 'Log into your account, go to "My Orders," and select the order you want to return. Click "Return Items" and follow the prompts.'
    },
    {
      icon: CheckCircle2,
      title: 'Get Approval',
      description: 'Our team will review your return request within 24 hours and send you a return authorization with instructions.'
    },
    {
      icon: RotateCcw,
      title: 'Ship Item Back',
      description: 'Pack the item securely in its original packaging with all tags attached. Use the provided return label or ship to the address provided.'
    },
    {
      icon: CreditCard,
      title: 'Receive Refund',
      description: 'Once we receive and inspect your return, we will process your refund within 3-5 business days to your original payment method.'
    }
  ];

  const eligibleItems = [
    'Unused items in original condition',
    'Items with all original tags attached',
    'Items in original packaging',
    'Defective or damaged items',
    'Incorrect items received'
  ];

  const nonEligibleItems = [
    'Intimate apparel and swimwear',
    'Personalized or custom-made items',
    'Items marked as "Final Sale"',
    'Items without original tags',
    'Items showing signs of wear or use',
    'Gift cards and vouchers'
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
              Hassle-Free Returns
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Returns & Refunds
            </h1>
            <p className="text-xl text-[#FAF7F2]/80 leading-relaxed">
              Shop with confidence. Our 30-day return policy ensures you are 
              completely satisfied with your purchase.
            </p>
          </div>
        </div>
      </section>

      {/* Policy Highlights */}
      <section className="py-16 -mt-10">
        <div className="container-custom">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: '30-Day Window',
                description: 'Return items within 30 days of delivery'
              },
              {
                icon: Package,
                title: 'Easy Process',
                description: 'Simple online return initiation'
              },
              {
                icon: CreditCard,
                title: 'Full Refund',
                description: 'Original payment method refund'
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-[#E8DFD0] text-center"
              >
                <div className="w-14 h-14 bg-[#8B5A2B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-[#8B5A2B]" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-[#5D3A1A] mb-2">{item.title}</h3>
                <p className="text-[#A67B5B]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              Simple Steps
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              How to Return an Item
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {returnSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-6 rounded-xl border border-[#E8DFD0] h-full">
                  <div className="w-12 h-12 bg-[#8B5A2B] text-white rounded-lg flex items-center justify-center mb-4">
                    <step.icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#5D3A1A] mb-2">{step.title}</h3>
                  <p className="text-[#A67B5B] text-sm leading-relaxed">{step.description}</p>
                </div>
                {index < returnSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="text-[#D4C4A8]" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-16 lg:py-24 bg-[#F5F1E8]">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Eligible Items */}
            <div className="bg-white p-8 rounded-xl border border-[#E8DFD0]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-[#5D3A1A]">Eligible for Return</h3>
              </div>
              <ul className="space-y-3">
                {eligibleItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={18} />
                    <span className="text-[#5D3A1A]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Non-Eligible Items */}
            <div className="bg-white p-8 rounded-xl border border-[#E8DFD0]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-[#5D3A1A]">Not Eligible</h3>
              </div>
              <ul className="space-y-3">
                {nonEligibleItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="text-red-600 flex-shrink-0 mt-1" size={18} />
                    <span className="text-[#5D3A1A]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Information */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              Refund Details
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Refund Information
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: 'Refund Timeline',
                description: 'Refunds are processed within 3-5 business days after we receive your return. It may take an additional 5-10 business days for the refund to appear in your account.',
                icon: Clock
              },
              {
                title: 'Refund Method',
                description: 'Refunds are issued to the original payment method used for the purchase. If you paid with a card, the refund will be credited to that same card.',
                icon: CreditCard
              },
              {
                title: 'Return Shipping',
                description: 'For defective or incorrect items, we cover return shipping. For other returns, the customer is responsible for return shipping costs.',
                icon: Package
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-[#E8DFD0]">
                <item.icon className="text-[#8B5A2B] mb-4" size={28} />
                <h3 className="text-lg font-semibold text-[#5D3A1A] mb-2">{item.title}</h3>
                <p className="text-[#A67B5B] text-sm leading-relaxed">{item.description}</p>
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
                <h2 className="text-xl font-semibold text-[#5D3A1A]">Important Notes</h2>
              </div>
              <ul className="space-y-4">
                {[
                  'Items must be returned in their original condition with all tags attached.',
                  'We recommend using a trackable shipping service for your protection.',
                  'Original shipping charges are non-refundable unless the return is due to our error.',
                  'Exchanges are handled as returns - place a new order for the desired item.',
                  'Sale items can only be returned if defective or incorrect.',
                  'Contact us within 48 hours if you receive a damaged or incorrect item.'
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
            <HelpCircle className="mx-auto text-white/80 mb-4" size={48} />
            <h2 
              className="text-2xl lg:text-3xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Need Help with a Return?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-6">
              Our customer support team is here to assist you with any return-related questions.
            </p>
            <Link 
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-[#8B5A2B] px-8 py-3 rounded-lg font-medium hover:bg-[#F5F1E8] transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
