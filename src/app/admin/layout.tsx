'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderOpen,
  Ticket,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/discounts', label: 'Discounts', icon: Ticket },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ full_name: string | null; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.role !== 'admin') {
          router.push('/');
        } else {
          setUser(data.data);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-primary-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-full w-64 bg-primary-900 text-neutral-50 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-primary-700">
          <h1 className="text-xl font-bold">TalkChart</h1>
          <p className="text-sm text-neutral-300 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  active
                    ? 'bg-primary-800 text-accent-500 border-l-3 border-accent-600'
                    : 'text-neutral-200 hover:bg-primary-800 hover:text-neutral-50 border-l-3 border-transparent'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-primary-700 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-6 py-3 text-sm text-neutral-200 hover:bg-primary-800 hover:text-neutral-50"
          >
            <ExternalLink size={18} />
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-3 text-sm text-neutral-200 hover:bg-primary-800 hover:text-neutral-50 w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-primary-900"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="text-sm text-primary-600">
            Welcome, {user.full_name || 'Admin'}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
