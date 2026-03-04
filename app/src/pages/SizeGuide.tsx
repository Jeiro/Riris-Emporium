import { useEffect, useState } from 'react';
import { Ruler, Info } from 'lucide-react';

interface SizeChart {
  category: string;
  headers: string[];
  rows: string[][];
}

const sizeCharts: SizeChart[] = [
  {
    category: 'Women\'s Clothing',
    headers: ['Size', 'Bust (cm)', 'Waist (cm)', 'Hips (cm)', 'US', 'UK'],
    rows: [
      ['XS', '82-85', '64-67', '90-93', '0-2', '4-6'],
      ['S', '86-89', '68-71', '94-97', '4-6', '8-10'],
      ['M', '90-93', '72-75', '98-101', '8-10', '12-14'],
      ['L', '94-97', '76-79', '102-105', '12-14', '16-18'],
      ['XL', '98-101', '80-83', '106-109', '16-18', '20-22'],
      ['XXL', '102-105', '84-87', '110-113', '20-22', '24-26']
    ]
  },
  {
    category: 'Men\'s Clothing',
    headers: ['Size', 'Chest (cm)', 'Waist (cm)', 'Hips (cm)', 'US', 'UK'],
    rows: [
      ['XS', '86-89', '71-74', '86-89', '34', '34'],
      ['S', '90-93', '75-78', '90-93', '36', '36'],
      ['M', '94-97', '79-82', '94-97', '38', '38'],
      ['L', '98-101', '83-86', '98-101', '40', '40'],
      ['XL', '102-105', '87-90', '102-105', '42', '42'],
      ['XXL', '106-109', '91-94', '106-109', '44', '44']
    ]
  },
  {
    category: 'Shoes',
    headers: ['EU', 'US Women', 'US Men', 'UK', 'Foot Length (cm)'],
    rows: [
      ['35', '5', '3.5', '2.5', '22'],
      ['36', '6', '4.5', '3.5', '23'],
      ['37', '6.5', '5', '4', '23.5'],
      ['38', '7.5', '6', '5', '24'],
      ['39', '8.5', '6.5', '6', '25'],
      ['40', '9', '7', '6.5', '25.5'],
      ['41', '9.5', '8', '7', '26'],
      ['42', '10', '8.5', '7.5', '26.5'],
      ['43', '10.5', '9.5', '8.5', '27.5'],
      ['44', '11', '10', '9', '28']
    ]
  }
];

export const SizeGuide = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState(0);

  const currentChart = sizeCharts[activeTab];

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
              Find Your Perfect Fit
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Size Guide
            </h1>
            <p className="text-xl text-[#FAF7F2]/80 leading-relaxed">
              Use our size charts to find the perfect fit for your body measurements.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <div className="container-custom">
          {/* How to Measure */}
          <div className="bg-[#F5F1E8] rounded-xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Ruler className="text-[#8B5A2B]" size={24} />
              <h2 className="text-2xl font-semibold text-[#5D3A1A]">How to Measure</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-[#5D3A1A] mb-2">Bust/Chest</h3>
                <p className="text-[#A67B5B] text-sm">
                  Measure around the fullest part of your bust/chest, keeping the tape measure 
                  horizontal and snug but not tight.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#5D3A1A] mb-2">Waist</h3>
                <p className="text-[#A67B5B] text-sm">
                  Measure around your natural waistline, which is the narrowest part of your 
                  torso, typically just above your belly button.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#5D3A1A] mb-2">Hips</h3>
                <p className="text-[#A67B5B] text-sm">
                  Measure around the fullest part of your hips, keeping the tape measure 
                  horizontal and at the widest point of your buttocks.
                </p>
              </div>
            </div>
          </div>

          {/* Size Chart Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {sizeCharts.map((chart, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === index
                      ? 'bg-[#8B5A2B] text-white'
                      : 'bg-[#F5F1E8] text-[#5D3A1A] hover:bg-[#E8DFD0]'
                  }`}
                >
                  {chart.category}
                </button>
              ))}
            </div>
          </div>

          {/* Size Chart Table */}
          <div className="bg-white rounded-xl border border-[#E8DFD0] overflow-hidden">
            <div className="p-6 border-b border-[#E8DFD0]">
              <h2 className="text-xl font-semibold text-[#5D3A1A]">{currentChart.category}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F5F1E8]">
                    {currentChart.headers.map((header, index) => (
                      <th 
                        key={index}
                        className="px-6 py-4 text-left text-sm font-semibold text-[#5D3A1A]"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFD0]">
                  {currentChart.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-[#F5F1E8]/50 transition-colors">
                      {row.map((cell, cellIndex) => (
                        <td 
                          key={cellIndex}
                          className={`px-6 py-4 ${
                            cellIndex === 0 ? 'font-medium text-[#5D3A1A]' : 'text-[#A67B5B]'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-12 bg-[#8B5A2B]/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Info className="text-[#8B5A2B] flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-[#5D3A1A] mb-2">Sizing Tips</h3>
                <ul className="space-y-2 text-[#A67B5B]">
                  <li>• If you are between sizes, we recommend sizing up for a more comfortable fit.</li>
                  <li>• Different brands may have slight variations in sizing.</li>
                  <li>• Check the product description for specific fit information.</li>
                  <li>• For the most accurate measurements, have someone assist you.</li>
                  <li>• Measure yourself in underwear or form-fitting clothing.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
