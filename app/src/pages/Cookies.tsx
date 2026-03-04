import { useEffect } from 'react';
import { Cookie, Shield, Settings, ChevronRight } from 'lucide-react';

export const Cookies = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = 'January 1, 2024';

  const cookieTypes = [
    {
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off in our systems.',
      examples: ['Session cookies', 'Authentication cookies', 'Security cookies'],
      required: true
    },
    {
      name: 'Performance Cookies',
      description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.',
      examples: ['Analytics cookies', 'Error tracking cookies'],
      required: false
    },
    {
      name: 'Functional Cookies',
      description: 'These cookies enable the website to provide enhanced functionality and personalization.',
      examples: ['Language preference cookies', 'User preference cookies'],
      required: false
    },
    {
      name: 'Targeting Cookies',
      description: 'These cookies may be set through our site by our advertising partners to build a profile of your interests.',
      examples: ['Advertising cookies', 'Social media cookies'],
      required: false
    }
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
              Cookie Policy
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              How We Use Cookies
            </h1>
            <p className="text-xl text-[#FAF7F2]/80 leading-relaxed">
              This policy explains how we use cookies and similar technologies 
              on our website.
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

            <div className="prose prose-lg max-w-none">
              <p className="text-[#A67B5B] leading-relaxed mb-8">
                This Cookie Policy explains how Riris Emporium uses cookies and similar 
                technologies to recognize you when you visit our website. It explains 
                what these technologies are and why we use them, as well as your rights 
                to control our use of them.
              </p>

              {/* What are Cookies */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <Cookie className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    What Are Cookies?
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed">
                    Cookies are small data files that are placed on your computer or mobile 
                    device when you visit a website. Cookies are widely used by website owners 
                    in order to make their websites work, or to work more efficiently, as well 
                    as to provide reporting information.
                  </p>
                  <p className="text-[#A67B5B] leading-relaxed mt-4">
                    Cookies set by the website owner (in this case, Riris Emporium) are called 
                    &quot;first-party cookies.&quot; Cookies set by parties other than the website owner 
                    are called &quot;third-party cookies.&quot; Third-party cookies enable third-party 
                    features or functionality to be provided on or through the website.
                  </p>
                </div>
              </div>

              {/* Why We Use Cookies */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <Settings className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Why Do We Use Cookies?
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed mb-4">
                    We use first-party and third-party cookies for several reasons. Some cookies 
                    are required for technical reasons in order for our website to operate, and 
                    we refer to these as &quot;essential&quot; or &quot;strictly necessary&quot; cookies. Other cookies 
                    also enable us to track and target the interests of our users to enhance the 
                    experience on our website.
                  </p>
                  <p className="text-[#A67B5B] leading-relaxed">
                    Third parties serve cookies through our website for advertising, analytics, 
                    and other purposes. This is described in more detail below.
                  </p>
                </div>
              </div>

              {/* Types of Cookies */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <Shield className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    Types of Cookies We Use
                  </h2>
                </div>
                <div className="pl-13 ml-12 space-y-6">
                  {cookieTypes.map((type, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-[#E8DFD0]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-[#5D3A1A]">{type.name}</h3>
                        {type.required && (
                          <span className="px-3 py-1 bg-[#8B5A2B]/10 text-[#8B5A2B] text-xs font-medium rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-[#A67B5B] mb-3">{type.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {type.examples.map((example, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-[#F5F1E8] text-[#5D3A1A] text-sm rounded-full"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to Control Cookies */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center">
                    <Settings className="text-[#8B5A2B]" size={20} />
                  </div>
                  <h2 className="text-2xl font-semibold text-[#5D3A1A]">
                    How Can You Control Cookies?
                  </h2>
                </div>
                <div className="pl-13 ml-12">
                  <p className="text-[#A67B5B] leading-relaxed mb-4">
                    You have the right to decide whether to accept or reject cookies. You can 
                    exercise your cookie preferences by clicking on the appropriate opt-out 
                    links provided in the cookie banner or table above.
                  </p>
                  <p className="text-[#A67B5B] leading-relaxed mb-4">
                    You can also set or amend your web browser controls to accept or refuse cookies. 
                    If you choose to reject cookies, you may still use our website though your 
                    access to some functionality and areas of our website may be restricted.
                  </p>
                  <div className="bg-[#F5F1E8] p-4 rounded-lg">
                    <p className="text-[#5D3A1A] font-medium mb-2">How to disable cookies in your browser:</p>
                    <ul className="space-y-2 text-[#A67B5B]">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                        <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                        <strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                        <strong>Safari:</strong> Preferences → Privacy → Cookies and website data
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                        <strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Changes to Policy */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-[#5D3A1A] mb-4">
                  Changes to This Cookie Policy
                </h2>
                <p className="text-[#A67B5B] leading-relaxed">
                  We may update this Cookie Policy from time to time in order to reflect, for 
                  example, changes to the cookies we use or for other operational, legal, or 
                  regulatory reasons. Please therefore revisit this Cookie Policy regularly to 
                  stay informed about our use of cookies and related technologies.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-[#F5F1E8] p-8 rounded-xl">
                <h2 className="text-2xl font-semibold text-[#5D3A1A] mb-4">
                  Contact Us
                </h2>
                <p className="text-[#A67B5B] mb-4">
                  If you have any questions about our use of cookies or other technologies, 
                  please contact us:
                </p>
                <div className="space-y-2 text-[#5D3A1A]">
                  <p><strong>Email:</strong> privacy@ririsemporium.com</p>
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
