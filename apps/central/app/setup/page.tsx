'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SetupWizardPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [licenseKey, setLicenseKey] = useState('FC-DEMO-2026-KEYS');
  const [licenseInfo, setLicenseInfo] = useState<any>(null);

  const [pricingPath, setPricingPath] = useState<'free_tier' | 'annual_subscription'>('free_tier');
  const [gymName, setGymName] = useState('PolanFit Fitness');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [currency, setCurrency] = useState('NGN');

  const [primaryColor, setPrimaryColor] = useState('#fa6a2e');
  const [accentColor, setAccentColor] = useState('#1e293b');

  const [adminName, setAdminName] = useState('Gabriel O.');
  const [adminEmail, setAdminEmail] = useState('admin@polanfit.com');
  const [adminPassword, setAdminPassword] = useState('Password123!');

  const [resultData, setResultData] = useState<any>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  // Step 1: Verify License Key
  const handleVerifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/setup/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseKey }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Invalid license key.');
        setLoading(false);
        return;
      }

      setLicenseInfo(data.data);
      setStep(2);
    } catch (err: any) {
      setError('Failed to connect to backend API server at ' + apiBase);
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Complete Setup
  const handleCompleteSetup = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/setup/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: licenseKey,
          gym_name: gymName,
          admin_name: adminName,
          admin_email: adminEmail,
          admin_password: adminPassword,
          timezone,
          currency,
          pricing_path: pricingPath,
          primary_color: primaryColor,
          accent_color: accentColor,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to complete setup.');
        setLoading(false);
        return;
      }

      setResultData(data.data);
      setStep(6);
    } catch (err: any) {
      setError('Failed to provision gym tenant. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const gymSlug = gymName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col justify-between p-4 md:p-8 font-sans">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-xl text-black shadow-lg shadow-orange-500/20">
            FC
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">FitCloud SaaS</h1>
            <span className="text-xs text-gray-400">Gym Management Platform Setup Wizard</span>
          </div>
        </div>
        <Link href="/" className="text-xs text-gray-400 hover:text-white transition">
          Exit Setup
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="max-w-3xl w-full mx-auto my-8 bg-[#18181b] border border-gray-800 rounded-2xl p-6 md:p-10 shadow-2xl">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800 text-xs font-semibold text-gray-400">
          <span className={step >= 1 ? 'text-orange-500' : ''}>1. License</span>
          <span className={step >= 2 ? 'text-orange-500' : ''}>2. Plan</span>
          <span className={step >= 3 ? 'text-orange-500' : ''}>3. Gym Info</span>
          <span className={step >= 4 ? 'text-orange-500' : ''}>4. Theme</span>
          <span className={step >= 5 ? 'text-orange-500' : ''}>5. Admin</span>
          <span className={step >= 6 ? 'text-orange-500' : ''}>6. Launch</span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: License Key Verification */}
        {step === 1 && (
          <form onSubmit={handleVerifyLicense} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to FitCloud! 🚀</h2>
              <p className="text-sm text-gray-400">
                To begin setting up your gym management tenant system, please enter your installation license key.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                Installation License Key
              </label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="e.g. FC-DEMO-2026-KEYS"
                className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-orange-500 transition"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Tip: Demo license key <code className="text-orange-400">FC-DEMO-2026-KEYS</code> is pre-filled for immediate testing.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-orange-500 hover:bg-orange-600 font-bold text-black rounded-xl shadow-lg shadow-orange-500/20 transition disabled:opacity-50"
            >
              {loading ? 'Verifying License...' : 'Verify License & Begin Setup →'}
            </button>
          </form>
        )}

        {/* STEP 2: Choose Pricing Path */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Select Your Pricing Model</h2>
              <p className="text-sm text-gray-400">
                How would you like to operate your FitCloud gym platform?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setPricingPath('free_tier')}
                className={`p-6 rounded-2xl border cursor-pointer transition ${
                  pricingPath === 'free_tier'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-800 bg-[#0f0f11] hover:border-gray-700'
                }`}
              >
                <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Option 1</div>
                <h3 className="text-xl font-bold text-white mb-1">Free Setup (1% Fee)</h3>
                <p className="text-xs text-gray-400 mb-4">
                  $0 upfront or monthly cost. We automatically split 1% on every member transaction via Paystack.
                </p>
                <span className="inline-block text-xs bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full font-semibold">
                  Most Popular
                </span>
              </div>

              <div
                onClick={() => setPricingPath('annual_subscription')}
                className={`p-6 rounded-2xl border cursor-pointer transition ${
                  pricingPath === 'annual_subscription'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-800 bg-[#0f0f11] hover:border-gray-700'
                }`}
              >
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Option 2</div>
                <h3 className="text-xl font-bold text-white mb-1">Annual Subscription</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Pay annually with 0% transaction fee. Keep 100% of all customer payments. Includes 14-day free trial.
                </p>
                <span className="inline-block text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-semibold">
                  0% Commission
                </span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 bg-gray-800 hover:bg-gray-700 font-semibold text-white rounded-xl transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-3 bg-orange-500 hover:bg-orange-600 font-bold text-black rounded-xl transition"
              >
                Continue to Gym Details →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Gym Information & Subdomain Preview */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Gym Details & Subdomain</h2>
              <p className="text-sm text-gray-400">
                Define your facility name and default free subdomains.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">
                  Gym Facility Name
                </label>
                <input
                  type="text"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition"
                  required
                />
              </div>

              {/* Subdomain Preview */}
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-2 text-xs">
                <div className="text-gray-400 font-medium">Your Free Provisioned Subdomains:</div>
                <div className="text-orange-400 font-mono">
                  🌐 Member Portal: <span className="underline">https://{gymSlug}.fitcloud.io</span>
                </div>
                <div className="text-orange-400 font-mono">
                  🔐 Admin Center: <span className="underline">https://admin.{gymSlug}.fitcloud.io</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    <option value="UTC">UTC (Universal)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 bg-gray-800 hover:bg-gray-700 font-semibold text-white rounded-xl transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-2/3 py-3 bg-orange-500 hover:bg-orange-600 font-bold text-black rounded-xl transition"
              >
                Customize Theme →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Theme Customization */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Theme & Branding</h2>
              <p className="text-sm text-gray-400">
                Customize your portal colors to match your brand identity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  Primary Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                  Secondary Container Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Live Theme Preview */}
            <div className="p-4 rounded-xl border border-gray-800 bg-[#0f0f11] space-y-3">
              <span className="text-xs text-gray-500 font-semibold uppercase">Live Portal Button Preview</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  style={{ backgroundColor: primaryColor }}
                  className="px-5 py-2.5 rounded-xl font-bold text-black text-sm shadow-md"
                >
                  Member Sign In
                </button>
                <button
                  type="button"
                  style={{ backgroundColor: accentColor }}
                  className="px-5 py-2.5 rounded-xl font-bold text-white text-sm"
                >
                  View Plans
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-1/3 py-3 bg-gray-800 hover:bg-gray-700 font-semibold text-white rounded-xl transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-2/3 py-3 bg-orange-500 hover:bg-orange-600 font-bold text-black rounded-xl transition"
              >
                Create Admin Account →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Create Gym Admin User */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Gym Admin User</h2>
              <p className="text-sm text-gray-400">
                This account will be used to log into your Gym Admin Center at <span className="text-orange-400">admin.{gymSlug}.fitcloud.io</span>.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-1/3 py-3 bg-gray-800 hover:bg-gray-700 font-semibold text-white rounded-xl transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleCompleteSetup}
                disabled={loading}
                className="w-2/3 py-3 bg-orange-500 hover:bg-orange-600 font-bold text-black rounded-xl transition disabled:opacity-50"
              >
                {loading ? 'Provisioning Gym System...' : '🚀 Complete Setup & Launch!'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Complete & Launch */}
        {step === 6 && resultData && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 flex items-center justify-center text-3xl mx-auto">
              ✓
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-white mb-2">Congratulations! 🎉</h2>
              <p className="text-sm text-gray-400">
                <span className="text-white font-semibold">{resultData.tenant.name}</span> has been provisioned on FitCloud.io!
              </p>
            </div>

            {/* Launch Links */}
            <div className="p-6 bg-[#0f0f11] border border-gray-800 rounded-2xl text-left space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Your Provisioned Web Apps
              </div>

              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">Gym Admin Center</div>
                  <div className="text-xs text-orange-400 font-mono">{resultData.urls.admin_app}</div>
                </div>
                <a
                  href={resultData.urls.admin_app}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 font-bold text-black text-xs rounded-lg transition"
                >
                  Open Admin Center →
                </a>
              </div>

              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">Member App Portal</div>
                  <div className="text-xs text-orange-400 font-mono">{resultData.urls.member_app}</div>
                </div>
                <a
                  href={resultData.urls.member_app}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 font-bold text-white text-xs rounded-lg transition"
                >
                  Open Member Portal →
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-gray-600 py-4 border-t border-gray-900">
        FitCloud.io SaaS Platform © 2026. All rights reserved.
      </footer>
    </div>
  );
}
