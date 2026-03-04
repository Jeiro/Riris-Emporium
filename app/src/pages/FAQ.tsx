import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  Search, 
  Package, 
  CreditCard, 
  RotateCcw, 
  Truck, 
  User,
  Shield,
  HelpCircle,
  MessageCircle
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  items: FAQItem[];
}

export const FAQ = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState('all');

  const toggleItem = (categoryId: string, itemIndex: number) => {
    const key = `${categoryId}-${itemIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const faqCategories: FAQCategory[] = [
    {
      id: 'orders',
      title: 'Orders & Shipping',
      icon: Package,
      items: [
        {
          question: 'How do I place an order?',
          answer: 'Placing an order is easy! Simply browse our products, add items to your cart, and proceed to checkout. You will need to create an account or sign in, provide your shipping address, and complete payment through our secure Paystack integration.'
        },
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping takes 3-5 business days within Lagos and 5-7 business days for other states in Nigeria. Express shipping is available for 1-2 business days delivery at an additional cost.'
        },
        {
          question: 'How much does shipping cost?',
          answer: 'We offer free standard shipping on all orders over ₦10,000. For orders below this amount, standard shipping costs ₦1,500 within Lagos and ₦2,500 for other states. Express shipping rates vary by location.'
        },
        {
          question: 'Can I change or cancel my order?',
          answer: 'Orders can be modified or cancelled within 2 hours of placement. After this window, we begin processing your order for shipment. Please contact our customer service team immediately if you need to make changes.'
        },
        {
          question: 'How do I track my order?',
          answer: 'Once your order is shipped, you will receive an email with a tracking number. You can use this number to track your package on our website under "My Orders" or directly on the courier\'s website.'
        }
      ]
    },
    {
      id: 'returns',
      title: 'Returns & Refunds',
      icon: RotateCcw,
      items: [
        {
          question: 'What is your return policy?',
          answer: 'We offer a 30-day return policy for all unused items in their original packaging with tags attached. Items must be in the same condition as received to be eligible for a full refund.'
        },
        {
          question: 'How do I initiate a return?',
          answer: 'To initiate a return, log into your account, go to "My Orders," select the order you want to return, and click "Return Items." Follow the prompts to complete your return request. You can also contact our support team for assistance.'
        },
        {
          question: 'When will I receive my refund?',
          answer: 'Once we receive and inspect your returned item, we will process your refund within 3-5 business days. The refund will be credited to your original payment method. Please note that it may take an additional 5-10 business days for the refund to appear in your account depending on your bank.'
        },
        {
          question: 'Are there items that cannot be returned?',
          answer: 'Yes, certain items cannot be returned including intimate apparel, swimwear, personalized items, and items marked as final sale. These exclusions are noted on the product pages.'
        },
        {
          question: 'Do I have to pay for return shipping?',
          answer: 'For defective or incorrect items, we cover the return shipping cost. For other returns, the customer is responsible for return shipping fees. We recommend using a trackable shipping service for your protection.'
        }
      ]
    },
    {
      id: 'payment',
      title: 'Payment',
      icon: CreditCard,
      items: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept various payment methods including debit/credit cards (Visa, Mastercard, Verve), bank transfers, and USSD payments through our secure Paystack integration. All transactions are encrypted and secure.'
        },
        {
          question: 'Is my payment information secure?',
          answer: 'Absolutely! We use Paystack, a PCI-DSS compliant payment processor, to handle all transactions. Your card details are never stored on our servers. All data is encrypted using industry-standard SSL technology.'
        },
        {
          question: 'Can I pay on delivery?',
          answer: 'Currently, we do not offer pay-on-delivery options. All orders must be paid for at checkout using one of our accepted payment methods.'
        },
        {
          question: 'Why was my payment declined?',
          answer: 'Payments may be declined due to insufficient funds, incorrect card details, expired cards, or bank security restrictions. Please verify your information and try again, or contact your bank for assistance.'
        },
        {
          question: 'Do you offer installment payments?',
          answer: 'We are working on introducing installment payment options soon. Stay tuned for updates on this feature!'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: User,
      items: [
        {
          question: 'Do I need an account to shop?',
          answer: 'Yes, you need to create an account to place orders. Having an account allows you to track orders, save your shipping information, manage returns, and receive exclusive offers.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click on "Forgot Password" on the login page, enter your email address, and we will send you a password reset link. Follow the instructions in the email to create a new password.'
        },
        {
          question: 'How do I update my profile information?',
          answer: 'Log into your account and go to "My Profile." Here you can update your personal information, shipping addresses, and communication preferences.'
        },
        {
          question: 'Can I have multiple shipping addresses?',
          answer: 'Yes! You can save multiple shipping addresses in your profile. During checkout, simply select the address you want to use for that order.'
        },
        {
          question: 'How do I delete my account?',
          answer: 'To delete your account, please contact our customer support team. Note that account deletion is permanent and will remove all your order history and saved information.'
        }
      ]
    },
    {
      id: 'products',
      title: 'Products & Sizing',
      icon: Truck,
      items: [
        {
          question: 'How do I find my size?',
          answer: 'Each product page includes a detailed size guide. We recommend measuring yourself and comparing with our size chart. If you are between sizes, we suggest sizing up for a more comfortable fit.'
        },
        {
          question: 'Are your products authentic?',
          answer: 'Yes, all products sold on Riris Emporium are 100% authentic. We source directly from brands and authorized distributors to ensure quality and authenticity.'
        },
        {
          question: 'How accurate are the product colors?',
          answer: 'We make every effort to display colors as accurately as possible. However, colors may appear slightly different depending on your device screen settings and lighting conditions.'
        },
        {
          question: 'Do you restock sold-out items?',
          answer: 'Popular items are often restocked. You can click "Notify Me" on the product page to receive an email when the item is back in stock.'
        },
        {
          question: 'Can I request a specific product?',
          answer: 'If you are looking for a specific product that is not currently available, please contact us. We will do our best to source it for you or suggest alternatives.'
        }
      ]
    },
    {
      id: 'security',
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          question: 'How do you protect my personal information?',
          answer: 'We take data protection seriously. Your personal information is encrypted and stored securely. We never share your data with third parties without your consent, except as required to process your orders.'
        },
        {
          question: 'Do you use cookies?',
          answer: 'Yes, we use cookies to enhance your shopping experience, remember your preferences, and analyze site traffic. You can manage cookie preferences in your browser settings.'
        },
        {
          question: 'Will you share my email with third parties?',
          answer: 'No, we do not sell or share your email address with third parties for marketing purposes. You will only receive emails from us regarding your orders and, if you opt in, our newsletter.'
        },
        {
          question: 'How can I opt out of marketing emails?',
          answer: 'You can unsubscribe from marketing emails at any time by clicking the "Unsubscribe" link at the bottom of any promotional email. You will still receive transactional emails related to your orders.'
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => 
    activeCategory === 'all' || category.id === activeCategory
  );

  const hasResults = filteredCategories.some(cat => cat.items.length > 0);

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
              Help Center
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-[#FAF7F2]/80 leading-relaxed mb-8">
              Find answers to common questions about orders, shipping, returns, and more.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={20} />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/30 text-[#5D3A1A]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 border-b border-[#E8DFD0]">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#8B5A2B] text-white'
                  : 'bg-[#F5F1E8] text-[#5D3A1A] hover:bg-[#E8DFD0]'
              }`}
            >
              All Topics
            </button>
            {faqCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeCategory === category.id
                    ? 'bg-[#8B5A2B] text-white'
                    : 'bg-[#F5F1E8] text-[#5D3A1A] hover:bg-[#E8DFD0]'
                }`}
              >
                <category.icon size={16} />
                {category.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          {hasResults ? (
            <div className="space-y-12 max-w-4xl mx-auto">
              {filteredCategories.map(category => (
                category.items.length > 0 && (
                  <div key={category.id}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                        <category.icon className="text-[#8B5A2B]" size={20} />
                      </div>
                      <h2 className="text-xl font-semibold text-[#5D3A1A]">{category.title}</h2>
                    </div>
                    <div className="space-y-4">
                      {category.items.map((item, index) => {
                        const key = `${category.id}-${index}`;
                        const isOpen = openItems[key];
                        return (
                          <div
                            key={index}
                            className="bg-white border border-[#E8DFD0] rounded-xl overflow-hidden"
                          >
                            <button
                              onClick={() => toggleItem(category.id, index)}
                              className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F5F1E8]/50 transition-colors"
                            >
                              <span className="font-medium text-[#5D3A1A] pr-4">{item.question}</span>
                              <ChevronDown
                                size={20}
                                className={`text-[#8B5A2B] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                              />
                            </button>
                            {isOpen && (
                              <div className="px-5 pb-5">
                                <p className="text-[#A67B5B] leading-relaxed">{item.answer}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="mx-auto text-[#D4C4A8] mb-4" size={48} />
              <h3 className="text-xl font-semibold text-[#5D3A1A] mb-2">No results found</h3>
              <p className="text-[#A67B5B]">Try adjusting your search terms or browse all categories</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-[#F5F1E8]">
        <div className="container-custom">
          <div className="bg-[#8B5A2B] rounded-2xl p-8 lg:p-12 text-center">
            <MessageCircle className="mx-auto text-white/80 mb-4" size={48} />
            <h2 
              className="text-2xl lg:text-3xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Still Have Questions?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-6">
              Our customer support team is here to help. Reach out to us and we will 
              get back to you within 24 hours.
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
