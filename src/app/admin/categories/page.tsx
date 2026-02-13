'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories');
    const data = await res.json();
    if (data.data) setCategories(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: description || undefined }),
    });
    setName('');
    setDescription('');
    setShowForm(false);
    fetchCategories();
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"?`)) return;
    await fetch(`/api/admin/categories`, {
      method: 'POST', // Would need a dedicated route, using inline for now
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _delete: id }),
    });
    fetchCategories();
  };

  const inputClass =
    'w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-primary-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-900">Categories</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-accent-600 text-primary-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-700 transition-colors"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-neutral-200 p-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Category name..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              placeholder="Short description..."
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex items-center gap-2 bg-primary-900 text-neutral-50 px-4 py-2 rounded-lg text-sm disabled:opacity-40"
          >
            <Check size={14} /> Create
          </button>
        </div>
      )}

      {/* Category list */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-primary-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-primary-500">No categories yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-primary-600 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-primary-900">{cat.name}</td>
                  <td className="px-4 py-3 text-primary-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-primary-600">{cat.description || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 text-primary-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
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
