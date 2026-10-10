'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { TrendingUp, Plus, ShoppingCart, Users, Receipt, CreditCard } from 'lucide-react';

export default function SalesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'invoices' | 'customers'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 }
  ]);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const ordData = await api.get('/sales/orders');
      setOrders(ordData.orders || []);

      const invData = await api.get('/sales/invoices');
      setInvoices(invData.invoices || []);

      const custData = await api.get('/sales/customers');
      setCustomers(custData.customers || []);

      const prodData = await api.get('/inventory/products');
      setProducts(prodData.products || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales database records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddOrderItem = () => {
    setSelectedItems([...selectedItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveOrderItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updated = [...selectedItems];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedItems(updated);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Validate items
      const itemsPayload = selectedItems.filter(item => item.productId !== '');
      if (itemsPayload.length === 0) {
        throw new Error('Please select at least one product');
      }

      await api.post('/sales/orders', {
        customerId: selectedCustomerId,
        items: itemsPayload.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity as any)
        }))
      });

      setSuccess('Sales order placed successfully! Invoice generated.');
      setShowOrderModal(false);
      setSelectedCustomerId('');
      setSelectedItems([{ productId: '', quantity: 1 }]);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create sales order');
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/sales/customers', newCustomer);
      setSuccess('Customer account registered!');
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
      setShowCustomerModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to register customer');
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    setError('');
    setSuccess('');
    try {
      await api.post(`/sales/invoices/${invoiceId}/pay`);
      setSuccess('Invoice paid! Transaction logged in Accounting.');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    }
  };

  const isSalesStaff = user && ['ADMIN', 'MANAGER', 'SALES_STAFF'].includes(user.role);
  const isFinanceStaff = user && ['ADMIN', 'MANAGER', 'FINANCE_STAFF'].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Sales & Ledger Invoices
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Log client orders, issue invoices, and trace operational revenue flows.
          </p>
        </div>
        {isSalesStaff && (
          <div className="flex gap-2">
            {activeTab === 'orders' && (
              <button
                onClick={() => setShowOrderModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" /> Create Sales Order
              </button>
            )}
            {activeTab === 'customers' && (
              <button
                onClick={() => setShowCustomerModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-colors"
              >
                <Plus className="w-4 h-4" /> Register Customer
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

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'orders' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🛍️ Sales Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'invoices' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🧾 Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'customers' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          👥 Customers ({customers.length})
        </button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Items Summary</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-bold text-slate-200">{o.orderNumber}</td>
                      <td className="py-3 px-4 text-slate-400">{o.customer?.name}</td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate text-slate-300">
                          {o.items.map((i: any) => `${i.product.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">${o.totalAmount}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          o.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : o.status === 'CONFIRMED'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">No orders logged. Click 'Create Sales Order' to start.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: INVOICES */}
          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Issued</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    {isFinanceStaff && <th className="py-3.5 px-4 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-bold text-slate-200 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{inv.order?.customer?.name}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200">${inv.amount}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      {isFinanceStaff && (
                        <td className="py-3 px-4 text-right">
                          {inv.status !== 'PAID' && (
                            <button
                              onClick={() => handlePayInvoice(inv.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 ml-auto shadow-lg shadow-emerald-500/5 transition-colors"
                            >
                              <CreditCard className="w-3 h-3" /> Record Payment
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">No invoices issued. Invoices generate when sales orders are placed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Client Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-bold text-slate-200">{c.name}</td>
                      <td className="py-3 px-4 text-slate-400">{c.email || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-400">{c.phone || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-400">{c.address || 'N/A'}</td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500">No customers registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
              Configure Sales Order
            </h3>
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Customer Account</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase">Products Purchased</label>
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select
                      required
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Choose Item</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                          {p.name} (SKU: {p.sku}) — ${p.price} [In Stock: {p.quantity}]
                        </option>
                      ))}
                    </select>

                    <input
                      type="number" min="1" required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />

                    {selectedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOrderItem(index)}
                        className="text-red-500 hover:text-red-400 text-xs px-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOrderItem}
                  className="text-blue-400 hover:text-blue-300 text-xs font-semibold"
                >
                  + Add Another Product
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/10"
                >
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Register Customer Account
            </h3>
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Company / Customer Name</label>
                <input
                  type="text" required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Phone</label>
                <input
                  type="text"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Address</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/10"
                >
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
