import type { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const ProductGrid = ({ 
  products, 
  isLoading = false, 
  emptyMessage = 'No products found' 
}: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#8B5A2B]" size={48} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-[#A67B5B]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        // Handle both _id (legacy) and id (Supabase)
        const key = (product as any)._id || (product as any).id || Math.random().toString();
        return <ProductCard key={key} product={product} />;
      })}
    </div>
  );
};
