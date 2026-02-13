'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  stock_quantity: number;
  is_active: boolean;
  image_url: string | null;
  categories: { name: string } | null;
  created_at: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (p: number, q: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: '20' });
    if (q) params.set('search', q);

    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    if (data.data) {
      setProducts(data.data.products);
      setTotal(data.data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts(page, search);
  }, [page, search]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    fetchProducts(page, search);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-accent-600 text-primary-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-700 transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg bg-white text-primary-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-primary-500">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-primary-500">No products found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-primary-600 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-right px-4 py-3 font-medium">Price</th>
                <th className="text-right px-4 py-3 font-medium">Stock</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-neutral-200 flex items-center justify-center text-xs text-primary-500">
                          N/A
                        </div>
                      )}
                      <span className="font-medium text-primary-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-primary-600">
                    {product.categories?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-primary-900">
                    ${product.base_price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-primary-900">
                    {product.stock_quantity}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-1.5 text-primary-500 hover:text-accent-700 transition-colors"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1.5 text-primary-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-primary-500">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-neutral-200 rounded disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-neutral-200 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
