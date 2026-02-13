"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  ShoppingBag,
  Package,
  LogOut,
  User,
  Search,
  BadgePercent,
  ArrowRight,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-accent-600" />
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-primary-900">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-accent-600" />
            <span className="text-lg font-bold text-neutral-50">
              TalkChart
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-neutral-200">
              <User className="h-4 w-4" />
              {user.full_name || user.email}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-600 px-3 py-1.5 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-400 hover:text-neutral-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900">
            Hey, {firstName}!
          </h1>
          <p className="mt-1 text-primary-600">
            Welcome to your personal shopping dashboard.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/products"
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-100 p-5 transition-all hover:border-accent-600/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-600/10 transition-colors group-hover:bg-accent-600/20">
              <Search className="h-6 w-6 text-accent-700" />
            </div>
            <div>
              <div className="font-semibold text-primary-900">
                Browse Products
              </div>
              <div className="text-sm text-primary-600">
                Explore the catalog
              </div>
            </div>
          </Link>

          <Link
            href="/cart"
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-100 p-5 transition-all hover:border-accent-600/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-600/10 transition-colors group-hover:bg-accent-600/20">
              <ShoppingBag className="h-6 w-6 text-accent-700" />
            </div>
            <div>
              <div className="font-semibold text-primary-900">My Cart</div>
              <div className="text-sm text-primary-600">View your items</div>
            </div>
          </Link>

          <Link
            href="/orders"
            className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-100 p-5 transition-all hover:border-accent-600/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-600/10 transition-colors group-hover:bg-accent-600/20">
              <Package className="h-6 w-6 text-accent-700" />
            </div>
            <div>
              <div className="font-semibold text-primary-900">Orders</div>
              <div className="text-sm text-primary-600">Track purchases</div>
            </div>
          </Link>
        </div>

        {/* AI Clerk CTA */}
        <div
          className="rounded-xl p-8 text-neutral-50"
          style={{ background: "linear-gradient(135deg, #423E37 0%, #6E675F 100%)" }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Talk to your AI Clerk</h2>
              <p className="mt-2 max-w-md text-neutral-300">
                Ask for recommendations, find products, negotiate prices, or
                checkout — all through natural conversation.
              </p>
            </div>
            <button className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent-600 px-6 py-3 font-semibold text-primary-900 transition-colors hover:bg-accent-500">
              <MessageCircle className="h-5 w-5" />
              Open Chat
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-primary-900">
            Account Details
          </h2>
          <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-primary-500">Full Name</dt>
                <dd className="mt-1 font-medium text-primary-900">
                  {user.full_name || "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-primary-500">Email</dt>
                <dd className="mt-1 font-medium text-primary-900">
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-primary-500">Phone</dt>
                <dd className="mt-1 font-medium text-primary-900">
                  {user.phone || "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-primary-500">Member Since</dt>
                <dd className="mt-1 font-medium text-primary-900">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
