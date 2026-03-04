import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks';
import { AdminLayout } from '../../components/layout/AdminLayout';

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  user_id: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; dot: string }> = {
  pending:    { label: 'Pending',    icon: Clock,         bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  processing: { label: 'Processing', icon: RefreshCw,     bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400' },
  shipped:    { label: 'Shipped',    icon: Truck,         bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-400' },
  delivered:  { label: 'Delivered',  icon: CheckCircle2,  bg: 'bg-emerald-50', text: 'text-emerald-700',dot: 'bg-emerald-400' },
  cancelled:  { label: 'Cancelled',  icon: AlertCircle,   bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-400' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status?.toLowerCase()] || { label: status, bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', icon: Clock };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    if (!isAdmin) { setIsLoading(false); return; }
    fetchStats();
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const { data: orders, error: ordersError } = await supabase
        .from('orders').select('*').order('created_at', { ascending: false });
      if (ordersError) throw ordersError;

      const { data: users, error: usersError } = await supabase
        .from('users').select('id').eq('role', 'customer');
      if (usersError) throw usersError;

      const orderList = orders || [];
      setStats({
        totalRevenue:    orderList.reduce((s, o: Order) => s + (o.total || 0), 0),
        totalOrders:     orderList.length,
        totalCustomers:  users?.length || 0,
        pendingOrders:   orderList.filter((o: Order) => o.status === 'pending').length,
        shippedOrders:   orderList.filter((o: Order) => o.status === 'shipped').length,
        deliveredOrders: orderList.filter((o: Order) => o.status === 'delivered').length,
      });

      const { data: recentData } = await supabase
        .from('orders')
        .select('id, order_number, total, status, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(8);

      const enriched = await Promise.all(
        (recentData || []).map(async (order: Order) => {
          const { data: u } = await supabase
            .from('users').select('name, last_name, email').eq('id', order.user_id).single();
          return {
            id: order.id,
            order_number: order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`,
            customer_name: u ? `${u.name || ''} ${u.last_name || ''}`.trim() || 'Customer' : 'Guest',
            customer_email: u?.email || '',
            total: order.total || 0,
            status: order.status || 'pending',
            created_at: order.created_at,
          } as RecentOrder;
        })
      );
      setRecentOrders(enriched);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Dashboard stats error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-[#A67B5B]">You need admin privileges to view this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₦${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      bg: 'bg-emerald-500',
      change: '+12.5%',
      positive: true,
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      bg: 'bg-blue-500',
      change: '+8.2%',
      positive: true,
    },
    {
      label: 'Customers',
      value: stats?.totalCustomers || 0,
      icon: Users,
      bg: 'bg-purple-500',
      change: '+5.1%',
      positive: true,
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Package,
      bg: 'bg-amber-500',
      change: null,
      positive: null,
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-[#A67B5B] uppercase tracking-widest font-semibold mb-1">Overview</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Dashboard
            </h1>
            <p className="text-[#A67B5B] text-sm mt-1">
              Welcome back, <span className="text-[#8B5A2B] font-medium">{user?.firstName}</span>! Here's what's happening today.
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8DFD0] rounded-xl text-sm text-[#5D3A1A] hover:bg-[#F5F1E8] transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl animate-shimmer" />
            ))}
          </div>
        ) : (
          /* Stat Cards */
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#E8DFD0] p-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    {card.change && (
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                        card.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        <ArrowUpRight size={12} /> {card.change}
                      </span>
                    )}
                  </div>
                  <p className="text-[#A67B5B] text-xs mb-1 font-medium uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold text-[#5D3A1A]">{card.value}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Status Summary */}
        {!isLoading && stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Pending',   count: stats.pendingOrders,   cfg: statusConfig.pending },
              { label: 'Shipped',   count: stats.shippedOrders,   cfg: statusConfig.shipped },
              { label: 'Delivered', count: stats.deliveredOrders, cfg: statusConfig.delivered },
            ].map(({ label, count, cfg }) => (
              <div key={label} className={`${cfg.bg} rounded-2xl p-4 border border-transparent`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.text}`}>{label}</span>
                </div>
                <p className={`text-3xl font-bold ${cfg.text}`}>{count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F1E8]">
            <div>
              <h3 className="font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>Recent Orders</h3>
              <p className="text-xs text-[#A67B5B] mt-0.5">Latest {recentOrders.length} transactions</p>
            </div>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1.5 text-sm text-[#8B5A2B] hover:text-[#6B4423] font-medium transition-colors group"
            >
              View All <TrendingUp size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#E8DFD0] border-t-[#8B5A2B] rounded-full animate-spin" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart size={36} className="mx-auto text-[#D4C4A8] mb-3" />
              <p className="text-[#A67B5B]">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAF7F2]">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#A67B5B] uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#A67B5B] uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#A67B5B] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#A67B5B] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-[#A67B5B] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F1E8]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-[#8B5A2B]">
                        {order.order_number || `#${order.id.slice(0,8).toUpperCase()}`}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#5D3A1A]">{order.customer_name}</p>
                        {order.customer_email && (
                          <p className="text-xs text-[#A67B5B]">{order.customer_email}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#A67B5B]">
                        {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-[#5D3A1A]">
                        ₦{order.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
