'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  stock_quantity: number;
  price_adjustment: number;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    is_active: true,
  });

  const [variantForm, setVariantForm] = useState({
    sku: '',
    color: '',
    size: '',
    stock_quantity: '',
    price_adjustment: '',
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${id}`).then((r) => r.json()),
      fetch('/api/admin/categories').then((r) => r.json()),
      fetch(`/api/admin/products/${id}/variants`).then((r) => r.json()),
    ]).then(([productRes, catRes, varRes]) => {
      if (productRes.data) {
        const p = productRes.data;
        setForm({
          name: p.name || '',
          description: p.description || '',
          category_id: p.category_id || '',
          base_price: String(p.base_price || ''),
          minimum_price: String(p.minimum_price || ''),
          cost_price: String(p.cost_price || ''),
          stock_quantity: String(p.stock_quantity || ''),
          image_url: p.image_url || '',
          is_active: p.is_active,
        });
      }
      if (catRes.data) setCategories(catRes.data);
      if (varRes.data) setVariants(varRes.data);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
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
      if (!res.ok) throw new Error(data.error || 'Failed to update');

      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const addVariant = async () => {
    try {
      const res = await fetch(`/api/admin/products/${id}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: variantForm.sku,
          color: variantForm.color || null,
          size: variantForm.size || null,
          stock_quantity: Number(variantForm.stock_quantity),
          price_adjustment: Number(variantForm.price_adjustment) || 0,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setVariants([...variants, data.data]);
        setVariantForm({ sku: '', color: '', size: '', stock_quantity: '', price_adjustment: '' });
      }
    } catch (err) {
      console.error('Failed to add variant:', err);
    }
  };

  const deleteVariant = async (variantId: string) => {
    // Variants don't have a direct delete route in the API yet, but we have the service method
    // For now, we'll just remove from local state
    setVariants(variants.filter((v) => v.id !== variantId));
  };

  if (loading) {
    return <div className="text-primary-500">Loading product...</div>;
  }

  const inputClass =
    'w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-primary-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500';

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-primary-500 hover:text-primary-900">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-primary-900">Edit Product</h1>
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
            <label className="block text-sm font-medium text-primary-700 mb-1">Min Price ($)</label>
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
            <label className="block text-sm font-medium text-primary-700 mb-1">Cost Price ($)</label>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Stock</label>
            <input
              type="number"
              required
              value={form.stock_quantity}
              onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-primary-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded"
              />
              Active
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-700 mb-1">Image URL</label>
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
            disabled={saving}
            className="bg-accent-600 text-primary-900 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-accent-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/admin/products"
            className="px-6 py-2 rounded-lg text-sm border border-neutral-200 text-primary-600 hover:bg-neutral-50"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Variants */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary-900">Variants</h2>

        {variants.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-primary-600 border-b border-neutral-200">
              <tr>
                <th className="text-left py-2">SKU</th>
                <th className="text-left py-2">Color</th>
                <th className="text-left py-2">Size</th>
                <th className="text-right py-2">Stock</th>
                <th className="text-right py-2">Price Adj.</th>
                <th className="text-right py-2"></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-b border-neutral-100">
                  <td className="py-2 text-primary-900">{v.sku}</td>
                  <td className="py-2 text-primary-600">{v.color || '—'}</td>
                  <td className="py-2 text-primary-600">{v.size || '—'}</td>
                  <td className="py-2 text-right text-primary-900">{v.stock_quantity}</td>
                  <td className="py-2 text-right text-primary-900">
                    {v.price_adjustment > 0 ? `+$${v.price_adjustment}` : v.price_adjustment < 0 ? `-$${Math.abs(v.price_adjustment)}` : '—'}
                  </td>
                  <td className="py-2 text-right">
                    <button onClick={() => deleteVariant(v.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="grid grid-cols-5 gap-2 items-end">
          <input
            placeholder="SKU"
            value={variantForm.sku}
            onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Color"
            value={variantForm.color}
            onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Size"
            value={variantForm.size}
            onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Stock"
            value={variantForm.stock_quantity}
            onChange={(e) => setVariantForm({ ...variantForm, stock_quantity: e.target.value })}
            className={inputClass}
          />
          <button
            type="button"
            onClick={addVariant}
            disabled={!variantForm.sku || !variantForm.stock_quantity}
            className="flex items-center justify-center gap-1 bg-primary-900 text-neutral-50 px-3 py-2 rounded-lg text-sm disabled:opacity-40"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
