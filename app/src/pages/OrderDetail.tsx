import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Download,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    phone: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
}

// Mock order data
const mockOrder: Order = {
  id: '1',
  orderNumber: 'RI-2024-001234',
  status: 'shipped',
  createdAt: '2024-01-15T10:30:00Z',
  items: [
    {
      id: '1',
      name: 'Classic Leather Handbag',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&q=80',
      quantity: 1,
      price: 45000
    },
    {
      id: '2',
      name: 'Premium Silk Scarf',
      image: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa33?w=200&q=80',
      quantity: 2,
      price: 15000
    }
  ],
  subtotal: 75000,
  shipping: 2500,
  discount: 0,
  total: 77500,
  shippingAddress: {
    name: 'John Doe',
    street: '123 Main Street, Apt 4B',
    city: 'Lagos',
    state: 'Lagos State',
    phone: '+234 123 456 7890'
  },
  paymentMethod: 'Flutterwave - Card ending in 4242',
  trackingNumber: 'TRK123456789'
};

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: Clock,
    description: 'Your order is being processed'
  },
  processing: {
    label: 'Processing',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: Package,
    description: 'Your order is being prepared'
  },
  shipped: {
    label: 'Shipped',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: Truck,
    description: 'Your order is on the way'
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: CheckCircle2,
    description: 'Your order has been delivered'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: Clock,
    description: 'Your order has been cancelled'
  }
};

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Simulate API call
    setTimeout(() => {
      setOrder(mockOrder);
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success('Invoice downloaded successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5A2B]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen">
        <div className="container-custom py-16 lg:py-24">
          <div className="max-w-md mx-auto text-center">
            <Package className="mx-auto text-[#D4C4A8] mb-4" size={48} />
            <h1 className="text-2xl font-bold text-[#5D3A1A] mb-2">Order Not Found</h1>
            <p className="text-[#A67B5B] mb-6">The order you are looking for does not exist.</p>
            <Link to="/orders" className="btn-primary">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen">
      <div className="container-custom py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#A67B5B] mb-8">
          <Link to="/" className="hover:text-[#8B5A2B]">Home</Link>
          <span>/</span>
          <Link to="/orders" className="hover:text-[#8B5A2B]">Orders</Link>
          <span>/</span>
          <span className="text-[#5D3A1A]">{order.orderNumber}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-[#A67B5B] hover:text-[#8B5A2B] transition-colors mb-2"
            >
              <ArrowLeft size={18} />
              Back to Orders
            </Link>
            <h1
              className="text-3xl lg:text-4xl font-bold text-[#5D3A1A]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Order {order.orderNumber}
            </h1>
            <p className="text-[#A67B5B] mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-[#D4C4A8] rounded-lg text-[#5D3A1A] hover:bg-[#F5F1E8] transition-colors"
            >
              <Printer size={18} />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-[#8B5A2B] text-white rounded-lg hover:bg-[#6B4423] transition-colors"
            >
              <Download size={18} />
              Invoice
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`${status.bgColor} rounded-xl p-6 mb-8`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${status.bgColor} rounded-full flex items-center justify-center`}>
              <StatusIcon className={status.color} size={28} />
            </div>
            <div>
              <p className={`text-lg font-semibold ${status.color}`}>{status.label}</p>
              <p className="text-[#5D3A1A]">{status.description}</p>
            </div>
          </div>
          {order.trackingNumber && (
            <div className="mt-4 pt-4 border-t border-current border-opacity-20">
              <p className="text-sm text-[#5D3A1A]">
                <strong>Tracking Number:</strong> {order.trackingNumber}
              </p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-[#E8DFD0] overflow-hidden">
              <div className="p-6 border-b border-[#E8DFD0]">
                <h2 className="text-xl font-semibold text-[#5D3A1A]">Order Items</h2>
              </div>
              <div className="divide-y divide-[#E8DFD0]">
                {order.items.map((item) => (
                  <div key={item.id} className="p-6 flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.id}`}
                        className="font-medium text-[#5D3A1A] hover:text-[#8B5A2B] transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-[#A67B5B] text-sm mt-1">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-semibold text-[#8B5A2B] mt-2">
                        ₦{item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#5D3A1A]">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-xl border border-[#E8DFD0] overflow-hidden">
              <div className="p-6 border-b border-[#E8DFD0]">
                <h2 className="text-xl font-semibold text-[#5D3A1A]">Order Summary</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-[#A67B5B]">
                  <span>Subtotal</span>
                  <span>₦{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#A67B5B]">
                  <span>Shipping</span>
                  <span>₦{order.shipping.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₦{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#E8DFD0] flex justify-between">
                  <span className="font-semibold text-[#5D3A1A]">Total</span>
                  <span className="font-bold text-xl text-[#8B5A2B]">
                    ₦{order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-[#E8DFD0] overflow-hidden">
              <div className="p-6 border-b border-[#E8DFD0]">
                <div className="flex items-center gap-2">
                  <MapPin className="text-[#8B5A2B]" size={20} />
                  <h2 className="text-lg font-semibold text-[#5D3A1A]">Shipping Address</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="font-medium text-[#5D3A1A]">{order.shippingAddress.name}</p>
                <p className="text-[#A67B5B] mt-1">{order.shippingAddress.street}</p>
                <p className="text-[#A67B5B]">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p className="text-[#A67B5B] mt-2">{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-[#E8DFD0] overflow-hidden">
              <div className="p-6 border-b border-[#E8DFD0]">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-[#8B5A2B]" size={20} />
                  <h2 className="text-lg font-semibold text-[#5D3A1A]">Payment Method</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[#5D3A1A]">{order.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Need Help */}
        <div className="mt-12 bg-[#F5F1E8] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#5D3A1A] mb-2">Need Help?</h3>
          <p className="text-[#A67B5B] mb-4">
            If you have any questions about your order, please contact our customer support team.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-[#8B5A2B] hover:text-[#6B4423] font-medium transition-colors"
          >
            Contact Support
            <ArrowLeft size={18} className="rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
};
