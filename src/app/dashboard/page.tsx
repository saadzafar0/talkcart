"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  ShoppingBag,
  Package,
  Search,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/core/components/layout/Navbar";
import { Footer } from "@/core/components/layout/Footer";
import { ChatWidget } from "@/features/chat/components/ChatWidget";
import { LoadingSpinner } from "@/core/components/common/LoadingSpinner";

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.full_name?.split(" ")[0] || "there";

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1">
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
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              <Link
                href="/products"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent-600 px-6 py-3 font-semibold text-primary-900 transition-colors hover:bg-accent-500"
              >
                <MessageCircle className="h-5 w-5" />
                Start Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
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
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
