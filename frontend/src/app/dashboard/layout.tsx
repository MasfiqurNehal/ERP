'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Boxes,
  TrendingUp,
  Users,
  CircleDollarSign,
  LogOut,
  User as UserIcon,
  Menu,
  X,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'INVENTORY_STAFF', 'SALES_STAFF', 'HR_STAFF', 'FINANCE_STAFF'] },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Boxes, roles: ['ADMIN', 'MANAGER', 'INVENTORY_STAFF', 'SALES_STAFF'] },
  { name: 'Sales & Invoices', href: '/dashboard/sales', icon: TrendingUp, roles: ['ADMIN', 'MANAGER', 'SALES_STAFF', 'FINANCE_STAFF'] },
  { name: 'HR & Payroll', href: '/dashboard/hr', icon: Users, roles: ['ADMIN', 'MANAGER', 'HR_STAFF', 'FINANCE_STAFF'] },
  { name: 'Finance', href: '/dashboard/finance', icon: CircleDollarSign, roles: ['ADMIN', 'MANAGER', 'FINANCE_STAFF'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm mt-4 font-medium">Authorizing security credentials...</p>
      </div>
    );
  }

  if (!user) return null;

  const allowedItems = sidebarItems.filter(item => item.roles.includes(user.role));

  const rolePillColors: { [key: string]: string } = {
    ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
    MANAGER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    INVENTORY_STAFF: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    SALES_STAFF: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    HR_STAFF: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    FINANCE_STAFF: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              A
            </span>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              NexusCore ERP
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {allowedItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-300">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-slate-200">{user.name}</p>
              <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 ${rolePillColors[user.role]}`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800/40 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/30 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/40 border-b border-slate-800/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-200 focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg text-slate-100">
              {pathname === '/dashboard'
                ? 'Overview & Insights'
                : sidebarItems.find((i) => i.href === pathname)?.name || 'ERP Suite'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <div className="h-4 w-px bg-slate-800 hidden sm:inline-block"></div>
            <span className={`text-xs font-bold border px-2 py-0.5 rounded-full sm:inline-block ${rolePillColors[user.role]}`}>
              {user.role}
            </span>
          </div>
        </header>

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer Body */}
          <div className="relative w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                NexusCore ERP
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {allowedItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-300">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-slate-200">{user?.name}</p>
                  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 ${rolePillColors[user?.role || '']}`}>
                    {user?.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-800/40 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/30 py-2 rounded-lg text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
