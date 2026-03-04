// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'customer';
  avatar?: string;
  shippingAddresses?: ShippingAddress[];
  emailVerified?: boolean;
  createdAt?: string;
}

export interface ShippingAddress {
  _id?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  sku: string;
  inventory: {
    quantity: number;
    lowStockThreshold: number;
  };
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  ratings: {
    average: number;
    count: number;
  };
  reviews: Review[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
  discountPercentage?: number;
}

// Helper functions for Product
export const isProductInStock = (product: Product): boolean => {
  // Handle Supabase products (with 'stock' property)
  if ((product as any).stock !== undefined) {
    return (product as any).stock > 0;
  }
  // Handle legacy products (with 'inventory' property)
  if (product.inventory?.quantity !== undefined) {
    return product.inventory.quantity > 0;
  }
  // Default to true if we can't determine
  return true;
};

export const isProductLowStock = (product: Product): boolean => {
  // Handle Supabase products
  if ((product as any).stock !== undefined) {
    return (product as any).stock <= 10; // Default threshold
  }
  // Handle legacy products
  if (product.inventory?.quantity !== undefined) {
    return product.inventory.quantity <= product.inventory.lowStockThreshold;
  }
  return false;
};

export interface ProductAttribute {
  name: string;
  values: string[];
}

export interface ProductVariant {
  sku: string;
  attributes: Record<string, string>;
  price: number;
  quantity: number;
}

export interface Review {
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Cart Types
export interface Cart {
  // Both Supabase (id) and legacy (_id) supported
  id?: string;
  _id?: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal?: number;
  tax?: number;
  shipping?: number;
  total: number;
  couponCode?: string;
  coupon?: string | null;
  discount?: number;
  discountAmount?: number;
  discount_amount?: number;
}

export interface CartItem {
  productId: string | Product;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

// Order Types
export interface Order {
  // Both Supabase (id) and legacy Express (_id) supported
  id?: string;
  _id?: string;
  orderNumber?: string;
  userId?: string;
  user_id?: string;
  items: OrderItem[];
  shippingAddress?: Address;
  shipping_address?: any;
  billingAddress?: Address;
  billing_address?: any;
  // Supabase uses flat total; legacy uses pricing object
  total?: number;
  pricing?: Pricing;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingStatus?: 'pending' | 'packed' | 'shipped' | 'delivered';
  trackingNumber?: string;
  tracking_number?: string;
  notes?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface Pricing {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

// Payment Types
export interface Payment {
  _id: string;
  orderId: string;
  userId: string;
  paystackReference: string;
  paystackTransactionId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  paymentMethod?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

// Admin Types
export interface DashboardStats {
  users: {
    total: number;
    newThisMonth: number;
    active: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  products: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
  };
}
