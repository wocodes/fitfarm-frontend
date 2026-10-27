'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '../lib/config';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToSignIn }: RegisterModalProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const apiBase = API_URL;

      let licenseKey = '';
      const res = await fetch(`${apiBase}/central/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email,
          password: password,
          password_confirmation: confirmPassword
        })
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        let errMessage = data.message || 'Registration failed. Please check your inputs.';
        if (data.errors && typeof data.errors === 'object') {
          errMessage = Object.values(data.errors).flat().join(' ');
        }
        setError(errMessage);
        setLoading(false);
        return;
      }

      licenseKey = data.data?.license_key || '';

      if (!licenseKey) {
        setError('Registration succeeded but no trial license was returned. Please contact support.');
        setLoading(false);
        return;
      }

      const token = data.data?.token;

      const expiresAt = data.data?.license_expires_at;
      const trialDays = expiresAt
        ? Math.max(1, Math.round((new Date(expiresAt).getTime() - Date.now()) / 86400000))
        : null;

      // Native browser alert displaying trial key & expiration mode
      alert(
        `🎉 Account Created Successfully!\n\n` +
        `Your Trial License Key is:\n${licenseKey}\n\n` +
        `Mode: TRIAL${trialDays ? ` (Expires in ${trialDays} days)` : ''}\n\n` +
        `Please click OK to proceed to setup and validate your license key.`
      );

      const registrationData = {
        fullName,
        email,
        phone,
        password,
        licenseKey,
        registeredAt: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('fitcloud_pending_admin', JSON.stringify(registrationData));
        localStorage.setItem('fitcloud_pending_license_key', licenseKey);
        if (token) {
          localStorage.setItem('fitcloud_token', token);
          localStorage.setItem('polanfit_token', token);
        }
      }

      const params = new URLSearchParams({
        adminName: fullName,
        adminEmail: email,
        adminPhone: phone,
        key: licenseKey
      });

      router.push(`/setup?${params.toString()}`);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize account.');
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
          <h2 className="text-2xl font-extrabold tracking-tight">Create Your Account</h2>
          <p className="text-xs text-gray-400 mt-1">
            Start managing your gym with FitFarmHQ in under 2 minutes.
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
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-3 bg-[#0a0a0c] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Work Email Address
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
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 812 345 6789"
              className="w-full px-4 py-3 bg-[#0a0a0c] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#0a0a0c] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-bold text-black rounded-xl shadow-lg shadow-orange-500/20 transition transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Continue to Gym Setup →'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-4 border-t border-gray-800 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToSignIn}
            className="text-orange-400 font-semibold hover:underline"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
}
