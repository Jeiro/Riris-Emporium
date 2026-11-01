import { useEffect, useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  CheckCircle2
} from 'lucide-react';
import { BUSINESS_EMAIL, prepareContactDraft } from '../lib/contact';

export const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [draft, setDraft] = useState<ReturnType<typeof prepareContactDraft> | null>(null);
  const [error, setError] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDraft(null); setError(''); setCopied(false);
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setCopied(false);
    try { setDraft(prepareContactDraft(formData)); }
    catch (error) { setDraft(null); setError(error instanceof Error ? error.message : 'Could not prepare your email.'); }
  };
  const copyDraft = async () => {
    if (!draft || isCopying) return;
    setIsCopying(true); setCopied(false); setError('');
    try { await navigator.clipboard.writeText(draft.body); setCopied(true); }
    catch { setError('Could not copy the draft. Select the text below and copy it manually.'); }
    finally { setIsCopying(false); }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: [BUSINESS_EMAIL]
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['Phone number to be confirmed']
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['Store address to be confirmed']
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Opening hours to be confirmed']
    }
  ];

  const faqItems = [
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days within Lagos and 5-7 business days for other states in Nigeria. Express shipping is available for 1-2 business days delivery.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all unused items in their original packaging. Simply initiate a return through your account dashboard or contact our support team.'
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Currently, we only ship within Nigeria. We are working on expanding our shipping services to other countries soon.'
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you will receive an email with a tracking number. You can use this number to track your package on our website or the courier\'s website.'
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
              Get In Touch
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Contact Us
            </h1>
            <p className="text-xl text-[#FAF7F2]/80 leading-relaxed">
              We would love to hear from you. Reach out to us for any inquiries, 
              feedback, or assistance.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-10">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-[#E8DFD0] text-center"
              >
                <div className="w-14 h-14 bg-[#8B5A2B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <info.icon className="text-[#8B5A2B]" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-[#5D3A1A] mb-2">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-[#A67B5B]">{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
                Prepare an Email
              </p>
              <h2 
                className="text-3xl lg:text-4xl font-bold text-[#5D3A1A] mb-6"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                How Can We Help?
              </h2>
              <p className="text-[#A67B5B] mb-8">
                Prepare an email to Ririsemporium@gmail.com. You will need to send it from your email app. This website does not send or store your message.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-[#5D3A1A] mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="contact-name" name="name" maxLength={100}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-[#D4C4A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 bg-white"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-[#5D3A1A] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="contact-email" name="email" maxLength={254}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-[#D4C4A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 bg-white"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-[#5D3A1A] mb-2">
                    Subject
                  </label>
                  <select
                    id="contact-subject" name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-[#D4C4A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 bg-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Status</option>
                    <option value="returns">Returns & Refunds</option>
                    <option value="product">Product Information</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-[#5D3A1A] mb-2">
                    Message
                  </label>
                  <textarea
                    id="contact-message" name="message" maxLength={2000}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-[#D4C4A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 bg-white resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  <Send size={18} />
                  Prepare Email
                </button>
                {error && <p role="alert" className="text-red-600">{error}</p>}
                {draft && <div className="bg-[#F5F1E8] p-4 rounded-xl space-y-3">
                  <p role="status">Your draft is ready. Nothing has been sent. Open your email app, review the draft and send it yourself.</p>
                  <a href={draft.mailto} className="btn-primary inline-flex">Open email app</a>
                  <p>If no email app opens, copy the draft into an email to {BUSINESS_EMAIL}.</p>
                  <textarea aria-label="Email draft" readOnly value={draft.body} rows={6} className="w-full p-3 border rounded-lg" />
                  <button type="button" disabled={isCopying} onClick={copyDraft} className="text-[#8B5A2B] font-medium">{isCopying ? 'Copying…' : 'Copy draft'}</button>
                  {copied && <p role="status">Draft copied. Paste it into your email app to send.</p>}
                </div>}
              </form>
            </div>

            {/* Map & Social */}
            <div className="space-y-8">
              {/* Map Placeholder */}
              <div className="bg-[#F5F1E8] rounded-xl overflow-hidden h-80">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126093.78244234723!2d3.2839596!3d6.5243793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf50cbeabf029%3A0xdbf93ed5a7924e47!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Map of Lagos; store location is not confirmed"
                />
              </div>

              <p className="text-sm text-[#A67B5B]">Map shows Lagos, not a confirmed store address.</p>
              {/* Social Links */}
              <div className="bg-white p-6 rounded-xl border border-[#E8DFD0]">
                <h3 className="text-lg font-semibold text-[#5D3A1A] mb-4 flex items-center gap-2">
                  <MessageCircle size={20} className="text-[#8B5A2B]" />
                  Connect With Us
                </h3>
                <p className="text-sm text-[#A67B5B] mb-4">Social profiles to be confirmed.</p>
                <div className="flex gap-4">
                  <a
                    aria-disabled="true" aria-label="Facebook profile not yet confirmed"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center text-[#8B5A2B] hover:bg-[#8B5A2B] hover:text-white transition-colors"
                  >
                    <Facebook size={24} />
                  </a>
                  <a
                    aria-disabled="true" aria-label="Instagram profile not yet confirmed"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center text-[#8B5A2B] hover:bg-[#8B5A2B] hover:text-white transition-colors"
                  >
                    <Instagram size={24} />
                  </a>
                  <a
                    aria-disabled="true" aria-label="Twitter profile not yet confirmed"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center text-[#8B5A2B] hover:bg-[#8B5A2B] hover:text-white transition-colors"
                  >
                    <Twitter size={24} />
                  </a>
                </div>
              </div>

              {/* Quick Support */}
              <div className="bg-[#8B5A2B] p-6 rounded-xl text-white">
                <h3 className="text-lg font-semibold mb-2">Need Quick Support?</h3>
                <p className="text-white/80 mb-4">
                  Email us for assistance. Response times are not yet confirmed.
                </p>
                <a 
                  href={`mailto:${BUSINESS_EMAIL}`}
                  className="inline-flex items-center gap-2 bg-white text-[#8B5A2B] px-4 py-2 rounded-lg font-medium hover:bg-[#F5F1E8] transition-colors"
                >
                  <Mail size={18} />
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-[#F5F1E8]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              Common Questions
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Frequently Asked Questions
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqItems.map((faq, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl border border-[#E8DFD0]"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-[#8B5A2B] flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-[#5D3A1A] mb-2">{faq.question}</h3>
                    <p className="text-[#A67B5B] text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
