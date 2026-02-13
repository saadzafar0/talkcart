'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  MessageCircle,
  ShoppingBag,
  User,
  LogOut,
  Search,
  Menu,
  X,
  Package,
} from 'lucide-react';
import { APP_NAME } from '@/core/utils/constants';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { useChatStore } from '@/stores/useChatStore';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const cartCount = useCartStore((s) => s.count);
  const fetchCartCount = useCartStore((s) => s.fetchCount);
  const clearCartCount = useCartStore((s) => s.clearCount);
  const clearChat = useChatStore((s) => s.clearChat);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchCartCount();
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    clearUser();
    clearChat(); // Clear chat history on logout
    clearCartCount(); // Clear cart count on logout
    router.push('/');
  }

  const navLinks = [
    { href: '/products', label: 'Products' },
    { href: '/orders', label: 'Orders' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-primary-900/95 backdrop-blur-md shadow-lg shadow-primary-900/30">
      {/* Accent gradient line at top */}
      <div className="h-[2px] bg-gradient-to-r from-accent-700 via-accent-500 to-accent-700" />

      <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href={user ? '/dashboard' : '/'} className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-600 to-accent-700 shadow-md shadow-accent-700/25 transition-transform duration-200 group-hover:scale-105">
            <MessageCircle className="h-[18px] w-[18px] text-primary-900" />
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-50">
            Talk<span className="text-accent-500">Cart</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                pathname.startsWith(link.href)
                  ? 'bg-primary-800/80 text-accent-500'
                  : 'text-neutral-300 hover:bg-primary-800/50 hover:text-neutral-50'
              }`}
            >
              {link.label}
              {pathname.startsWith(link.href) && (
                <span className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-accent-500" />
              )}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Search */}
          <Link
            href="/products"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 transition-all duration-200 hover:bg-primary-800/60 hover:text-neutral-100"
            title="Search products"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-neutral-400 transition-all duration-200 hover:bg-primary-800/60 hover:text-neutral-100"
            title="Shopping cart"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-primary-900 shadow-sm shadow-accent-700/40">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Divider */}
          <div className="mx-1.5 hidden h-6 w-px bg-primary-700/60 md:block" />

          {/* User menu */}
          {user ? (
            <div className="hidden items-center gap-1.5 md:flex">
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-accent-600/30 bg-accent-600/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-500 transition-all duration-200 hover:border-accent-500/50 hover:bg-accent-600/20"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-neutral-200 transition-all duration-200 hover:bg-primary-800/60 hover:text-neutral-50"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-700 text-neutral-300">
                  <User className="h-3.5 w-3.5" />
                </div>
                {user.full_name?.split(' ')[0] || 'Account'}
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-500 transition-all duration-200 hover:bg-error-600/15 hover:text-error-500"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2.5 md:flex">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-200 transition-all duration-200 hover:bg-primary-800/60 hover:text-neutral-50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 px-5 py-2 text-sm font-semibold text-primary-900 shadow-md shadow-accent-700/25 transition-all duration-200 hover:shadow-lg hover:shadow-accent-700/30 hover:brightness-110"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-300 transition-all duration-200 hover:bg-primary-800/60 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Bottom subtle border */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-700/50 to-transparent" />

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-primary-800/50 bg-primary-900/98 px-6 py-4 backdrop-blur-md md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith(link.href)
                    ? 'bg-primary-800/80 text-accent-500'
                    : 'text-neutral-300 hover:bg-primary-800/50 hover:text-neutral-50'
                }`}
              >
                {link.href === '/products' && <Search className="h-4 w-4" />}
                {link.href === '/orders' && <Package className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-primary-700/40" />

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-300 transition-all duration-200 hover:bg-primary-800/50 hover:text-neutral-50"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-accent-500 transition-all duration-200 hover:bg-primary-800/50"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-400 transition-all duration-200 hover:bg-primary-800/50 hover:text-neutral-200"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-xl border border-primary-700 px-4 py-2.5 text-center text-sm font-medium text-neutral-200 transition-all duration-200 hover:border-neutral-500 hover:bg-primary-800/50"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 px-4 py-2.5 text-center text-sm font-semibold text-primary-900 transition-all duration-200 hover:brightness-110"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
