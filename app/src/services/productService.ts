import { supabase } from '../lib/supabase';
import { mapSupabaseProductToFrontend } from '../lib/dataMapping';
import type { Product, ProductFilters, PaginationMeta } from '../types';

interface ProductsResponse {
  data: Product[];
  meta: PaginationMeta;
}

export const productService = {
  // Get all products
  getProducts: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    try {
      let query = supabase.from('products').select('*');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const offset = (page - 1) * limit;

      // Get total count
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: (data || []).map(mapSupabaseProductToFrontend),
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Supabase error fetching products:', error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (id: string): Promise<Product> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return mapSupabaseProductToFrontend(data);
    } catch (error) {
      console.error('Supabase error fetching product:', error);
      throw error;
    }
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .neq('category', null);

      if (error) throw error;

      // Get unique categories
      const categories = Array.from(new Set(data?.map(p => p.category).filter(Boolean) || []));
      return categories as string[];
    } catch (error) {
      console.error('Supabase error fetching categories:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string, page = 1, limit = 12): Promise<ProductsResponse> => {
    try {
      const offset = (page - 1) * limit;

      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: (data || []).map(mapSupabaseProductToFrontend),
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Supabase error fetching products by category:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(mapSupabaseProductToFrontend);
    } catch (error) {
      console.error('Supabase error fetching featured products:', error);
      throw error;
    }
  },

  // Create product (admin)
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    try {
      const insertPayload: any = {
        name: data.name,
        description: data.description,
        price: data.price,
        image: (data as any).image || (data.images?.[0] ?? null),
        category: data.category,
        stock: (data as any).stock ?? (data as any).inventory?.quantity ?? 0,
        featured: (data as any).featured ?? data.isFeatured ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      return mapSupabaseProductToFrontend(newProduct);
    } catch (error) {
      console.error('Supabase error creating product:', error);
      throw error;
    }
  },

  // Update product (admin)
  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    try {
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return mapSupabaseProductToFrontend(updatedProduct);
    } catch (error) {
      console.error('Supabase error updating product:', error);
      throw error;
    }
  },

  // Delete product (admin)
  deleteProduct: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Supabase error deleting product:', error);
      throw error;
    }
  },

  // Add review
  addReview: async (productId: string, rating: number, comment: string): Promise<Product> => {
    try {
      // Insert review
      const { error: reviewError } = await supabase.from('reviews').insert({
        product_id: productId,
        rating,
        comment,
        created_at: new Date().toISOString()
      });

      if (reviewError) throw reviewError;

      // Get updated product
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      return mapSupabaseProductToFrontend(product);
    } catch (error) {
      console.error('Supabase error adding review:', error);
      throw error;
    }
  }
};
