import Link from 'next/link';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import { APP_NAME } from '@/core/utils/constants';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-primary-900 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-accent-600" />
              <span className="font-semibold text-neutral-50">{APP_NAME}</span>
            </div>
            <p className="text-sm text-neutral-500">
              Your AI personal shopping assistant. Shop smarter through natural conversation.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-neutral-200">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-neutral-500 transition-colors hover:text-accent-400">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-neutral-500 transition-colors hover:text-accent-400">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm text-neutral-500 transition-colors hover:text-accent-400">
                  Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-neutral-200">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-neutral-500 transition-colors hover:text-accent-400">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-neutral-500 transition-colors hover:text-accent-400">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-neutral-500 transition-colors hover:text-accent-400">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-neutral-200">About</h4>
            <div className="flex items-center gap-1 text-sm text-neutral-500">
              <ShieldCheck className="h-4 w-4" />
              AI-Powered Personal Shopping
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-800 pt-6">
          <p className="text-center text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
