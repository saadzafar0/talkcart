'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react';
import { CartItemRow } from '@/features/cart/components/CartItem';
import { CartSummaryPanel } from '@/features/cart/components/CartSummary';
import { DiscountCodeInput } from '@/features/cart/components/DiscountCodeInput';
import { LoadingSpinner } from '@/core/components/common/LoadingSpinner';
import { EmptyState } from '@/core/components/common/EmptyState';
import type { CartSummary } from '@/features/cart/types';

export default function CartPage() {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [appliedCode, setAppliedCode] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  // When chat applies a haggle coupon, refetch and apply it
  useEffect(() => {
    function onDiscountApplied() {
      fetchCart().then((cartData) => {
        const savedCode = sessionStorage.getItem('discount_code');
        const savedMeta = sessionStorage.getItem('discount_meta');
        if (savedCode && savedMeta && cartData) {
          try {
            const meta = JSON.parse(savedMeta);
            let discountAmount = 0;
            if (meta.discount_type === 'percentage') {
              discountAmount = cartData.subtotal * (meta.discount_value / 100);
              if (meta.max_discount_amount && discountAmount > meta.max_discount_amount) {
                discountAmount = meta.max_discount_amount;
              }
            } else if (meta.discount_type === 'fixed') {
              discountAmount = meta.discount_value;
            }
            discountAmount = Math.min(discountAmount, cartData.subtotal);
            discountAmount = Math.round(discountAmount * 100) / 100;
            setCart({
              ...cartData,
              discount: discountAmount,
              total: Math.round((cartData.subtotal - discountAmount) * 100) / 100,
            });
            setAppliedCode(savedCode);
          } catch {
            /* ignore */
          }
        }
      });
    }
    window.addEventListener('discount-code-applied', onDiscountApplied);
    return () => window.removeEventListener('discount-code-applied', onDiscountApplied);
  }, []);

  // Restore and reapply discount when cart loads
  useEffect(() => {
    if (!cart || cart.discount > 0) return; // Already has discount or no cart

    const savedCode = sessionStorage.getItem('discount_code');
    const savedMeta = sessionStorage.getItem('discount_meta');
    
    if (savedCode && savedMeta) {
      try {
        const meta = JSON.parse(savedMeta);
        
        // Recalculate discount
        let discountAmount = 0;
        if (meta.discount_type === 'percentage') {
          discountAmount = cart.subtotal * (meta.discount_value / 100);
          if (meta.max_discount_amount && discountAmount > meta.max_discount_amount) {
            discountAmount = meta.max_discount_amount;
          }
        } else if (meta.discount_type === 'fixed') {
          discountAmount = meta.discount_value;
        }
        discountAmount = Math.min(discountAmount, cart.subtotal);
        discountAmount = Math.round(discountAmount * 100) / 100;

        // Apply discount to cart
        setCart({
          ...cart,
          discount: discountAmount,
          total: Math.round((cart.subtotal - discountAmount) * 100) / 100,
        });
        setAppliedCode(savedCode);
      } catch (e) {
        // Invalid saved data, clear it
        sessionStorage.removeItem('discount_code');
        sessionStorage.removeItem('discount_meta');
      }
    }
    // Only run when cart.subtotal changes from API, not when we update discount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.subtotal]);

  async function fetchCart(): Promise<CartSummary | null> {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        const cartData = data.data as CartSummary;
        setCart(cartData);
        return cartData;
      } else if (res.status === 401) {
        setError('Please log in to view your cart.');
      } else {
        setError('Failed to load cart. Please try again.');
      }
    } catch {
      setError('Failed to load cart. Please check your connection.');
    } finally {
      setLoading(false);
    }
    return null;
  }

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return;
    setUpdating(true);
    setError('');
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId, quantity }),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedCart = data.data;
        
        // Reapply discount if one was applied
        const savedMeta = sessionStorage.getItem('discount_meta');
        if (savedMeta && appliedCode) {
          try {
            const meta = JSON.parse(savedMeta);
            let discountAmount = 0;
            
            if (meta.discount_type === 'percentage') {
              discountAmount = updatedCart.subtotal * (meta.discount_value / 100);
              if (meta.max_discount_amount && discountAmount > meta.max_discount_amount) {
                discountAmount = meta.max_discount_amount;
              }
            } else if (meta.discount_type === 'fixed') {
              discountAmount = meta.discount_value;
            }
            
            discountAmount = Math.min(discountAmount, updatedCart.subtotal);
            discountAmount = Math.round(discountAmount * 100) / 100;
            
            updatedCart.discount = discountAmount;
            updatedCart.total = Math.round((updatedCart.subtotal - discountAmount) * 100) / 100;
          } catch (e) {
            // Failed to reapply, clear discount
            sessionStorage.removeItem('discount_code');
            sessionStorage.removeItem('discount_meta');
            setAppliedCode('');
          }
        }
        
        setCart(updatedCart);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update quantity.');
      }
    } catch {
      setError('Failed to update quantity. Please try again.');
    } finally {
      setUpdating(false);
    }
  }

  async function handleRemoveItem(itemId: string) {
    setUpdating(true);
    setError('');
    try {
      const res = await fetch(`/api/cart/remove/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        const updatedCart = data.data;
        
        // Reapply discount if one was applied
        const savedMeta = sessionStorage.getItem('discount_meta');
        if (savedMeta && appliedCode) {
          try {
            const meta = JSON.parse(savedMeta);
            let discountAmount = 0;
            
            if (meta.discount_type === 'percentage') {
              discountAmount = updatedCart.subtotal * (meta.discount_value / 100);
              if (meta.max_discount_amount && discountAmount > meta.max_discount_amount) {
                discountAmount = meta.max_discount_amount;
              }
            } else if (meta.discount_type === 'fixed') {
              discountAmount = meta.discount_value;
            }
            
            discountAmount = Math.min(discountAmount, updatedCart.subtotal);
            discountAmount = Math.round(discountAmount * 100) / 100;
            
            updatedCart.discount = discountAmount;
            updatedCart.total = Math.round((updatedCart.subtotal - discountAmount) * 100) / 100;
          } catch (e) {
            // Failed to reapply, clear discount
            sessionStorage.removeItem('discount_code');
            sessionStorage.removeItem('discount_meta');
            setAppliedCode('');
          }
        }
        
        setCart(updatedCart);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to remove item.');
      }
    } catch {
      setError('Failed to remove item. Please try again.');
    } finally {
      setUpdating(false);
    }
  }

  async function handleApplyDiscount(code: string) {
    setDiscountError('');
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const data = await res.json();
        setDiscountError(data.error || 'Invalid discount code');
        return;
      }

      const data = await res.json();
      const meta = data.data;

      // Check if cart meets minimum purchase requirement
      if (cart && meta.min_purchase_amount && cart.subtotal < meta.min_purchase_amount) {
        setDiscountError(`Minimum purchase of $${meta.min_purchase_amount.toFixed(2)} required`);
        return;
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (cart) {
        if (meta.discount_type === 'percentage') {
          discountAmount = cart.subtotal * (meta.discount_value / 100);
          // Apply max discount cap if exists
          if (meta.max_discount_amount && discountAmount > meta.max_discount_amount) {
            discountAmount = meta.max_discount_amount;
          }
        } else if (meta.discount_type === 'fixed') {
          discountAmount = meta.discount_value;
        }
        // Ensure discount doesn't exceed subtotal
        discountAmount = Math.min(discountAmount, cart.subtotal);
        discountAmount = Math.round(discountAmount * 100) / 100;

        // Update cart with discount
        setCart({
          ...cart,
          discount: discountAmount,
          total: Math.round((cart.subtotal - discountAmount) * 100) / 100,
        });
      }

      sessionStorage.setItem('discount_code', meta.code);
      sessionStorage.setItem('discount_meta', JSON.stringify({
        discount_type: meta.discount_type,
        discount_value: meta.discount_value,
        max_discount_amount: meta.max_discount_amount,
      }));
      setAppliedCode(meta.code);
    } catch {
      setDiscountError('Failed to validate discount code');
    }
  }

  function handleRemoveDiscount() {
    // Clear discount from cart
    if (cart) {
      setCart({
        ...cart,
        discount: 0,
        total: cart.subtotal,
      });
    }
    
    // Clear from state and storage
    setAppliedCode('');
    sessionStorage.removeItem('discount_code');
    sessionStorage.removeItem('discount_meta');
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-error-500/30 bg-error-500/10 px-4 py-3 text-sm text-error-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="Your cart is empty"
          description="Browse our products and add items to your cart to get started."
          action={
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-primary-900 transition-colors hover:bg-accent-500"
            >
              Browse Products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-primary-500 transition-colors hover:text-accent-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>

      <h1 className="mb-8 text-3xl font-bold text-primary-900">Shopping Cart</h1>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-error-500/30 bg-error-500/10 px-4 py-3 text-sm text-error-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
              disabled={updating}
            />
          ))}

          {/* Discount code */}
          <div className="mt-6">
            <DiscountCodeInput
              onApply={handleApplyDiscount}
              onRemove={handleRemoveDiscount}
              appliedCode={appliedCode}
              error={discountError}
            />
          </div>
        </div>

        {/* Summary */}
        <div>
          <CartSummaryPanel cart={cart} />
        </div>
      </div>
    </div>
  );
}
