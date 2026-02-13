'use client';

import { ProductCard } from './ProductCard';
import type { Product } from '@/features/products/types';

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (productId: string) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
