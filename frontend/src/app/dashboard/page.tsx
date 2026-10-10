'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  TrendingUp,
  TrendingDown,
  Boxes,
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    income: 0,
    expense: 0,
    profit: 0,
    productCount: 0,
    lowStockCount: 0,
    employeeCount: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardStats() {
      setLoading(true);
      try {
        let income = 0;
        let expense = 0;
        let profit = 0;
        let productCount = 0;
        let lowStockCount = 0;
        let employeeCount = 0;

        // 1. Fetch Finance Summary (Admin, Manager, Finance)
        if (user && ['ADMIN', 'MANAGER', 'FINANCE_STAFF'].includes(user.role)) {
          try {
            const finSummary = await api.get('/finance/summary');
            income = finSummary.totalIncome;
            expense = finSummary.totalExpense;
            profit = finSummary.netProfit;
          } catch (e) {
            console.error('Failed to fetch finance summary', e);
          }
        }

        // 2. Fetch Products for Stock alerts (Admin, Manager, Inventory, Sales)
        if (user && ['ADMIN', 'MANAGER', 'INVENTORY_STAFF', 'SALES_STAFF'].includes(user.role)) {
          try {
            const data = await api.get('/inventory/products');
            const products = data.products || [];
            productCount = products.length;
            const lowStock = products.filter((p: any) => p.quantity <= p.minStockLevel);
            lowStockCount = lowStock.length;
            setLowStockProducts(lowStock.slice(0, 5));
          } catch (e) {
            console.error('Failed to fetch inventory', e);
          }
        }

        // 3. Fetch HR Employees (Admin, Manager, HR)
        if (user && ['ADMIN', 'MANAGER', 'HR_STAFF'].includes(user.role)) {
          try {
            const hrData = await api.get('/hr/employees');
            employeeCount = (hrData.employees || []).length;
          } catch (e) {
            console.error('Failed to fetch employees', e);
          }
        }

        setStats({
          income,
          expense,
          profit,
          productCount,
          lowStockCount,
          employeeCount,
        });
      } catch (err) {
        console.error('Error loading dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, [user]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Chart configs
  const financialData = [
    { name: 'Income', amount: stats.income, fill: '#10b981' },
    { name: 'Expense', amount: stats.expense, fill: '#ef4444' },
    { name: 'Net Profit', amount: stats.profit, fill: '#3b82f6' },
  ];

  const inventoryPieData = [
    { name: 'Healthy Stock', value: Math.max(0, stats.productCount - stats.lowStockCount), color: '#10b981' },
    { name: 'Low Stock', value: stats.lowStockCount, color: '#f59e0b' },
  ];

  const canViewFinance = user && ['ADMIN', 'MANAGER', 'FINANCE_STAFF'].includes(user.role);
  const canViewHR = user && ['ADMIN', 'MANAGER', 'HR_STAFF'].includes(user.role);
  const canViewInventory = user && ['ADMIN', 'MANAGER', 'INVENTORY_STAFF', 'SALES_STAFF'].includes(user.role);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/20 via-indigo-950/20 to-slate-900 border border-blue-500/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            Welcome back, {user?.name}! <ShieldCheck className="w-5 h-5 text-blue-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Here is a consolidated digest of your enterprise metrics for today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/inventory"
            className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl border border-slate-700/60 transition-colors"
          >
            Review Inventory
          </Link>
          <Link
            href="/dashboard/sales"
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-lg shadow-blue-500/15 transition-colors"
          >
            Create Sales Order
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Income */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Revenue</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              {canViewFinance ? `$${stats.income.toLocaleString()}` : 'N/A'}
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">Auto-updated from Sales</span>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Expenses</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              {canViewFinance ? `$${stats.expense.toLocaleString()}` : 'N/A'}
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">Includes payroll & purchases</span>
          </div>
        </div>

        {/* Products Count */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Products</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              {canViewInventory ? stats.productCount : 'N/A'}
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">In catalog</span>
          </div>
        </div>

        {/* Employee Count */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Employees</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              {canViewHR ? stats.employeeCount : 'N/A'}
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">On active roster</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Flow Chart */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 lg:col-span-2 flex flex-col">
          <h3 className="font-bold text-base text-slate-200 mb-4">Financial Flow Summary</h3>
          <div className="flex-1 min-h-[250px]">
            {canViewFinance ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={financialData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                    cursor={{ fill: 'rgba(51, 65, 85, 0.2)' }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {financialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500">
                <AlertTriangle className="w-8 h-8 text-amber-500/80 mb-2" />
                <p className="text-xs font-medium">Financial data restricted for your role ({user?.role})</p>
              </div>
            )}
          </div>
        </div>

        {/* Stock Status Pie Chart */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold text-base text-slate-200 mb-4">Stock Health Distribution</h3>
          <div className="flex-1 min-h-[250px] flex items-center justify-center">
            {canViewInventory ? (
              stats.productCount > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={inventoryPieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {inventoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 text-xs">No products in inventory yet.</p>
              )
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500 w-full">
                <AlertTriangle className="w-8 h-8 text-amber-500/80 mb-2" />
                <p className="text-xs font-medium">Inventory metrics restricted</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3 - Low Stock Alerts */}
      {canViewInventory && (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Critical Stock Alerts
            </h3>
            <Link
              href="/dashboard/inventory"
              className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              Manage Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {lowStockProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/40 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Min stock limit</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {lowStockProducts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-800/20">
                      <td className="py-3 px-4 font-medium text-slate-200">{p.name}</td>
                      <td className="py-3 px-4 text-slate-400">{p.sku}</td>
                      <td className="py-3 px-4 text-amber-400 font-semibold">{p.quantity}</td>
                      <td className="py-3 px-4 text-slate-400">{p.minStockLevel}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {p.quantity === 0 ? 'Out of stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-6 text-center text-slate-400 text-xs">
              🎉 Excellent! No items are currently low on stock.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
