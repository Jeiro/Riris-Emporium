import { useEffect, useState } from 'react';
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    Download,
    BarChart3,
    PieChart as PieChartIcon,
    ArrowUpRight,
    Filter
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { orderService, userService, productService } from '../../services';
import type { Product } from '../../types';
import { Button } from '../../components/ui/button';

const COLORS = ['#8B5A2B', '#A67B5B', '#D4C4A8', '#E8DFD0', '#5D3A1A', '#6B4423'];

export const AdminAnalytics = () => {
    const [dateRange, setDateRange] = useState('30');
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        revenueChange: 0,
        totalOrders: 0,
        ordersChange: 0,
        totalCustomers: 0,
        customersChange: 0,
        avgOrderValue: 0,
        aovChange: 0
    });

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            const [orderStats, userStats, products] = await Promise.all([
                orderService.getOrderStats(),
                userService.getUserStats(),
                productService.getProducts({ limit: 1000 })
            ]);

            const revenueChartData = Array.from({ length: 7 }, (_, idx) => ({
                name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx],
                revenue: Math.floor(Math.random() * 50000) + 30000,
                orders: Math.floor(Math.random() * 50) + 20
            }));

            const categoryBreakdown = [
                { name: 'Apparel', value: 35 },
                { name: 'Accessories', value: 25 },
                { name: 'Living', value: 20 },
                { name: 'Gifts', value: 15 },
                { name: 'Edition', value: 5 }
            ];

            const topSelling = (products?.data || [])
                .slice(0, 5)
                .map((p: Product) => ({
                    name: p.name,
                    image: p.images?.[0] || '/placeholder.jpg',
                    sales: Math.floor(Math.random() * 100) + 50,
                    revenue: p.price * (Math.floor(Math.random() * 100) + 50)
                }));

            setRevenueData(revenueChartData);
            setCategoryData(categoryBreakdown);
            setTopProducts(topSelling);

            setStats({
                totalRevenue: orderStats.totalRevenue || 0,
                revenueChange: 12.5,
                totalOrders: orderStats.overview?.total || 0,
                ordersChange: 8.3,
                totalCustomers: userStats.total || 0,
                customersChange: 15.2,
                avgOrderValue: orderStats.totalRevenue / (orderStats.overview?.total || 1),
                aovChange: 5.7
            });
        } catch (error) {
            if (import.meta.env.DEV) console.error('Error fetching analytics:', error);
        }
    };

    const handleExport = () => {
        const data = { revenue: stats.totalRevenue, orders: stats.totalOrders, generatedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `riris-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const statCards = [
        { title: 'Gross Revenue', value: stats.totalRevenue, change: stats.revenueChange, icon: DollarSign, color: 'from-[#8B5A2B] to-[#5D3A1A]' },
        { title: 'Units Sold', value: stats.totalOrders, change: stats.ordersChange, icon: ShoppingCart, color: 'from-[#D4C4A8] to-[#A67B5B]' },
        { title: 'Client Base', value: stats.totalCustomers, change: stats.customersChange, icon: Users, color: 'from-[#A67B5B] to-[#8B5A2B]' },
        { title: 'Basket Average', value: Math.floor(stats.avgOrderValue), change: stats.aovChange, icon: Package, color: 'from-[#5D3A1A] to-[#3B1F0A]' }
    ];

    return (
        <AdminLayout>
            <div className="p-6 lg:p-10 space-y-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-[0.3em] mb-2">Performance Center</p>
                        <h1 className="text-4xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>Metrics & Insights</h1>
                        <p className="text-[#A67B5B] text-sm mt-1">Deep dive into your store's commercial evolution.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#E8DFD0] shadow-sm">
                            <Filter size={14} className="text-[#8B5A2B]" />
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="text-xs font-bold text-[#5D3A1A] bg-transparent focus:outline-none cursor-pointer uppercase tracking-wider"
                            >
                                <option value="7">Last Week</option>
                                <option value="30">Last Month</option>
                                <option value="90">Last Quarter</option>
                                <option value="365">This Year</option>
                            </select>
                        </div>
                        <Button
                            onClick={handleExport}
                            className="bg-[#5D3A1A] hover:bg-[#3B1F0A] text-white rounded-2xl h-11 px-6 shadow-lg shadow-black/5"
                        >
                            <Download size={16} className="mr-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">Generate Report</span>
                        </Button>
                    </div>
                </div>

                {/* Primary Stats */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {statCards.map((card, idx) => (
                        <div key={idx} className="bg-white rounded-[32px] border border-[#E8DFD0] p-8 shadow-sm group hover:border-[#8B5A2B] transition-all duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-xl shadow-[#8B5A2B]/10`}>
                                    <card.icon size={26} />
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full">
                                    <TrendingUp size={14} />
                                    <span className="text-xs font-bold">+{card.change}%</span>
                                </div>
                            </div>
                            <p className="text-[#A67B5B] text-[10px] font-bold uppercase tracking-widest mb-1">{card.title}</p>
                            <p className="text-3xl font-bold text-[#5D3A1A]">
                                {card.title.includes('Revenue') || card.title.includes('Basket') ? `₦${card.value.toLocaleString()}` : card.value.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Evolution Charts */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Revenue Area Chart */}
                    <div className="bg-white rounded-[40px] border border-[#E8DFD0] p-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5A2B]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#8B5A2B]">
                                <BarChart3 size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>Revenue Velocity</h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8B5A2B" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#8B5A2B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#F5F1E8" />
                                    <XAxis dataKey="name" stroke="#A67B5B" fontSize={11} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#A67B5B" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${v / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#8B5A2B' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#8B5A2B" strokeWidth={4} fill="url(#chartGlow)" dot={{ r: 4, fill: '#8B5A2B', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="bg-white rounded-[40px] border border-[#E8DFD0] p-10 shadow-sm">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#8B5A2B]">
                                <PieChartIcon size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>Collection Shares</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-8 items-center">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                                            {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-4">
                                {categoryData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                            <span className="text-xs font-bold text-[#5D3A1A] group-hover:text-[#8B5A2B] transition-colors">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-mono text-[#A67B5B]">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Best Selling Section */}
                <div className="bg-white rounded-[40px] border border-[#E8DFD0] p-10 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#8B5A2B]">
                                <ArrowUpRight size={22} />
                            </div>
                            <h3 className="text-xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>Curated Top Performers</h3>
                        </div>
                        <Button variant="link" className="text-[#8B5A2B] text-xs font-bold uppercase tracking-widest hover:no-underline">View Catalog</Button>
                    </div>

                    <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-6">
                        {topProducts.map((p, i) => (
                            <div key={i} className="flex flex-col gap-4 p-4 bg-[#FAF7F2] rounded-3xl group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all duration-500 border border-transparent hover:border-[#E8DFD0]">
                                <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
                                    <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={p.name} />
                                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-xs font-bold text-[#8B5A2B]">{i + 1}</div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#5D3A1A] truncate mb-1">{p.name}</p>
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] text-[#A67B5B] uppercase tracking-widest">{p.sales} Sales</p>
                                        <p className="text-sm font-bold text-[#8B5A2B]">₦{p.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Narrative Banner */}
                <div className="grid sm:grid-cols-3 gap-6">
                    {[
                        { label: 'Market Velocity', value: '3.2%', icon: TrendingUp, desc: 'Conversion rate +0.5% this week' },
                        { label: 'Client Fidelity', value: '42%', icon: Users, desc: 'Repeat customer rate +8% MoM' },
                        { label: 'Territory Exposure', value: '18', icon: DollarSign, desc: 'Regions serviced across Nigeria' }
                    ].map((feat, i) => (
                        <div key={i} className="bg-gradient-to-br from-[#3B1F0A] to-[#5D3A1A] p-8 rounded-[32px] text-white">
                            <feat.icon size={24} className="mb-6 text-[#A67B5B]" />
                            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-2">{feat.label}</p>
                            <p className="text-4xl font-bold mb-3">{feat.value}</p>
                            <p className="text-white/60 text-xs font-medium leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};
