import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  ArrowRight,
  Store
} from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: 'All Collection', href: '/shop' },
      { name: 'New Arrivals', href: '/shop?sort=-createdAt' },
      { name: 'Best Sellers', href: '/shop?featured=true' },
      { name: 'Featured Product', href: '/shop' }
    ],
    company: [
      { name: 'Our Story', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Career Paths', href: '/careers' },
      { name: 'Press Room', href: '/press' }
    ],
    support: [
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Track Order', href: '/profile' },
      { name: 'Common FAQs', href: '/faq' },
      { name: 'Return Policy', href: '/returns' }
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Cookies', href: '/cookies' }
    ]
  };

  return (
    <footer className="bg-[#3B1F0A] text-[#FAF7F2] pt-20 overflow-hidden relative">
      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#8B5A2B]/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#D4C4A8]/5 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 pb-16">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <Link to="/" className="flex items-center gap-3 mb-6 group">
                <div className="w-10 h-10 bg-gradient-to-br from-[#D4C4A8] to-[#8B5A2B] rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                  <Store size={20} className="text-[#3B1F0A]" />
                </div>
                <div>
                  <span className="text-3xl font-bold block leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>Riris</span>
                  <span className="text-[10px] text-[#A67B5B] uppercase tracking-[0.3em] font-bold">Emporium</span>
                </div>
              </Link>
              <p className="text-[#A67B5B] text-sm leading-relaxed max-w-sm">
                Exquisite collections for the modern connoisseur. We bridge the gap between legacy craftsmanship and contemporary luxury.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4C4A8]">Stay Updated</h4>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="name@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/40 focus:border-[#8B5A2B]/50 transition-all font-medium"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-[#8B5A2B] hover:bg-[#A67B5B] text-white px-6 rounded-xl transition-all shadow-lg flex items-center justify-center">
                  <ArrowRight size={18} />
                </button>
              </div>
              <p className="text-[10px] text-[#A67B5B] px-1">By subscribing, you agree to our Privacy Policy and Terms of Service.</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title}>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4C4A8] mb-6">{title}</h4>
                  <ul className="space-y-4">
                    {links.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className="text-sm text-[#A67B5B] hover:text-[#D4C4A8] hover:translate-x-1 inline-block transition-all duration-300"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid md:grid-cols-3 gap-6 py-10 border-t border-white/5">
          <a href="mailto:hello@ririsemporium.com" className="group flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#8B5A2B] group-hover:scale-110 transition-transform">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-wider">Email Us</p>
              <p className="text-sm font-medium text-white">hello@ririsemporium.com</p>
            </div>
          </a>
          <a href="tel:+2348072105878" className="group flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#8B5A2B] group-hover:scale-110 transition-transform">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-wider">Call Directly</p>
              <p className="text-sm font-medium text-white">+234 (0) 807 210 5878</p>
            </div>
          </a>
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl group transition-all">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#8B5A2B] group-hover:scale-110 transition-transform">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-wider">Global HQ</p>
              <p className="text-sm font-medium text-white">Lagos, Nigeria</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright stuff */}
        <div className="py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[#A67B5B] text-[11px] uppercase tracking-widest font-bold">
            &copy; {currentYear} Riris Emporium. Curated for the few.
          </p>
          <div className="flex items-center gap-6">
            {[
              { icon: Facebook, label: 'Facebook' },
              { icon: Instagram, label: 'Instagram' },
              { icon: Twitter, label: 'Twitter' }
            ].map((social) => (
              <a
                key={social.label}
                href="#"
                className="text-[#A67B5B] hover:text-white transition-colors"
                aria-label={social.label}
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
