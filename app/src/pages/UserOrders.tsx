import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks';
import { Layout } from '../components/layout/Layout';

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  shipping_address: string;
  created_at: string;
  user_id: string;
}

export const UserOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch ONLY user's own orders
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('id, order_number, total, status, shipping_address, created_at, user_id')
        .eq('user_id', user!.id)  // ← Only their orders
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error fetching orders:', err);
      }
      setError('Failed to load your orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getStatusEmoji = (status: string) => {
    const emojis: Record<string, string> = {
      pending: '⏳',
      processing: '📦',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌'
    };
    return emojis[status?.toLowerCase()] || '📋';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-[#8B5A2B]" size={48} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-[#5D3A1A]" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                My Orders
              </h1>
              <p className="text-[#A67B5B] mt-1">Track your orders and their status</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
              {error}
            </div>
          )}

          {/* Empty State */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-[#E8DFD0] p-12 text-center">
              <p className="text-[#A67B5B] text-lg mb-4">You haven't placed any orders yet</p>
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-2 bg-[#8B5A2B] hover:bg-[#6B4423] text-white rounded-lg font-medium transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm border border-[#E8DFD0] p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getStatusEmoji(order.status)}</span>
                        <div>
                          <h3 className="font-semibold text-[#5D3A1A]">
                            Order #{order.order_number}
                          </h3>
                          <p className="text-sm text-[#A67B5B]">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Address Preview */}
                      {typeof order.shipping_address === 'string' && (
                        <p className="text-sm text-[#A67B5B] mt-2 max-w-md truncate">
                          📍 {order.shipping_address}
                        </p>
                      )}
                    </div>

                    {/* Amount & Status */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#8B5A2B] mb-3">
                        ₦{(order.total || 0).toLocaleString()}
                      </p>
                      <div
                        className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="p-2 hover:bg-[#F5F1E8] rounded-lg text-[#A67B5B] transition-colors"
                      title="View details"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
