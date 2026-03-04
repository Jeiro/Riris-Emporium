import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  ShoppingBag, 
  CreditCard, 
  RotateCcw, 
  Scale,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = 'January 1, 2024';

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
              Legal Agreement
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Terms of Service
            </h1>
            <p className="text-xl text-[#FAF7F2]/80 leading-relaxed">
              Please read these terms carefully before using our website or services.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Last Updated */}
            <div className="bg-[#F5F1E8] p-4 rounded-lg mb-8">
              <p className="text-[#A67B5B]">
                <strong>Last Updated:</strong> {lastUpdated}
              </p>
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none">
              <p className="text-[#A67B5B] leading-relaxed mb-8">
                Welcome to Riris Emporium. These Terms of Service govern your use of our website 
                located at www.ririsemporium.com and all related services provided by Riris Emporium. 
                By accessing or using our website, you agree to be bound by these Terms. If you 
                disagree with any part of these terms, you may not access the website.
              </p>

              {/* Section 1 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <FileText className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Acceptance of Terms
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed">
                    By accessing and using this website, you accept and agree to be bound by the 
                    terms and provision of this agreement. In addition, when using this website's 
                    particular services, you shall be subject to any posted guidelines or rules 
                    applicable to such services. Any participation in this service will constitute 
                    acceptance of this agreement.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Use of the Website
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] mb-4">
                    You agree to use the website only for lawful purposes and in a way that does 
                    not infringe the rights of, restrict or inhibit anyone else&apos;s use and enjoyment 
                    of the website. Prohibited behavior includes:
                  </p>
                  <ul className="space-y-2 text-[#5D3A1A]">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Harassing or causing distress or inconvenience to any other user
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Transmitting obscene or offensive content
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Disrupting the normal flow of dialogue within our website
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Attempting to gain unauthorized access to our systems
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Using the website for fraudulent purposes
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 3 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Account Registration
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed mb-4">
                    To access certain features of the website, you may be required to register 
                    for an account. You agree to:
                  </p>
                  <ul className="space-y-2 text-[#5D3A1A]">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Provide accurate, current, and complete information during registration
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Maintain and promptly update your account information
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Maintain the security of your password and accept all risks of unauthorized access
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Notify us immediately of any unauthorized use of your account
                    </li>
                  </ul>
                  <p className="text-[#A67B5B] mt-4">
                    We reserve the right to disable any user account at any time in our sole discretion.
                  </p>
                </div>
              </div>

              {/* Section 4 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Products and Pricing
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed mb-4">
                    All products listed on our website are subject to availability. We reserve 
                    the right to discontinue any product at any time. Prices for our products 
                    are subject to change without notice.
                  </p>
                  <p className="text-[#A67B5B] leading-relaxed mb-4">
                    We make every effort to display as accurately as possible the colors and 
                    images of our products. However, we cannot guarantee that your computer 
                    monitor&apos;s display of any color will be accurate.
                  </p>
                  <p className="text-[#A67B5B] leading-relaxed">
                    We reserve the right to limit the quantities of any products or services 
                    that we offer. All descriptions of products and pricing are subject to 
                    change at any time without notice, at our sole discretion.
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Orders and Payment
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed mb-4">
                    By placing an order, you are offering to purchase a product subject to these 
                    Terms. All orders are subject to availability and confirmation of the order price.
                  </p>
                  <p className="text-[#A67B5B] leading-relaxed mb-4">
                    Payment must be received prior to the acceptance of an order. We accept various 
                    payment methods as indicated on our website. All payments are processed securely 
                    through our payment partners.
                  </p>
                  <p className="text-[#A67B5B] leading-relaxed">
                    We reserve the right to refuse any order you place with us. We may, in our sole 
                    discretion, limit or cancel quantities purchased per person, per household, or 
                    per order.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <RotateCcw className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Shipping and Returns
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed mb-4">
                    Shipping and delivery dates are estimates only and cannot be guaranteed. 
                    We are not liable for any delays in shipments.
                  </p>
                  <p className="text-[#A67B5B] leading-relaxed">
                    Our return policy allows for returns within 30 days of delivery for most 
                    items. Please refer to our{' '}
                    <Link to="/returns" className="text-[#8B5A2B] hover:underline">
                      Returns & Refunds
                    </Link>{' '}
                    page for complete details on eligibility and the return process.
                  </p>
                </div>
              </div>

              {/* Section 7 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Limitation of Liability
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed mb-4">
                    In no event shall Riris Emporium, nor its directors, employees, partners, 
                    agents, suppliers, or affiliates, be liable for any indirect, incidental, 
                    special, consequential, or punitive damages, including without limitation, 
                    loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                  </p>
                  <ul className="space-y-2 text-[#5D3A1A]">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Your access to or use of or inability to access or use the website
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Any conduct or content of any third party on the website
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Any content obtained from the website
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Unauthorized access, use, or alteration of your transmissions or content
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 8 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <Scale className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Governing Law
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed">
                    These Terms shall be governed and construed in accordance with the laws of 
                    the Federal Republic of Nigeria, without regard to its conflict of law provisions. 
                    Our failure to enforce any right or provision of these Terms will not be considered 
                    a waiver of those rights.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <FileText className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Changes to Terms
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed">
                    We reserve the right, at our sole discretion, to modify or replace these Terms 
                    at any time. If a revision is material, we will try to provide at least 30 days' 
                    notice prior to any new terms taking effect. What constitutes a material change 
                    will be determined at our sole discretion. By continuing to access or use our 
                    website after those revisions become effective, you agree to be bound by the 
                    revised terms.
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-[#F5F1E8] p-8 rounded-xl">
                <h2 className="text-2xl font-semibold text-[#5D3A1A] mb-4">
                  Contact Us
                </h2>
                <p className="text-[#A67B5B] mb-4">
                  If you have any questions about these Terms, please contact us:
                </p>
                <div className="space-y-2 text-[#5D3A1A]">
                  <p><strong>Email:</strong> legal@ririsemporium.com</p>
                  <p><strong>Address:</strong> 123 Fashion Avenue, Lagos, Nigeria</p>
                  <p><strong>Phone:</strong> +234 123 456 7890</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
