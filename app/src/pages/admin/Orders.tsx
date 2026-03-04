import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  AlertCircle,
  Truck,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks';
import { AdminLayout } from '../../components/layout/AdminLayout';

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: number;
  status: string;
  shipping_address: string | Record<string, string>;
  created_at: string;
  user_id: string;
}

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  processing: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  shipped: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status?.toLowerCase()] ?? { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

const formatAddress = (addr: string | Record<string, string> | null): string => {
  if (!addr) return 'Not provided';
  if (typeof addr === 'object') {
    const { address, city, state, zipCode } = addr;
    return [address, city, state, zipCode].filter(Boolean).join(', ');
  }
  return String(addr);
};

export const AdminOrders = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!isAdmin) { setError('Admin access required'); setIsLoading(false); return; }
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (selectedStatus !== 'all') query = query.eq('status', selectedStatus);
      if (searchQuery) query = query.ilike('order_number', `%${searchQuery}%`);

      const { data, error: fetchError } = await query.limit(50);
      if (fetchError) throw fetchError;

      const enriched = await Promise.all(
        (data || []).map(async (order: OrderData) => {
          const { data: u } = await supabase
            .from('users').select('name, last_name, email, phone').eq('id', order.user_id).single();
          return {
            ...order,
            customer_name: u ? `${u.name || ''} ${u.last_name || ''}`.trim() || 'Customer' : 'Guest',
            customer_email: u?.email || '',
            customer_phone: u?.phone || '—',
            total: order.total || 0,
            status: order.status || 'pending',
          };
        })
      );
      setOrders(enriched);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Orders fetch error:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, selectedStatus, searchQuery]);

  useEffect(() => {
    const t = setTimeout(fetchOrders, searchQuery ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      if (import.meta.env.DEV) console.error('Status update error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
            <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-[#A67B5B]">Admin access required.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs text-[#A67B5B] uppercase tracking-widest font-semibold mb-1">Manage</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Orders
            </h1>
            <p className="text-[#A67B5B] text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
          </div>
          <button
            onClick={() => fetchOrders()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8DFD0] rounded-xl text-sm text-[#5D3A1A] hover:bg-[#F5F1E8] transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#E8DFD0] p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={16} />
              <input
                type="text"
                placeholder="Search by order number…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-[#D4C4A8] rounded-xl bg-[#FAF7F2] text-[#5D3A1A] text-sm placeholder:text-[#A67B5B]/60 focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/25 focus:border-[#8B5A2B] transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', ...STATUS_OPTIONS].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${selectedStatus === s
                    ? 'bg-[#8B5A2B] text-white shadow-sm'
                    : 'bg-[#F5F1E8] text-[#5D3A1A] hover:bg-[#E8DFD0]'
                    }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E8DFD0] shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-10 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#E8DFD0] border-t-[#8B5A2B] rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-14 text-center">
              <Truck size={40} className="mx-auto text-[#D4C4A8] mb-3" />
              <h3 className="text-lg font-semibold text-[#5D3A1A] mb-1">No orders found</h3>
              <p className="text-[#A67B5B] text-sm">Try changing the filter or search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#F5F1E8]">
                    {['Order #', 'Customer', 'Shipping Address', 'Date', 'Amount', 'Status', 'Update Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#A67B5B] uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F1E8]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="px-5 py-4 font-mono text-sm font-bold text-[#8B5A2B] whitespace-nowrap">
                        {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#5D3A1A]">{order.customer_name}</p>
                        <p className="text-xs text-[#A67B5B]">{order.customer_email}</p>
                        {order.customer_phone !== '—' && (
                          <p className="text-xs text-[#A67B5B]">{order.customer_phone}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#A67B5B] max-w-[180px]">
                        <span className="line-clamp-2">{formatAddress(order.shipping_address)}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#A67B5B] whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#5D3A1A] whitespace-nowrap">
                        ₦{order.total.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className="appearance-none text-xs pl-3 pr-8 py-2 border border-[#D4C4A8] rounded-lg bg-[#FAF7F2] text-[#5D3A1A] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]/25 focus:border-[#8B5A2B] transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A67B5B] pointer-events-none" />
                        </div>
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
