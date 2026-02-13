import Link from "next/link";
import {
  MessageCircle,
  ShoppingBag,
  Sparkles,
  BadgePercent,
  ArrowRight,
  Search,
  ShieldCheck,
} from "lucide-react";

export default function HomePage() {
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
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #423E37 0%, #6E675F 100%)" }}
      >
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-600/30 bg-accent-600/10 px-4 py-1.5 text-sm text-accent-400">
              <Sparkles className="h-4 w-4" />
              AI-Powered Shopping Experience
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-50 sm:text-5xl lg:text-6xl">
              Shop by{" "}
              <span className="text-accent-600">talking</span>, not
              clicking.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-neutral-300">
              Meet your AI personal shopper. Find products, negotiate prices,
              and checkout — all through natural conversation. No buttons
              needed.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-6 py-3 text-base font-semibold text-primary-900 transition-colors hover:bg-accent-500"
              >
                Start Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-500 px-6 py-3 text-base font-semibold text-neutral-50 transition-colors hover:border-neutral-300 hover:text-white"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative accent */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent-600/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent-600/5 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
              Shopping, reimagined
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-600">
              Your AI clerk understands what you want, finds it instantly, and
              even negotiates the best price for you.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-600/10">
                <Search className="h-6 w-6 text-accent-700" />
              </div>
              <h3 className="text-lg font-semibold text-primary-900">
                Semantic Search
              </h3>
              <p className="mt-2 text-primary-600">
                Say &ldquo;I need an outfit for a summer wedding in Italy&rdquo;
                and get light linens and sunglasses — not winter coats.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-600/10">
                <ShoppingBag className="h-6 w-6 text-accent-700" />
              </div>
              <h3 className="text-lg font-semibold text-primary-900">
                Conversational Checkout
              </h3>
              <p className="mt-2 text-primary-600">
                Find and buy products without clicking a single button. Just
                tell the clerk what you want and it handles the rest.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-100 p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-600/10">
                <BadgePercent className="h-6 w-6 text-accent-700" />
              </div>
              <p className="mt-2 text-primary-600">
                Negotiate prices with the AI clerk. Give a good reason and
                you might get a personalized discount code on the spot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-neutral-200 bg-neutral-100 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
              How it works
            </h2>
          </div>

          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-xl font-bold text-primary-900">
                1
              </div>
              <h3 className="text-lg font-semibold text-primary-900">
                Tell the Clerk
              </h3>
              <p className="mt-2 text-primary-600">
                Describe what you&apos;re looking for in plain language. Be as
                specific or vague as you want.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-xl font-bold text-primary-900">
                2
              </div>
              <h3 className="text-lg font-semibold text-primary-900">
                Browse & Negotiate
              </h3>
              <p className="mt-2 text-primary-600">
                The clerk finds matching products, updates the store in
                real-time, and even lets you haggle for a better price.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-xl font-bold text-primary-900">
                3
              </div>
              <h3 className="text-lg font-semibold text-primary-900">
                Checkout via Chat
              </h3>
              <p className="mt-2 text-primary-600">
                Add to cart, apply discounts, and complete your purchase
                entirely through the conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-24"
        style={{ background: "linear-gradient(135deg, #423E37 0%, #6E675F 100%)" }}
      >
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-50 sm:text-4xl">
            Ready to shop smarter?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-300">
            Join TalkChart and experience the future of online shopping with
            your own AI personal assistant.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-8 py-3 text-base font-semibold text-primary-900 transition-colors hover:bg-accent-500"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-primary-900 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-accent-600" />
              <span className="font-semibold text-neutral-50">TalkChart</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-500">
              <ShieldCheck className="h-4 w-4" />
              AI-Powered Personal Shopping
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
