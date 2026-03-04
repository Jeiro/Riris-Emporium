// Data mapping utilities to convert between Supabase schema and frontend types
import type { Product } from '../types';

interface SupabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  image?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  sku?: string;
  stock?: number;
  featured?: boolean;
  ratings?: number;
  reviews?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Convert Supabase product to frontend Product type
 * Supabase uses: id, image, stock, featured, etc.
 * Frontend expects: _id, images[], inventory.quantity, isFeatured, etc.
 */
export const mapSupabaseProductToFrontend = (supabaseProduct: SupabaseProduct): Product => {
  return {
    _id: supabaseProduct.id,
    name: supabaseProduct.name,
    description: supabaseProduct.description,
    price: supabaseProduct.price,
    compareAtPrice: supabaseProduct.compare_at_price,
    images: supabaseProduct.image ? [supabaseProduct.image] : [],
    category: supabaseProduct.category || 'uncategorized',
    subcategory: supabaseProduct.subcategory,
    tags: supabaseProduct.tags || [],
    sku: supabaseProduct.sku || supabaseProduct.id,
    inventory: {
      quantity: supabaseProduct.stock || 0,
      lowStockThreshold: 10
    },
    attributes: [],
    variants: [],
    ratings: {
      average: supabaseProduct.ratings || 0,
      count: supabaseProduct.reviews || 0
    },
    reviews: [],
    isActive: true,
    isFeatured: supabaseProduct.featured || false,
    createdAt: supabaseProduct.created_at,
    updatedAt: supabaseProduct.updated_at,
    discountPercentage: 0
  };
};

/**
 * Convert frontend Product to Supabase product format
 */
export const mapFrontendProductToSupabase = (product: Product): SupabaseProduct => {
  return {
    id: product._id,
    name: product.name,
    description: product.description,
    price: product.price,
    compare_at_price: product.compareAtPrice,
    image: product.images?.[0] ?? undefined,
    category: product.category,
    stock: product.inventory?.quantity || 0,
    featured: product.isFeatured || false,
    ratings: product.ratings?.average || 0,
    reviews: product.ratings?.count || 0,
    created_at: product.createdAt || new Date().toISOString(),
    updated_at: product.updatedAt || new Date().toISOString()
  };
};

interface SupabaseUser {
  id: string;
  name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  role?: string;
  avatar_url?: string;
  created_at: string;
}

interface FrontendUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  shippingAddresses: unknown[];
  emailVerified: boolean;
  createdAt: string;
}

/**
 * Map Supabase user to frontend User type
 */
export const mapSupabaseUserToFrontend = (supabaseUser: SupabaseUser): FrontendUser => {
  return {
    id: supabaseUser.id,
    firstName: supabaseUser.name || '',
    lastName: supabaseUser.last_name || '',
    email: supabaseUser.email,
    phone: supabaseUser.phone,
    role: supabaseUser.role || 'user',
    avatar: supabaseUser.avatar_url,
    shippingAddresses: [],
    emailVerified: true,
    createdAt: supabaseUser.created_at
  };
};
