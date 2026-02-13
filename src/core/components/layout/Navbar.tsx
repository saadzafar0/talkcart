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

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchCartCount();
  }, [pathname]);

  async function fetchUser() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }

  async function fetchCartCount() {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.data?.item_count || 0);
      }
    } catch {
      // Silently fail
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  }

  const navLinks = [
    { href: '/products', label: 'Products' },
    { href: '/orders', label: 'Orders' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-primary-800 bg-primary-900">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-accent-600" />
          <span className="text-lg font-bold text-neutral-50">{APP_NAME}</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? 'text-accent-500'
                  : 'text-neutral-300 hover:text-accent-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <Link
            href="/products"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-primary-800 hover:text-accent-400"
          >
            <Search className="h-5 w-5" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-primary-800 hover:text-accent-400"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 text-[10px] font-bold text-primary-900">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* User menu */}
          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-accent-500 transition-colors hover:text-accent-400"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-200 transition-colors hover:text-neutral-50"
              >
                <User className="h-4 w-4" />
                {user.full_name?.split(' ')[0] || 'Account'}
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-primary-800 hover:text-neutral-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className="text-sm font-medium text-neutral-200 transition-colors hover:text-accent-400"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-primary-900 transition-colors hover:bg-accent-500"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-primary-800 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-primary-800 bg-primary-900 px-6 py-4 md:hidden">
          <div className="space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'bg-primary-800 text-accent-500'
                    : 'text-neutral-300 hover:bg-primary-800 hover:text-neutral-50'
                }`}
              >
                {link.href === '/products' && <Search className="h-4 w-4" />}
                {link.href === '/orders' && <Package className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-primary-800 hover:text-neutral-50"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-accent-500 hover:bg-primary-800"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 hover:bg-primary-800 hover:text-neutral-200"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg border border-neutral-600 px-4 py-2 text-center text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-400"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg bg-accent-600 px-4 py-2 text-center text-sm font-semibold text-primary-900 transition-colors hover:bg-accent-500"
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
