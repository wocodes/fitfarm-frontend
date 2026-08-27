'use client';

import React, { useState } from 'react';

interface MemberAuthModalsProps {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  onCloseLogin: () => void;
  onCloseRegister: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function MemberAuthModals({
  isLoginOpen,
  isRegisterOpen,
  onCloseLogin,
  onCloseRegister,
  onSwitchToRegister,
  onSwitchToLogin,
  onLoginSuccess,
}: MemberAuthModalsProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
      onCloseLogin();
      onLoginSuccess({
        name: 'Gabriel Omokpoga',
        email: loginEmail,
        uuid: 'FC-M-99214A',
      });
      alert('🎉 Logged in successfully to PolanFit Member Portal!');
    }, 800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setTimeout(() => {
      setRegLoading(false);
      onCloseRegister();
      onLoginSuccess({
        name: `${regFirstName} ${regLastName}`,
        email: regEmail,
        uuid: 'FC-M-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      });
      alert('🎉 Account registered successfully! You can now display your Digital Entrance Pass.');
    }, 800);
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

            <h3 className="text-2xl font-extrabold mb-1">Member Sign In</h3>
            <p className="text-xs text-gray-400 mb-6">Access your digital QR entrance pass and subscription details.</p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="member@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20"
              >
                {loginLoading ? 'Signing In...' : 'Sign In to Member Portal'}
              </button>

              <p className="text-xs text-center text-gray-400 pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onCloseLogin();
                    onSwitchToRegister();
                  }}
                  className="text-orange-400 font-bold underline"
                >
                  Register Now
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white">
            <button
              onClick={onCloseRegister}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition text-xs"
            >
              ✕
            </button>

            <h3 className="text-2xl font-extrabold mb-1">Member Registration</h3>
            <p className="text-xs text-gray-400 mb-6">Create your member account to start working out.</p>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20"
              >
                {regLoading ? 'Registering...' : 'Complete Member Registration'}
              </button>

              <p className="text-xs text-center text-gray-400 pt-2">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onCloseRegister();
                    onSwitchToLogin();
                  }}
                  className="text-orange-400 font-bold underline"
                >
                  Sign In
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
