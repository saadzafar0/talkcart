'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    base_price: '',
    minimum_price: '',
    cost_price: '',
    stock_quantity: '',
    image_url: '',
  });

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.data) setCategories(data.data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          base_price: Number(form.base_price),
          minimum_price: Number(form.minimum_price),
          cost_price: Number(form.cost_price),
          stock_quantity: Number(form.stock_quantity),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-primary-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500';

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-primary-500 hover:text-primary-900">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-primary-900">New Product</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">Description</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">Category</label>
          <select
            required
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className={inputClass}
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Base Price ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.base_price}
              onChange={(e) => setForm({ ...form, base_price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Min Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={form.minimum_price}
              onChange={(e) => setForm({ ...form, minimum_price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Cost Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={form.cost_price}
              onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">Stock Quantity</label>
          <input
            type="number"
            required
            value={form.stock_quantity}
            onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">
            Image URL (optional)
          </label>
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-accent-600 text-primary-900 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-accent-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <Link
            href="/admin/products"
            className="px-6 py-2 rounded-lg text-sm border border-neutral-200 text-primary-600 hover:bg-neutral-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
