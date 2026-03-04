import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, ChevronRight } from 'lucide-react';
import { ProductGrid } from '../components/product/ProductGrid';
import { productService } from '../services';
import type { Product } from '../types';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featured, newProducts] = await Promise.all([
          productService.getFeaturedProducts(8),
          productService.getProducts({ limit: 4 }).then(r => r.data)
        ]);
        setFeaturedProducts(featured);
        setNewArrivals(newProducts);
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error fetching products:', error);
        setFeaturedProducts([]);
        setNewArrivals([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const features = [
    { icon: Truck, title: 'Free Shipping', description: 'On orders over ₦10,000', color: 'bg-emerald-50 text-emerald-600' },
    { icon: Shield, title: 'Secure Payment', description: '100% secure with Paystack', color: 'bg-blue-50 text-blue-600' },
    { icon: RefreshCw, title: 'Easy Returns', description: '30-day return policy', color: 'bg-amber-50 text-amber-600' },
    { icon: Headphones, title: '24/7 Support', description: 'Dedicated support team', color: 'bg-purple-50 text-purple-600' }
  ];

  const categories = [
    { name: 'Clothing', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', href: '/shop?category=Clothing' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80', href: '/shop?category=Accessories' },
    { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', href: '/shop?category=Home' },
    { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', href: '/shop?category=Beauty' },
  ];

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Full-bleed background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80)' }}
        >
          {/* Multi-layer gradient for drama */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3B1F0A]/90 via-[#5D3A1A]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* Floating decorative circle */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#8B5A2B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="container-custom relative z-10 py-24">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-[#D4C4A8] rounded-full animate-pulse" />
              <span className="text-white/80 text-xs uppercase tracking-[0.15em] font-medium">New Collection 2026</span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.05]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Discover <br />
              <span className="italic text-[#D4C4A8]">Elegance</span> &amp; <br />
              Style
            </h1>

            <p className="text-white/75 text-lg leading-relaxed mb-10 max-w-lg">
              Explore our curated collection of premium products designed to bring
              luxury and comfort to your everyday life.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="flex items-center gap-2 px-8 py-4 rounded-lg font-medium border-2 border-white/40 text-white hover:bg-white/10 backdrop-blur-sm transition-all">
                Learn More <ChevronRight size={18} />
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10">
              <div className="flex -space-x-2">
                {['A', 'B', 'C', 'D'].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5A2B] to-[#5D3A1A] border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-white/70 text-sm"><span className="text-white font-semibold">2,000+</span> happy customers</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-white/30" />
          <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
        </div>
      </section>

      {/* ── Features strip ── */}
      <section className="py-10 bg-white border-y border-[#E8DFD0]">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#F5F1E8] transition-colors group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#5D3A1A] text-sm">{feature.title}</h3>
                  <p className="text-xs text-[#A67B5B] mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Grid ── */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Browse by Category</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Shop Your Style
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={cat.href}
                className="group relative aspect-square rounded-2xl overflow-hidden block"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5D3A1A]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-bold text-white text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>{cat.name}</h3>
                  <p className="text-white/70 text-xs flex items-center gap-1 mt-1 group-hover:text-white transition-colors">
                    Shop now <ArrowRight size={12} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-16 lg:py-24 bg-[#F5F1E8]">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-label mb-3">Curated Selection</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Featured Products
              </h2>
            </div>
            <Link
              to="/shop?featured=true"
              className="hidden sm:flex items-center gap-2 text-[#8B5A2B] hover:text-[#6B4423] font-semibold text-sm transition-colors group"
            >
              View All
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <ProductGrid products={featuredProducts} isLoading={isLoading} />
          <div className="mt-8 text-center sm:hidden">
            <Link to="/shop?featured=true" className="btn-secondary">View All Products</Link>
          </div>
        </div>
      </section>

      {/* ── Promotional Banner ── */}
      <section className="py-20 bg-[#5D3A1A] relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B5A2B]/20 rounded-full blur-3xl" />
        <div className="container-custom relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <p className="section-label text-[#D4C4A8] mb-4">New Collection</p>
              <h2
                className="text-3xl lg:text-5xl font-bold mb-6 leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Elevate Your Style <br />
                <span className="italic text-[#D4C4A8]">This Season</span>
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">
                Discover our latest arrivals featuring premium materials,
                timeless designs, and exceptional craftsmanship.
              </p>
              <Link
                to="/shop?sort=-createdAt"
                className="inline-flex items-center gap-3 bg-white text-[#5D3A1A] px-8 py-4 rounded-xl font-semibold hover:bg-[#F5F1E8] transition-colors group"
              >
                Explore New Arrivals
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80"
                alt="Fashion"
                className="rounded-2xl w-full h-56 object-cover shadow-xl"
              />
              <img
                src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80"
                alt="Style"
                className="rounded-2xl w-full h-56 object-cover shadow-xl mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-label mb-3">Just Landed</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                New Arrivals
              </h2>
            </div>
            <Link
              to="/shop?sort=-createdAt"
              className="hidden sm:flex items-center gap-2 text-[#8B5A2B] hover:text-[#6B4423] font-semibold text-sm transition-colors group"
            >
              View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <ProductGrid products={newArrivals} isLoading={isLoading} />
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-16 bg-[#F5F1E8]">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <p className="section-label mb-4">Stay Connected</p>
            <h2 className="text-3xl font-bold text-[#5D3A1A] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Join Our Community
            </h2>
            <p className="text-[#A67B5B] mb-8">
              Subscribe to receive exclusive offers, early access to new arrivals,
              and styling tips from our experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-5 py-3.5 border border-[#D4C4A8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/30 focus:border-[#8B5A2B] bg-white text-[#5D3A1A] placeholder:text-[#A67B5B]/60 transition-all"
              />
              <button className="btn-primary whitespace-nowrap px-8 py-3.5 rounded-xl">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-[#A67B5B] mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
