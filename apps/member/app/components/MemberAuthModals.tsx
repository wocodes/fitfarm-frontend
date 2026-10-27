'use client';

import React, { useState } from 'react';
import { memberApiFetch, setMemberToken, setStoredMember } from '../lib/api';

interface MemberAuthModalsProps {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  onCloseLogin: () => void;
  onCloseRegister: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
  onLoginSuccess: (user: any) => void;
  tenantSlug?: string;
}

export default function MemberAuthModals({
  isLoginOpen,
  isRegisterOpen,
  onCloseLogin,
  onCloseRegister,
  onSwitchToRegister,
  onSwitchToLogin,
  onLoginSuccess,
  tenantSlug = 'polanfit-fitness',
}: MemberAuthModalsProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await memberApiFetch('/member/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      if (res.success && res.data?.token) {
        setMemberToken(res.data.token);
        if (res.data.member) {
          setStoredMember(res.data.member);
          onLoginSuccess(res.data.member);
        }
        onCloseLogin();
      } else {
        setLoginError(res.message || 'Invalid email address or password.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Unable to sign in. Please verify your email and password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');

    try {
      const res = await memberApiFetch('/member/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          tenant_slug: tenantSlug,
          first_name: regFirstName.trim(),
          last_name: regLastName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          password: regPassword,
        }),
      });

      if (res.success && res.data?.token) {
        setMemberToken(res.data.token);
        if (res.data.member) {
          setStoredMember(res.data.member);
          onLoginSuccess(res.data.member);
        }
        onCloseRegister();
      } else {
        setRegError(res.message || 'Could not register account.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setRegLoading(false);
    }
  };

  if (!isLoginOpen && !isRegisterOpen) return null;

  return (
    <>
      {/* Sign In Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white">
            <button
              onClick={onCloseLogin}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition text-xs"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Gym Portal</span>
              <h3 className="text-2xl font-extrabold text-white mt-1">Member Sign In</h3>
              <p className="text-xs text-gray-400 mt-1">
                Access your digital QR entrance pass, workout logs, and renew plans.
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="member@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs focus:border-orange-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs focus:border-orange-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {loginLoading ? 'Signing in...' : 'Sign In to Portal'}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-gray-400">Don't have a gym pass yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    onCloseLogin();
                    onSwitchToRegister();
                  }}
                  className="text-xs font-bold text-orange-400 hover:underline"
                >
                  Register Here
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Self-Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white">
            <button
              onClick={onCloseRegister}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition text-xs"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Join the Gym</span>
              <h3 className="text-2xl font-extrabold text-white mt-1">Create Member Account</h3>
              <p className="text-xs text-gray-400 mt-1">
                Register instantly to generate your access gate barcode and select a plan.
              </p>
            </div>

            {regError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs focus:border-orange-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs focus:border-orange-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jane.doe@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs focus:border-orange-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 800 000 0000"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs focus:border-orange-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs focus:border-orange-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full mt-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {regLoading ? 'Registering...' : 'Complete Registration & Get Pass'}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-gray-400">Already a registered member? </span>
                <button
                  type="button"
                  onClick={() => {
                    onCloseRegister();
                    onSwitchToLogin();
                  }}
                  className="text-xs font-bold text-orange-400 hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
