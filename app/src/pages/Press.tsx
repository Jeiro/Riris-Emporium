import { useEffect } from 'react';
import { 
  Newspaper, 
  Download, 
  Calendar,
  ArrowRight,
  Mail,
  Image,
  FileText
} from 'lucide-react';

const pressReleases = [
  {
    id: '1',
    title: 'Riris Emporium Raises $5M in Series A Funding',
    date: 'December 15, 2023',
    excerpt: 'The funding will be used to expand operations across Nigeria and launch new product categories.',
    category: 'Company News'
  },
  {
    id: '2',
    title: 'Riris Emporium Launches Same-Day Delivery in Lagos',
    date: 'November 28, 2023',
    excerpt: 'Customers in Lagos can now enjoy same-day delivery on select items, reinforcing our commitment to exceptional service.',
    category: 'Product Launch'
  },
  {
    id: '3',
    title: 'Partnership with Local Artisans Program Announced',
    date: 'October 10, 2023',
    excerpt: 'New initiative to support Nigerian artisans and bring authentic handmade products to our platform.',
    category: 'Partnership'
  },
  {
    id: '4',
    title: 'Riris Emporium Named Among Top 50 E-commerce Companies in Africa',
    date: 'September 5, 2023',
    excerpt: 'Recognition by Tech Africa for innovation and growth in the e-commerce sector.',
    category: 'Award'
  }
];

const mediaKit = [
  {
    title: 'Brand Guidelines',
    description: 'Logo usage, color palette, and brand standards',
    icon: FileText,
    size: '2.5 MB'
  },
  {
    title: 'Press Kit',
    description: 'Company overview, key facts, and executive bios',
    icon: Newspaper,
    size: '5.8 MB'
  },
  {
    title: 'Image Library',
    description: 'High-resolution product and lifestyle images',
    icon: Image,
    size: '150 MB'
  }
];

const mediaCoverage = [
  {
    outlet: 'TechCrunch',
    title: 'How Riris Emporium is Revolutionizing E-commerce in Nigeria',
    date: 'November 2023',
    link: '#'
  },
  {
    outlet: 'Forbes Africa',
    title: 'The Rise of Riris Emporium: A Success Story',
    date: 'October 2023',
    link: '#'
  },
  {
    outlet: 'Business Day',
    title: 'Riris Emporium Expands Operations to 10 New States',
    date: 'September 2023',
    link: '#'
  }
];

export const Press = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              Media Center
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Press & Media
            </h1>
            <p className="text-xl text-[#FAF7F2]/80 leading-relaxed">
              Latest news, press releases, and media resources about Riris Emporium.
            </p>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              Latest Updates
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Press Releases
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pressReleases.map((release) => (
              <div 
                key={release.id}
                className="bg-white p-6 rounded-xl border border-[#E8DFD0] hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-[#8B5A2B]/10 text-[#8B5A2B] text-xs font-medium rounded-full">
                    {release.category}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-[#A67B5B]">
                    <Calendar size={14} />
                    {release.date}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#5D3A1A] mb-2">{release.title}</h3>
                <p className="text-[#A67B5B] text-sm mb-4">{release.excerpt}</p>
                <button className="flex items-center gap-2 text-[#8B5A2B] hover:text-[#6B4423] font-medium transition-colors">
                  Read More
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="py-16 lg:py-24 bg-[#F5F1E8]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              Resources
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Media Kit
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {mediaKit.map((item, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl border border-[#E8DFD0] text-center hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-[#8B5A2B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-[#8B5A2B]" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-[#5D3A1A] mb-1">{item.title}</h3>
                <p className="text-[#A67B5B] text-sm mb-3">{item.description}</p>
                <p className="text-xs text-[#A67B5B] mb-4">{item.size}</p>
                <button className="flex items-center gap-2 mx-auto text-[#8B5A2B] hover:text-[#6B4423] font-medium transition-colors">
                  <Download size={16} />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Coverage */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              In The News
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Media Coverage
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {mediaCoverage.map((article, index) => (
              <a
                key={index}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white p-6 rounded-xl border border-[#E8DFD0] hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-sm text-[#8B5A2B] font-medium">{article.outlet}</span>
                    <h3 className="text-lg font-semibold text-[#5D3A1A] mt-1">{article.title}</h3>
                  </div>
                  <span className="text-sm text-[#A67B5B] flex-shrink-0">{article.date}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-[#F5F1E8]">
        <div className="container-custom">
          <div className="bg-[#8B5A2B] rounded-2xl p-8 lg:p-12 text-center">
            <Mail className="mx-auto text-white/80 mb-4" size={48} />
            <h2 
              className="text-2xl lg:text-3xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Media Inquiries
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-6">
              For press inquiries, interview requests, or additional information, 
              please contact our media relations team.
            </p>
            <a 
              href="mailto:press@ririsemporium.com"
              className="inline-flex items-center gap-2 bg-white text-[#8B5A2B] px-8 py-3 rounded-lg font-medium hover:bg-[#F5F1E8] transition-colors"
            >
              Contact Press Team
              <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
