'use client';

import { useEffect, useState } from 'react';
import { Plus, X, Check, Trash2 } from 'lucide-react';

interface Discount {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  usage_count: number;
  usage_limit: number | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    usage_limit: '',
    expires_at: '',
  });

  const fetchDiscounts = async () => {
    const res = await fetch('/api/admin/discounts');
    const data = await res.json();
    if (data.data) setDiscounts(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreate = async () => {
    if (!form.code || !form.discount_value) return;

    await fetch('/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        usage_limit: form.usage_limit ? Number(form.usage_limit) : undefined,
        expires_at: form.expires_at || undefined,
      }),
    });
    setForm({ code: '', discount_type: 'percentage', discount_value: '', usage_limit: '', expires_at: '' });
    setShowForm(false);
    fetchDiscounts();
  };

  const handleDeactivate = async (id: string) => {
    await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' });
    fetchDiscounts();
  };

  const inputClass =
    'w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-primary-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-900">Discount Codes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-accent-600 text-primary-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-700 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add Discount'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-neutral-200 p-5 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className={inputClass}
                placeholder="e.g. SAVE20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Type</label>
              <select
                value={form.discount_type}
                onChange={(e) =>
                  setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })
                }
                className={inputClass}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Value</label>
              <input
                type="number"
                step="0.01"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                className={inputClass}
                placeholder={form.discount_type === 'percentage' ? '20' : '10.00'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                value={form.usage_limit}
                onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                className={inputClass}
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Expires</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!form.code || !form.discount_value}
            className="flex items-center gap-2 bg-primary-900 text-neutral-50 px-4 py-2 rounded-lg text-sm disabled:opacity-40"
          >
            <Check size={14} /> Create Discount
          </button>
        </div>
      )}

      {/* Discount list */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-primary-500">Loading...</div>
        ) : discounts.length === 0 ? (
          <div className="p-8 text-center text-primary-500">No discount codes yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-primary-600 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Discount</th>
                <th className="text-center px-4 py-3 font-medium">Usage</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Expires</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono font-bold text-primary-900">{d.code}</td>
                  <td className="px-4 py-3 text-primary-700">
                    {d.discount_type === 'percentage' ? `${d.discount_value}%` : `$${d.discount_value}`}
                  </td>
                  <td className="px-4 py-3 text-center text-primary-600">
                    {d.usage_count}{d.usage_limit ? `/${d.usage_limit}` : ''}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        d.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {d.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-primary-500 text-xs">
                    {d.expires_at ? new Date(d.expires_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.is_active && (
                      <button
                        onClick={() => handleDeactivate(d.id)}
                        className="p-1.5 text-primary-500 hover:text-red-700"
                        title="Deactivate"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
