import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Users,
  Heart,
  Zap,
  GraduationCap
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
}

const jobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    salary: '₦500,000 - ₦800,000/month',
    description: 'We are looking for an experienced Frontend Developer to join our engineering team and help build exceptional user experiences.',
    requirements: [
      '5+ years of experience with React and TypeScript',
      'Strong understanding of modern CSS and responsive design',
      'Experience with state management (Redux, Zustand)',
      'Familiarity with testing frameworks',
      'Excellent problem-solving skills'
    ]
  },
  {
    id: '2',
    title: 'Customer Experience Manager',
    department: 'Customer Support',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    salary: '₦300,000 - ₦450,000/month',
    description: 'Lead our customer support team to deliver exceptional service and build lasting relationships with our customers.',
    requirements: [
      '3+ years of experience in customer service management',
      'Excellent communication and leadership skills',
      'Experience with CRM systems',
      'Ability to work under pressure',
      'Bachelor\'s degree preferred'
    ]
  },
  {
    id: '3',
    title: 'Digital Marketing Specialist',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    salary: '₦250,000 - ₦400,000/month',
    description: 'Drive our digital marketing efforts across multiple channels to increase brand awareness and drive sales.',
    requirements: [
      '2+ years of digital marketing experience',
      'Proficiency in Google Ads, Facebook Ads, and SEO',
      'Strong analytical skills',
      'Experience with marketing automation tools',
      'Creative mindset with attention to detail'
    ]
  },
  {
    id: '4',
    title: 'Warehouse Operations Associate',
    department: 'Operations',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    salary: '₦100,000 - ₦150,000/month',
    description: 'Join our operations team to ensure efficient warehouse operations and timely order fulfillment.',
    requirements: [
      'High school diploma or equivalent',
      'Ability to lift up to 25kg',
      'Attention to detail',
      'Good organizational skills',
      'Previous warehouse experience is a plus'
    ]
  }
];

const benefits = [
  {
    icon: Heart,
    title: 'Health Insurance',
    description: 'Comprehensive health coverage for you and your family'
  },
  {
    icon: DollarSign,
    title: 'Competitive Salary',
    description: 'Market-competitive compensation with regular reviews'
  },
  {
    icon: GraduationCap,
    title: 'Learning & Development',
    description: 'Continuous learning opportunities and career growth'
  },
  {
    icon: Zap,
    title: 'Flexible Work',
    description: 'Remote work options and flexible hours'
  },
  {
    icon: Users,
    title: 'Great Culture',
    description: 'Inclusive and collaborative work environment'
  },
  {
    icon: Briefcase,
    title: 'Paid Time Off',
    description: 'Generous vacation days and public holidays'
  }
];

export const Careers = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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
              Join Our Team
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Careers at Riris Emporium
            </h1>
            <p className="text-xl text-[#FAF7F2]/80 leading-relaxed">
              Be part of a team that is shaping the future of e-commerce in Africa. 
              We are always looking for talented individuals to join us.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              Why Join Us
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Benefits & Perks
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl border border-[#E8DFD0] hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-[#8B5A2B]/10 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="text-[#8B5A2B]" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-[#5D3A1A] mb-2">{benefit.title}</h3>
                <p className="text-[#A67B5B]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 lg:py-24 bg-[#F5F1E8]">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[#A67B5B] uppercase tracking-widest text-sm mb-4">
              Current Openings
            </p>
            <h2 
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Open Positions
            </h2>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {jobs.map((job) => (
              <div 
                key={job.id}
                className="bg-white rounded-xl border border-[#E8DFD0] overflow-hidden"
              >
                <button
                  onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                  className="w-full p-6 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-[#5D3A1A]">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-[#A67B5B]">
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#8B5A2B] font-medium">{job.salary}</span>
                    <ArrowRight 
                      size={20} 
                      className={`text-[#8B5A2B] transition-transform ${selectedJob?.id === job.id ? 'rotate-90' : ''}`}
                    />
                  </div>
                </button>
                
                {selectedJob?.id === job.id && (
                  <div className="px-6 pb-6 border-t border-[#E8DFD0] pt-6">
                    <p className="text-[#A67B5B] mb-4">{job.description}</p>
                    <h4 className="font-semibold text-[#5D3A1A] mb-3">Requirements:</h4>
                    <ul className="space-y-2 mb-6">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[#A67B5B]">
                          <CheckCircle2 className="text-[#8B5A2B] flex-shrink-0 mt-1" size={16} />
                          {req}
                        </li>
                      ))}
                    </ul>
                    <Link 
                      to={`/contact?subject=Application for ${job.title}`}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      Apply Now
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-[#8B5A2B] rounded-2xl p-8 lg:p-12 text-center">
            <h2 
              className="text-2xl lg:text-3xl font-bold text-white mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Do not See the Right Role?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-6">
              We are always looking for great talent. Send us your resume and we will 
              keep you in mind for future opportunities.
            </p>
            <Link 
              to="/contact?subject=General Application"
              className="inline-flex items-center gap-2 bg-white text-[#8B5A2B] px-8 py-3 rounded-lg font-medium hover:bg-[#F5F1E8] transition-colors"
            >
              Send Your Resume
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
