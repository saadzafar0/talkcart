'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Star,
  ShoppingBag,
  ArrowLeft,
  Check,
  AlertCircle,
  Minus,
  Plus,
  BadgePercent,
  Package,
  Truck,
} from 'lucide-react';
import { ProductImage } from '@/features/products/components/ProductImage';
import { ProductReviews } from '@/features/products/components/ProductReviews';
import { ProductCard } from '@/features/products/components/ProductCard';
import { HaggleDialog } from '@/features/haggle/components/HaggleDialog';
import { LoadingSpinner } from '@/core/components/common/LoadingSpinner';
import { formatPrice, formatRating } from '@/core/utils/formatters';
import { useCartStore } from '@/stores/useCartStore';
import type { Product, ProductVariant } from '@/features/products/types';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  users?: { full_name: string | null } | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [haggleOpen, setHaggleOpen] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products/${slug}?includeVariants=true&includeReviews=true&includeRelated=true`
        );
        if (!res.ok) {
          setError('Product not found.');
          return;
        }
        const data = await res.json();
        const payload = data.data;

        setProduct(payload.product);
        setVariants(payload.variants || []);
        setReviews(payload.reviews || []);

        // Track product view (fire and forget)
        if (payload.product?.id) {
          fetch('/api/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activity_type: 'view_product',
              product_id: payload.product.id,
            }),
          }).catch(() => {});
        }

        // Fetch related products by category
        if (payload.product?.category_id) {
          try {
            const relRes = await fetch(
              `/api/products?category=${payload.product.category_id}&limit=5`
            );
            if (relRes.ok) {
              const relData = await relRes.json();
              const related = (relData.data?.products || []).filter(
                (p: Product) => p.id !== payload.product.id
              );
              setRelatedProducts(related.slice(0, 4));
            }
          } catch {
            // Related products are non-critical — skip silently
          }
        }
      } catch {
        setError('Failed to load product. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug, router]);

  async function handleAddToCart() {
    if (!product) return;
    setAddingToCart(true);
    setError('');
    setAddedToCart(false);

    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: selectedVariant || undefined,
          quantity,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to add to cart');
        return;
      }

      useCartStore.getState().fetchCount();

      // Track add to cart (fire and forget)
      fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: 'add_to_cart',
          product_id: product.id,
          metadata: { quantity, variant_id: selectedVariant },
        }),
      }).catch(() => {});

      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch {
      setError('Something went wrong');
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm text-primary-500 transition-colors hover:text-accent-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-error-500/30 bg-error-500/10 px-4 py-3 text-sm text-error-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    );
  }

  const inStock = product.stock_quantity > 0;
  const images = [product.image_url, ...(product.images || [])].filter(Boolean) as string[];
  const selectedVariantData = variants.find((v) => v.id === selectedVariant);
  const displayPrice = selectedVariantData
    ? product.base_price + selectedVariantData.price_adjustment
    : product.base_price;

  // Unique colors and sizes from variants
  const colors = [...new Set(variants.filter((v) => v.color).map((v) => v.color!))];
  const sizes = [...new Set(variants.filter((v) => v.size).map((v) => v.size!))];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-primary-500 transition-colors hover:text-accent-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>

      {/* Main product section */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <ProductImage images={images} name={product.name} />

        {/* Details */}
        <div>
          <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">
            {product.name}
          </h1>

          {/* Rating */}
          {product.review_count > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(product.rating)
                        ? 'fill-accent-600 text-accent-600'
                        : 'fill-neutral-200 text-neutral-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-primary-900">
                {formatRating(product.rating)}
              </span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-sm text-primary-500 underline-offset-2 hover:underline"
              >
                ({product.review_count} reviews)
              </button>
            </div>
          )}

          {/* Price */}
          <div className="mt-4">
            <span className="text-3xl font-bold text-primary-900">
              {formatPrice(displayPrice)}
            </span>
            {product.minimum_price < product.base_price && (
              <div className="mt-1 flex items-center gap-1 text-sm text-success-600">
                <BadgePercent className="h-4 w-4" />
                Haggle-enabled! Negotiate from {formatPrice(product.minimum_price)}
              </div>
            )}
          </div>

          {/* Stock status */}
          <div className="mt-4">
            {inStock ? (
              <div className="flex items-center gap-1.5 text-sm text-success-600">
                <Check className="h-4 w-4" />
                In stock ({product.stock_quantity} available)
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-error-600">
                <AlertCircle className="h-4 w-4" />
                Out of stock
              </div>
            )}
          </div>

          {/* Variant selectors */}
          {colors.length > 0 && (
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-primary-900">Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const variant = variants.find((v) => v.color === color);
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedVariant(variant?.id || null)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        selectedVariant === variant?.id
                          ? 'border-accent-600 bg-accent-600/10 text-accent-700'
                          : 'border-neutral-200 bg-neutral-100 text-primary-900 hover:border-neutral-300'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-primary-900">Size</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const variant = variants.find((v) => v.size === size);
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedVariant(variant?.id || null)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        selectedVariant === variant?.id
                          ? 'border-accent-600 bg-accent-600/10 text-accent-700'
                          : 'border-neutral-200 bg-neutral-100 text-primary-900 hover:border-neutral-300'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-primary-900">Quantity</label>
            <div className="inline-flex items-center rounded-lg border border-neutral-200 bg-neutral-100">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center text-primary-600 transition-colors hover:text-primary-900"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex h-10 w-12 items-center justify-center border-x border-neutral-200 text-sm font-medium text-primary-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                className="flex h-10 w-10 items-center justify-center text-primary-600 transition-colors hover:text-primary-900"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-error-500/30 bg-error-500/10 px-4 py-3 text-sm text-error-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Add to Cart */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                addedToCart
                  ? 'bg-success-600 text-white'
                  : 'bg-accent-600 text-primary-900 hover:bg-accent-500'
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="h-5 w-5" />
                  Added to Cart!
                </>
              ) : addingToCart ? (
                'Adding...'
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </button>
            {product.minimum_price < product.base_price && inStock && (
              <button
                onClick={() => setHaggleOpen(true)}
                className="flex items-center gap-2 rounded-lg border-2 border-accent-600 px-4 py-3 text-sm font-semibold text-accent-700 transition-colors hover:bg-accent-600/10"
              >
                <BadgePercent className="h-5 w-5" />
                Haggle
              </button>
            )}
          </div>

          {/* Shipping info */}
          <div className="mt-6 space-y-2 rounded-lg border border-neutral-200 bg-neutral-100 p-4">
            <div className="flex items-center gap-2 text-sm text-primary-600">
              <Truck className="h-4 w-4 text-accent-700" />
              Standard shipping: $5.00
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-600">
              <Package className="h-4 w-4 text-accent-700" />
              Express shipping: $15.00
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Reviews */}
      <div className="mt-12">
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab('description')}
            className={`border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'description'
                ? 'border-accent-600 text-accent-700'
                : 'border-transparent text-primary-500 hover:text-primary-900'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'border-accent-600 text-accent-700'
                : 'border-transparent text-primary-500 hover:text-primary-900'
            }`}
          >
            Reviews ({product.review_count})
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'description' ? (
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-primary-600">
                {product.description || 'No description available.'}
              </p>
            </div>
          ) : (
            <ProductReviews
              reviews={reviews}
              averageRating={product.rating}
              reviewCount={product.review_count}
            />
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-primary-900">Related Products</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Haggle Dialog */}
      {product.minimum_price < product.base_price && (
        <HaggleDialog
          isOpen={haggleOpen}
          onClose={() => setHaggleOpen(false)}
          productId={product.id}
          productName={product.name}
          originalPrice={product.base_price}
          minimumPrice={product.minimum_price}
        />
      )}
    </div>
  );
}
