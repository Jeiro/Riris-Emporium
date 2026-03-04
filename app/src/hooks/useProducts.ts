import { useState, useCallback } from 'react';
import { productService } from '../services';
import type { Product, ProductFilters } from '../types';

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProduct: (id: string) => Promise<Product>;
  fetchCategories: () => Promise<string[]>;
  fetchFeaturedProducts: () => Promise<void>;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts(filters);
      setProducts(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
      setCurrentPage(response.meta.page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProduct = useCallback(async (id: string): Promise<Product> => {
    const product = await productService.getProduct(id);
    return product;
  }, []);

  const fetchCategories = useCallback(async (): Promise<string[]> => {
    const categories = await productService.getCategories();
    return categories;
  }, []);

  const fetchFeaturedProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const products = await productService.getFeaturedProducts();
      setProducts(products);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch featured products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    products,
    isLoading,
    error,
    total,
    totalPages,
    currentPage,
    fetchProducts,
    fetchProduct,
    fetchCategories,
    fetchFeaturedProducts
  };
};
