'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function SignInModal({ isOpen, onClose, onSwitchToRegister }: SignInModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
      const terminalToken = typeof window !== 'undefined' ? localStorage.getItem('fitcloud_terminal_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (terminalToken) {
        headers['X-Terminal-Token'] = terminalToken;
      }

      const res = await fetch(`${apiBase}/central/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const { token, user } = json.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('fitcloud_token', token);
          localStorage.setItem('polanfit_token', token);
          if (user?.tenant?.slug) {
            localStorage.setItem('fitcloud_tenant_slug', user.tenant.slug);
          }
        }

        if (user?.tenant || user?.tenant_id) {
          const adminAppUrl = process.env.NEXT_PUBLIC_ADMIN_APP_URL || 'http://localhost:3001';
          const tenantSlug = user?.tenant?.slug || 'polanfit-fitness';
          window.location.href = `${adminAppUrl}#token=${encodeURIComponent(token)}&tenant=${encodeURIComponent(tenantSlug)}`;
        } else if (user?.role === 'super_admin' || user?.role === 'ROLE_SUPER_ADMIN' || email.includes('superadmin')) {
          router.push('/super-admin');
        } else {
          router.push('/setup');
        }
      } else {
        if (json.error_code === 'UNAUTHORIZED_TERMINAL_DEVICE') {
          setError('🛑 Front-Desk Terminal Restricted: Staff can only log in from an authorized gym terminal. Please ask the gym owner to authorize this device.');
        } else {
          setError(json.message || 'Invalid email address or password.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email address or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-800/60 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-500 font-bold text-xl mb-3 shadow-lg shadow-orange-500/10 border border-orange-500/30">
            FC
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Sign In to FitCloud</h2>
          <p className="text-xs text-gray-400 mt-1">
            Access your Central SaaS Portal & Gym Management Console
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yourgym.com"
              className="w-full px-4 py-3 bg-[#0a0a0c] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#0a0a0c] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 bg-orange-500 hover:bg-orange-600 font-bold text-black rounded-xl shadow-lg shadow-orange-500/20 transition transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In →'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-4 border-t border-gray-800 text-center text-xs text-gray-400">
          Don't have a FitCloud account yet?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-orange-400 font-semibold hover:underline"
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}
