'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Make sure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (roleEmail: string) => {
    setError('');
    setIsSubmitting(true);
    try {
      await login(roleEmail, 'password123');
    } catch (err: any) {
      setError(`Quick login failed for ${roleEmail}. Has the database been seeded?`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden px-4">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4 shadow-lg shadow-blue-500/5">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            NexusCore <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">ERP</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 text-center">
            Next-gen Enterprise Resource Planning Console
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-blue-800 disabled:to-indigo-800 text-sm font-semibold py-2.5 rounded-lg text-white transition-all duration-200 shadow-lg shadow-blue-600/15"
          >
            {isSubmitting ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Demo Roles (Quick Login)
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('admin@erp.com')}
              className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 hover:border-slate-700/60 text-slate-300 py-1.5 px-2 rounded-lg transition-colors text-left"
            >
              🔑 Admin
            </button>
            <button
              onClick={() => handleQuickLogin('manager@erp.com')}
              className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 hover:border-slate-700/60 text-slate-300 py-1.5 px-2 rounded-lg transition-colors text-left"
            >
              💼 Manager
            </button>
            <button
              onClick={() => handleQuickLogin('inventory@erp.com')}
              className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 hover:border-slate-700/60 text-slate-300 py-1.5 px-2 rounded-lg transition-colors text-left"
            >
              📦 Inventory
            </button>
            <button
              onClick={() => handleQuickLogin('sales@erp.com')}
              className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 hover:border-slate-700/60 text-slate-300 py-1.5 px-2 rounded-lg transition-colors text-left"
            >
              📈 Sales
            </button>
            <button
              onClick={() => handleQuickLogin('hr@erp.com')}
              className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 hover:border-slate-700/60 text-slate-300 py-1.5 px-2 rounded-lg transition-colors text-left"
            >
              👥 HR Staff
            </button>
            <button
              onClick={() => handleQuickLogin('finance@erp.com')}
              className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 hover:border-slate-700/60 text-slate-300 py-1.5 px-2 rounded-lg transition-colors text-left"
            >
              💰 Finance
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
