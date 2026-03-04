import { useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  Share2, 
  Cookie,
  Mail,
  ChevronRight
} from 'lucide-react';

export const Privacy = () => {
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
              Your Data Matters
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Privacy Policy
            </h1>
            <p className="text-xl text-[#FAF7F2]/80 leading-relaxed">
              We are committed to protecting your privacy and ensuring your 
              personal information is secure.
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
                At Riris Emporium, we take your privacy seriously. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you visit our 
                website or make a purchase. Please read this privacy policy carefully. If you do 
                not agree with the terms of this privacy policy, please do not access the site.
              </p>

              {/* Section 1 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <Eye className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Information We Collect
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] mb-4">
                    We collect information that you voluntarily provide to us when you:
                  </p>
                  <ul className="space-y-2 text-[#5D3A1A]">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Register for an account
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Place an order
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Subscribe to our newsletter
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Contact our customer support
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Participate in promotions or surveys
                    </li>
                  </ul>
                  <p className="text-[#A67B5B] mt-4">
                    This information may include your name, email address, phone number, 
                    shipping address, billing address, and payment information.
                  </p>
                </div>
              </div>

              {/* Section 2 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <Lock className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    How We Use Your Information
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="space-y-2 text-[#5D3A1A]">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Process and fulfill your orders
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Communicate with you about your orders
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Send you marketing communications (with your consent)
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Improve our website and services
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Prevent fraud and ensure security
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Comply with legal obligations
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 3 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <Share2 className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Information Sharing
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] mb-4">
                    We do not sell, trade, or rent your personal information to third parties. 
                    We may share your information with:
                  </p>
                  <ul className="space-y-2 text-[#5D3A1A]">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Service providers who assist in operating our website and business
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Payment processors to complete transactions
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Shipping partners to deliver your orders
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Law enforcement when required by law
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 4 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <Shield className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Data Security
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed">
                    We implement appropriate technical and organizational security measures 
                    to protect your personal information against unauthorized access, 
                    alteration, disclosure, or destruction. This includes using SSL encryption 
                    for data transmission and secure servers for data storage. However, no 
                    method of transmission over the Internet or electronic storage is 100% 
                    secure, and we cannot guarantee absolute security.
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <Cookie className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Cookies and Tracking
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed mb-4">
                    We use cookies and similar tracking technologies to enhance your browsing 
                    experience, analyze website traffic, and understand where our visitors 
                    come from. Cookies are small data files stored on your device.
                  </p>
                  <p className="text-[#A67B5B] leading-relaxed mb-4">
                    Types of cookies we use:
                  </p>
                  <ul className="space-y-2 text-[#5D3A1A]">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      <strong>Essential cookies:</strong> Required for the website to function properly
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      <strong>Analytics cookies:</strong> Help us understand how visitors interact with our website
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      <strong>Marketing cookies:</strong> Used to deliver relevant advertisements
                    </li>
                  </ul>
                  <p className="text-[#A67B5B] mt-4">
                    You can control cookies through your browser settings. Note that disabling 
                    certain cookies may affect the functionality of our website.
                  </p>
                </div>
              </div>

              {/* Section 6 */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <Mail className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Your Rights
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] mb-4">
                    Depending on your location, you may have the following rights regarding 
                    your personal information:
                  </p>
                  <ul className="space-y-2 text-[#5D3A1A]">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Right to access your personal data
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Right to correct inaccurate information
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Right to request deletion of your data
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Right to object to processing
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Right to data portability
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                      Right to withdraw consent
                    </li>
                  </ul>
                  <p className="text-[#A67B5B] mt-4">
                    To exercise these rights, please contact us using the information provided below.
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-[#F5F1E8] p-8 rounded-xl">
                <h2 className="text-2xl font-semibold text-[#5D3A1A] mb-4">
                  Contact Us
                </h2>
                <p className="text-[#A67B5B] mb-4">
                  If you have any questions about this Privacy Policy or our data practices, 
                  please contact us:
                </p>
                <div className="space-y-2 text-[#5D3A1A]">
                  <p><strong>Email:</strong> privacy@ririsemporium.com</p>
                  <p><strong>Address:</strong> 123 Fashion Avenue, Lagos, Nigeria</p>
                  <p><strong>Phone:</strong> +234 123 456 7890</p>
                </div>
              </div>

              {/* Changes to Policy */}
              <div className="mt-12">
                <h2 className="text-2xl font-semibold text-[#5D3A1A] mb-4">
                  Changes to This Policy
                </h2>
                <p className="text-[#A67B5B] leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of 
                  any changes by posting the new Privacy Policy on this page and updating the 
                  "Last Updated" date. We encourage you to review this Privacy Policy periodically 
                  for any changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
