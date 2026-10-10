'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Boxes, Plus, PackagePlus, Users, Tag, AlertCircle } from 'lucide-react';

export default function InventoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'suppliers'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', description: '', price: '', cost: '', quantity: '', minStockLevel: '', categoryId: '', supplierId: ''
  });

  const [showCatModal, setShowCatModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '' });

  const [showSupModal, setShowSupModal] = useState(false);
  const [newSup, setNewSup] = useState({ name: '', email: '', phone: '', address: '' });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const prodData = await api.get('/inventory/products');
      setProducts(prodData.products || []);

      const catData = await api.get('/inventory/categories');
      setCategories(catData.categories || []);

      const supData = await api.get('/inventory/suppliers');
      setSuppliers(supData.suppliers || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/inventory/products', newProduct);
      setSuccess('Product added successfully!');
      setNewProduct({
        name: '', sku: '', description: '', price: '', cost: '', quantity: '', minStockLevel: '', categoryId: '', supplierId: ''
      });
      setShowProductModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to add product');
    }
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/inventory/categories', newCat);
      setSuccess('Category created successfully!');
      setNewCat({ name: '', description: '' });
      setShowCatModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleSupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/inventory/suppliers', newSup);
      setSuccess('Supplier registered successfully!');
      setNewSup({ name: '', email: '', phone: '', address: '' });
      setShowSupModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to add supplier');
    }
  };

  const isEditor = user && ['ADMIN', 'MANAGER', 'INVENTORY_STAFF'].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-500" />
            Inventory Hub
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Configure catalogs, adjust product quantities, and manage supply channels.
          </p>
        </div>
        {isEditor && (
          <div className="flex gap-2">
            {activeTab === 'products' && (
              <button
                onClick={() => setShowProductModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-colors"
              >
                <PackagePlus className="w-4 h-4" /> Add Product
              </button>
            )}
            {activeTab === 'categories' && (
              <button
                onClick={() => setShowCatModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-colors"
              >
                <Tag className="w-4 h-4" /> Create Category
              </button>
            )}
            {activeTab === 'suppliers' && (
              <button
                onClick={() => setShowSupModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-colors"
              >
                <Users className="w-4 h-4" /> Add Supplier
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg p-3">
          {success}
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'products' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📦 Catalog Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'categories' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🏷️ Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'suppliers' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🤝 Suppliers ({suppliers.length})
        </button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden">
          {/* TAB 1: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">SKU / Item</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Cost</th>
                    <th className="py-3.5 px-4">In Stock</th>
                    <th className="py-3.5 px-4">Supplier</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {products.map((p) => {
                    const isLow = p.quantity <= p.minStockLevel;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/20">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{p.name}</div>
                          <span className="text-[10px] text-slate-500">{p.sku}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{p.category?.name}</td>
                        <td className="py-3 px-4 font-semibold text-slate-200">${p.price}</td>
                        <td className="py-3 px-4 text-slate-400">${p.cost}</td>
                        <td className={`py-3 px-4 font-semibold ${isLow ? 'text-amber-400' : 'text-slate-200'}`}>
                          {p.quantity} <span className="text-[10px] text-slate-500 font-normal">/ min {p.minStockLevel}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{p.supplier?.name || 'None'}</td>
                        <td className="py-3 px-4 text-right">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-2.5 h-2.5" /> Reorder Alert
                            </span>
                          ) : (
                            <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              Healthy
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">No products found. Click 'Add Product' to get started.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-right">Product Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-bold text-slate-200">{c.name}</td>
                      <td className="py-3 px-4 text-slate-400">{c.description || 'No description'}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-200">
                        {c._count?.products || 0} items
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-slate-500">No categories created.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: SUPPLIERS */}
          {activeTab === 'suppliers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-bold text-slate-200">{s.name}</td>
                      <td className="py-3 px-4 text-slate-400">{s.email || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-400">{s.phone || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-400">{s.address || 'N/A'}</td>
                    </tr>
                  ))}
                  {suppliers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500">No suppliers registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-blue-400" />
              Add Product to Catalog
            </h3>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Product Name</label>
                  <input
                    type="text" required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">SKU Code</label>
                  <input
                    type="text" required
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Sales Price ($)</label>
                  <input
                    type="number" step="0.01" required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Production/Supplier Cost ($)</label>
                  <input
                    type="number" step="0.01" required
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Initial Quantity</label>
                  <input
                    type="number" required
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Min. Stock Alert Threshold</label>
                  <input
                    type="number" required
                    value={newProduct.minStockLevel}
                    onChange={(e) => setNewProduct({ ...newProduct, minStockLevel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Category</label>
                  <select
                    required
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Supplier</label>
                  <select
                    value={newProduct.supplierId}
                    onChange={(e) => setNewProduct({ ...newProduct, supplierId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Supplier (Optional)</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/10"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-400" /> Create Category
            </h3>
            <form onSubmit={handleCatSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Category Name</label>
                <input
                  type="text" required
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 h-16 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/10"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Add Supplier
            </h3>
            <form onSubmit={handleSupSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Supplier Name</label>
                <input
                  type="text" required
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={newSup.email}
                  onChange={(e) => setNewSup({ ...newSup, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Phone</label>
                <input
                  type="text"
                  value={newSup.phone}
                  onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Address</label>
                <input
                  type="text"
                  value={newSup.address}
                  onChange={(e) => setNewSup({ ...newSup, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSupModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/10"
                >
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
