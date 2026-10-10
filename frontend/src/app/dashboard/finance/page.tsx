'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { CircleDollarSign, Plus, ArrowUpRight, ArrowDownRight, Scale, Landmark } from 'lucide-react';

export default function FinancePage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    transactionCount: 0,
    categoryBreakdown: {} as { [key: string]: number },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [showTxModal, setShowTxModal] = useState(false);
  const [newTx, setNewTx] = useState({
    type: 'EXPENSE', amount: '', category: 'Purchases', description: '', reference: '', date: ''
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const txData = await api.get('/finance/transactions');
      setTransactions(txData.transactions || []);

      const sumData = await api.get('/finance/summary');
      setSummary(sumData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch financial transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/finance/transactions', newTx);
      setSuccess('Transaction recorded in general ledger!');
      setNewTx({ type: 'EXPENSE', amount: '', category: 'Purchases', description: '', reference: '', date: '' });
      setShowTxModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to record transaction');
    }
  };

  const isFinanceStaff = user && ['ADMIN', 'MANAGER', 'FINANCE_STAFF'].includes(user.role);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-blue-500" />
            General Ledger & Accounts
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Audit general ledger journal entries, record operating costs, and inspect cash flows.
          </p>
        </div>
        {isFinanceStaff && (
          <button
            onClick={() => setShowTxModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
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

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Total Revenue */}
            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Accumulated Income</p>
                <h3 className="text-xl md:text-2xl font-bold text-emerald-400 mt-1">${summary.totalIncome.toLocaleString()}</h3>
                <span className="text-[10px] text-slate-500 font-medium">Earned from Sales</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            {/* Total Expenditures */}
            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Accumulated Expenses</p>
                <h3 className="text-xl md:text-2xl font-bold text-red-400 mt-1">${summary.totalExpense.toLocaleString()}</h3>
                <span className="text-[10px] text-slate-500 font-medium">Payroll + Operational costs</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>

            {/* Net Balance */}
            <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Net Profit Margins</p>
                <h3 className={`text-xl md:text-2xl font-bold mt-1 ${summary.netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  ${summary.netProfit.toLocaleString()}
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">Operational balance sheet</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Scale className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ledger Transactions Table */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden lg:col-span-2">
              <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
                <h3 className="font-bold text-sm text-slate-200">General Ledger Journal Entries</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-950/40 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Category / Desc</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/20">
                        <td className="py-3 px-4 text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-semibold text-slate-300">{tx.reference || 'GL-MANUAL'}</td>
                        <td className="py-3 px-4 text-slate-400">
                          <div className="font-semibold text-slate-200">{tx.category}</div>
                          <span className="text-[10px] text-slate-500 block max-w-xs truncate">{tx.description}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            tx.type === 'INCOME'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'}${tx.amount}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-500">No journal transactions recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Breakdown list */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
              <h3 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-blue-400" />
                Ledger Category Balance
              </h3>
              <div className="space-y-4">
                {Object.entries(summary.categoryBreakdown).map(([category, balance]) => (
                  <div key={category} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">{category}</span>
                    <span className={`font-semibold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {balance >= 0 ? '+' : '-'}${Math.abs(balance).toLocaleString()}
                    </span>
                  </div>
                ))}
                {Object.keys(summary.categoryBreakdown).length === 0 && (
                  <p className="text-slate-500 text-xs text-center py-4">No categories balances.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-blue-400" /> Record Ledger Entry
            </h3>
            <form onSubmit={handleTxSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Transaction Type</label>
                <select
                  value={newTx.type}
                  onChange={(e) => setNewTx({ ...newTx, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="EXPENSE">Expense (Debit)</option>
                  <option value="INCOME">Income (Credit)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Amount ($)</label>
                <input
                  type="number" step="0.01" required
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Category</label>
                <select
                  value={newTx.category}
                  onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="Purchases">Purchases (Inventory)</option>
                  <option value="Salaries">Salaries (Payroll)</option>
                  <option value="Rent">Rent (Leases)</option>
                  <option value="Utilities">Utilities & Bills</option>
                  <option value="Sales">Sales (Operating Revenue)</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Reference Code</label>
                <input
                  type="text" placeholder="e.g. Check#, Invoice#"
                  value={newTx.reference}
                  onChange={(e) => setNewTx({ ...newTx, reference: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/10"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
