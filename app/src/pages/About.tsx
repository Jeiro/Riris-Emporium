import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Users, 
  Globe, 
  Heart, 
  TrendingUp, 
  Shield,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { value: '50K+', label: 'Happy Customers' },
    { value: '10K+', label: 'Products Sold' },
    { value: '500+', label: 'Brand Partners' },
    { value: '15+', label: 'Years Experience' }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do, ensuring exceptional service and satisfaction.'
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Every product undergoes rigorous quality checks to meet our high standards before reaching you.'
    },
    {
      icon: Globe,
      title: 'Sustainable Practices',
      description: 'We are committed to eco-friendly practices and sustainable sourcing across our supply chain.'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Innovation',
      description: 'We constantly evolve our offerings to bring you the latest trends and cutting-edge products.'
    }
  ];

  const team = [
    {
      name: 'Amara Okafor',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'
    },
    {
      name: 'David Mensah',
      role: 'Chief Operations Officer',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80'
    },
    {
      name: 'Ngozi Adeleke',
      role: 'Head of Design',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80'
    },
    {
      name: 'Emmanuel Ibrahim',
      role: 'Customer Experience Lead',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-[#5D3A1A]">
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
              Our Story
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              About Riris Emporium
            </h1>
            <p className="text-xl text-[#FAF7F2]/80 leading-relaxed">
              We are more than just a store. We are a destination for those who 
              appreciate quality, elegance, and exceptional craftsmanship.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
                Our Mission
              </p>
              <h2 
                className="text-3xl lg:text-4xl font-bold text-[#5D3A1A] mb-6"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Bringing Quality Products to Every Home
              </h2>
              <p className="text-[#A67B5B] mb-6 leading-relaxed">
                Founded in 2009, Riris Emporium began with a simple vision: to create 
                a shopping destination where quality meets affordability. What started 
                as a small boutique has grown into a beloved brand trusted by thousands 
                of customers across Nigeria and beyond.
              </p>
              <p className="text-[#A67B5B] mb-8 leading-relaxed">
                We believe that everyone deserves access to beautifully crafted products 
                that enhance their daily lives. Our curated collections reflect our 
                commitment to excellence, featuring items that combine functionality 
                with timeless design.
              </p>
              <div className="space-y-4">
                {[
                  'Handpicked premium products',
                  'Sustainable and ethical sourcing',
                  'Exceptional customer service',
                  'Hassle-free returns and exchanges'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#8B5A2B] flex-shrink-0" size={20} />
                    <span className="text-[#5D3A1A]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
                alt="Our Store"
                className="rounded-2xl shadow-xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#8B5A2B]/10 rounded-full flex items-center justify-center">
                    <Award className="text-[#8B5A2B]" size={28} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#5D3A1A]">15+</p>
                    <p className="text-[#A67B5B]">Years of Excellence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#F5F1E8]">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl lg:text-5xl font-bold text-[#8B5A2B] mb-2">
                  {stat.value}
                </p>
                <p className="text-[#A67B5B]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              What We Stand For
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Our Core Values
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm border border-[#E8DFD0] hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-[#8B5A2B]/10 rounded-xl flex items-center justify-center mb-6">
                  <value.icon className="text-[#8B5A2B]" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-[#5D3A1A] mb-3">
                  {value.title}
                </h3>
                <p className="text-[#A67B5B] leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24 bg-[#F5F1E8]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              Meet The Team
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              The People Behind Riris Emporium
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-48 h-48 rounded-full object-cover mx-auto shadow-lg"
                  />
                </div>
                <h3 className="text-lg font-semibold text-[#5D3A1A]">{member.name}</h3>
                <p className="text-[#A67B5B]">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-[#8B5A2B] rounded-2xl p-8 lg:p-16 text-center">
            <Users className="mx-auto text-white/80 mb-6" size={48} />
            <h2 
              className="text-3xl lg:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Join Our Community
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Be part of the Riris Emporium family. Discover exclusive deals, 
              early access to new arrivals, and styling tips from our experts.
            </p>
            <Link 
              to="/shop"
              className="inline-flex items-center gap-2 bg-white text-[#8B5A2B] px-8 py-4 rounded-lg font-medium hover:bg-[#F5F1E8] transition-colors"
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
