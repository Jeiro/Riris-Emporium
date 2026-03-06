import { useState } from 'react';
import {
  Store,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Mail,
  Save,
  Loader2,
  Globe,
  Zap,
  Lock,
  MessageSquare,
  Gift,
  ArrowRight
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'store', label: 'Commercial Identity', icon: Store, description: 'Store branding and public details' },
    { id: 'payment', label: 'Transaction Suite', icon: CreditCard, description: 'Gateways and payment methods' },
    { id: 'shipping', label: 'Logistics Center', icon: Truck, description: 'Shipping zones and delivery rates' },
    { id: 'notifications', label: 'Alert Protocols', icon: Bell, description: 'Customer and admin notifications' },
    { id: 'security', label: 'Security Vault', icon: Shield, description: 'Access control and verification' }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    toast.success('Configuration synchronized successfully');
    setIsSaving(false);
  };

  const SectionHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>{title}</h3>
      <p className="text-[#A67B5B] text-sm mt-1">{subtitle}</p>
    </div>
  );

  const FormField = ({ label, children, description }: { label: string, children: React.ReactNode, description?: string }) => (
    <div className="space-y-2">
      <Label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-[0.2em] ml-1">{label}</Label>
      {children}
      {description && <p className="text-[10px] text-[#A67B5B] italic ml-1 opacity-70">{description}</p>}
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-[0.3em] mb-2">System Configuration</p>
            <h1 className="text-4xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>Execution Center</h1>
            <p className="text-[#A67B5B] text-sm mt-1">Fine-tune your store's operational parameters.</p>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-14 px-10 bg-[#8B5A2B] hover:bg-[#6B4423] text-white rounded-2xl shadow-xl shadow-[#8B5A2B]/20 transition-all hover:-translate-y-0.5 group"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save className="mr-2 group-hover:scale-110 transition-transform" size={20} />}
            <span className="font-bold uppercase tracking-widest text-xs">Save Configuration</span>
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Navigation Cards */}
          <div className="lg:col-span-4 space-y-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-5 rounded-3xl border transition-all duration-500 flex items-start gap-4 ${isActive
                    ? 'bg-[#3B1F0A] border-[#3B1F0A] text-white shadow-2xl shadow-black/10 -translate-y-1'
                    : 'bg-white border-[#E8DFD0] text-[#5D3A1A] hover:border-[#8B5A2B] hover:bg-[#FAF7F2]'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-white/10 text-white' : 'bg-[#FAF7F2] text-[#8B5A2B]'}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${isActive ? 'text-white' : 'text-[#5D3A1A]'}`}>{tab.label}</p>
                    <p className={`text-[10px] mt-1 ${isActive ? 'text-white/60' : 'text-[#A67B5B]'}`}>{tab.description}</p>
                  </div>
                  {isActive && <ArrowRight size={16} className="mt-4 opacity-40" />}
                </button>
              );
            })}
          </div>

          {/* Content Panel */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[40px] border border-[#E8DFD0] p-8 lg:p-12 shadow-sm min-h-[600px] animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B5A2B]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              {activeTab === 'store' && (
                <div className="space-y-10">
                  <SectionHeader title="Commercial Identity" subtitle="Manage how your brand is perceived globally." />
                  <div className="grid sm:grid-cols-2 gap-8">
                    <FormField label="Brand Name" description="Used on emails and order invoices.">
                      <Input className="h-12 border-[#D4C4A8] rounded-xl focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B]" defaultValue="Riris Emporium" />
                    </FormField>
                    <FormField label="Support Email" description="Customers will use this for queries.">
                      <Input className="h-12 border-[#D4C4A8] rounded-xl focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B]" defaultValue="support@ririsemporium.com" />
                    </FormField>
                  </div>
                  <FormField label="Flagship Address" description="Official physical location of the brand.">
                    <Textarea className="rounded-2xl border-[#D4C4A8] focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] min-h-[100px]" defaultValue="123 Fashion Street, Victoria Island, Lagos, Nigeria" />
                  </FormField>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <FormField label="Functional Currency">
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={16} />
                        <select className="w-full h-12 pl-12 pr-4 border border-[#D4C4A8] rounded-xl bg-white text-sm font-bold text-[#5D3A1A] focus:outline-none">
                          <option>Nigerian Naira (₦)</option>
                          <option>US Dollar ($)</option>
                        </select>
                      </div>
                    </FormField>
                    <FormField label="Applicable Tax (%)">
                      <Input type="number" className="h-12 border-[#D4C4A8] rounded-xl" defaultValue="7.5" />
                    </FormField>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div className="space-y-10">
                  <SectionHeader title="Transaction Suite" subtitle="Configure your secure financial gateways." />

                  <div className="p-6 bg-[#FAF7F2] rounded-[32px] border border-[#E8DFD0] space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#8B5A2B] border border-[#E8DFD0]">
                          <Zap size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-[#5D3A1A]">Flutterwave Integration</p>
                          <p className="text-[10px] text-[#A67B5B] uppercase tracking-widest font-bold">Standard Primary Gateway</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="grid gap-4 pt-4 border-t border-[#E8DFD0]/50">
                      <FormField label="Public API Key">
                        <Input type="password" value="sb_publishable_UQwf73BGRDEavviH12Oprw_PIoihs0T" className="h-12 border-[#D4C4A8] rounded-xl font-mono text-xs" />
                      </FormField>
                      <FormField label="Secret API Key">
                        <Input type="password" value="sk_test_********************************" className="h-12 border-[#D4C4A8] rounded-xl font-mono text-xs" />
                      </FormField>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="p-6 border border-[#E8DFD0] rounded-3xl flex items-center justify-between hover:bg-[#FAF7F2] transition-colors">
                      <div className="flex items-center gap-3">
                        <Gift size={20} className="text-[#8B5A2B]" />
                        <span className="text-sm font-bold text-[#5D3A1A]">Coupons & Gifts</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="p-6 border border-[#E8DFD0] rounded-3xl flex items-center justify-between hover:bg-[#FAF7F2] transition-colors">
                      <div className="flex items-center gap-3">
                        <MessageSquare size={20} className="text-[#8B5A2B]" />
                        <span className="text-sm font-bold text-[#5D3A1A]">Live Checkout Chat</span>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-10">
                  <SectionHeader title="Logistics Center" subtitle="Define your global reach and delivery protocols." />
                  <div className="p-8 bg-[#3B1F0A] rounded-[32px] text-white space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Gift size={20} /></div>
                      <p className="text-sm font-bold">Free Shipping Threshold</p>
                    </div>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-bold">₦50,000</span>
                      <span className="text-white/40 text-[10px] uppercase font-bold mb-2 tracking-widest">Global Limit</span>
                    </div>
                    <p className="text-white/60 text-xs">Excludes international express logistics.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <FormField label="Standard Domestic (₦)">
                      <Input className="h-12 border-[#D4C4A8] rounded-xl font-bold" defaultValue="2500" />
                    </FormField>
                    <FormField label="Express Logistics (₦)">
                      <Input className="h-12 border-[#D4C4A8] rounded-xl font-bold" defaultValue="5000" />
                    </FormField>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <SectionHeader title="Alert Protocols" subtitle="Synchronize communications across all channels." />
                  {[
                    { icon: Mail, label: 'Order Confirmation Lifecycle', desc: 'Automatic status updates for customers' },
                    { icon: Zap, label: 'Inventory Depletion Alert', desc: 'Notify team when stock falls below 10%' },
                    { icon: Globe, label: 'Marketing Campaigns', desc: 'Engage clients via periodic newsletters' }
                  ].map((n, i) => (
                    <div key={i} className="flex items-center justify-between p-6 border border-[#E8DFD0] rounded-3xl hover:bg-[#FAF7F2] transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white border border-[#E8DFD0] rounded-2xl flex items-center justify-center text-[#8B5A2B] group-hover:scale-110 transition-transform">
                          <n.icon size={20} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-[#5D3A1A]">{n.label}</p>
                          <p className="text-[10px] text-[#A67B5B] uppercase tracking-wider font-bold">{n.desc}</p>
                        </div>
                      </div>
                      <Switch defaultChecked={i !== 2} />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-10">
                  <SectionHeader title="Security Vault" subtitle="Reinforce the perimeter of your store infrastructure." />
                  <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-200 flex gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm flex-shrink-0">
                      <Lock size={28} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-amber-900">Advanced Access Control</h4>
                      <p className="text-sm text-amber-800/80 leading-relaxed">
                        For maximum security, cryptographic settings and multi-factor authentication for administrators are managed in the <b>Member Profile</b> suite.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between p-6 border border-[#E8DFD0] rounded-3xl">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#5D3A1A]">Client Identity Verification</p>
                        <p className="text-[10px] text-[#A67B5B] uppercase font-bold tracking-widest">Require email link activation for new accounts</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-6 border border-[#E8DFD0] rounded-3xl">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#5D3A1A]">Session Persistence Protocol</p>
                        <p className="text-[10px] text-[#A67B5B] uppercase font-bold tracking-widest">Auto-session termination after 24h inactivity</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
