'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function IntegratedTenantDashboardSetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOperatingModelModal, setShowOperatingModelModal] = useState(false);

  // Form State
  const [licenseKey, setLicenseKey] = useState('');
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const qName = searchParams.get('adminName');
      const qEmail = searchParams.get('adminEmail');
      const qKey = searchParams.get('key');
      if (qName) setAdminName(qName);
      if (qEmail) setAdminEmail(qEmail);
      if (qKey) setLicenseKey(qKey);

      const pendingKey = localStorage.getItem('fitcloud_pending_license_key');
      if (!qKey && pendingKey) {
        setLicenseKey(pendingKey);
      }

      const pending = localStorage.getItem('fitcloud_pending_admin');
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          if (parsed.fullName) setAdminName(parsed.fullName);
          if (parsed.email) setAdminEmail(parsed.email);
          if (parsed.password) setAdminPassword(parsed.password);
          if (!qKey && !pendingKey && parsed.licenseKey) setLicenseKey(parsed.licenseKey);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, []);

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

  // Complete Setup & Provision Tenant
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
      setStep(5);
    } catch (err: any) {
      setError('Failed to provision gym tenant. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const gymSlug = gymName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const sidebarTabs = [
    { id: 1, label: 'License Verification', icon: '🔑', desc: 'Installation Key' },
    { id: 2, label: 'Facility Profile', icon: '🏢', desc: 'Subdomain & Location' },
    { id: 3, label: 'Theme & Branding', icon: '🎨', desc: 'Colors & Styling' },
    { id: 4, label: 'Owner Credentials', icon: '👤', desc: 'Admin Security' },
    { id: 5, label: 'Launch Console', icon: '🚀', desc: 'Tenant Provisioning' },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-sans selection:bg-orange-500 selection:text-black">
      {/* 1. Top Integrated Dashboard Header */}
      <header className="h-16 border-b border-gray-800/80 bg-[#0c0c10] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-extrabold text-black text-lg shadow-md shadow-orange-500/20">
            FC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white">FitCloud Central Dashboard</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                SYSTEM ONLINE
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Tenant Configuration & System Provisioning Console</p>
          </div>
        </div>

        {/* Right Admin Badge & Operating Model Preview Trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowOperatingModelModal(true)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold hover:bg-orange-500/20 transition"
          >
            <span>💳 Operating Model (Deferred)</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-gray-300 font-semibold">{adminName || 'Admin Owner'}</span>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-800 hover:border-gray-700 bg-gray-900 text-gray-300 hover:text-white transition"
          >
            Exit Console
          </Link>
        </div>
      </header>

      {/* 2. Main Layout (Sidebar + Form Workspace + Live Preview Panel) */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-8 gap-6">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 flex-shrink-0 bg-[#0f0f13] border border-gray-800 rounded-3xl p-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="pb-4 mb-4 border-b border-gray-800">
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Config Sections</span>
              <p className="text-xs text-gray-400 font-medium mt-0.5">30-Day Trial Setup</p>
            </div>

            <nav className="space-y-1.5">
              {sidebarTabs.map((tab) => {
                const isActive = step === tab.id;
                const isPassed = step > tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setStep(tab.id)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/40 text-white font-bold'
                        : isPassed
                        ? 'bg-gray-900/40 hover:bg-gray-900 text-gray-300 border border-transparent'
                        : 'text-gray-500 hover:text-gray-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{tab.icon}</span>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{tab.label}</p>
                        <p className="text-[10px] text-gray-400 font-normal">{tab.desc}</p>
                      </div>
                    </div>
                    {isPassed && <span className="text-xs text-emerald-400 font-bold">✓</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* System Status Pill Footer */}
          <div className="pt-4 mt-6 border-t border-gray-800 text-[11px] font-mono text-gray-400 space-y-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
              🎁 30-Day Trial Active. Billing model selection triggers near trial conclusion.
            </div>
          </div>
        </aside>

        {/* MIDDLE WORKSPACE (Form Container) */}
        <main className="flex-1 bg-[#0f0f13] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Top Workspace Header */}
            <div className="pb-6 mb-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-orange-400 font-bold uppercase tracking-wider">
                  Step {step} of 5
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                  {step === 1 && 'Installation License Verification'}
                  {step === 2 && 'Facility Profile & Custom Subdomain'}
                  {step === 3 && 'Theme Engine & Custom Branding'}
                  {step === 4 && 'Configure Owner Credentials'}
                  {step === 5 && 'System Provisioned Successfully! 🎉'}
                </h2>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* STEP 1: License Verification */}
            {step === 1 && (
              <form onSubmit={handleVerifyLicense} className="space-y-6">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Enter your installation license key to authorize system provisioning. Demo license key is pre-filled.
                </p>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Installation License Key
                  </label>
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="e.g. FC-DEMO-2026-KEYS"
                    className="w-full px-4 py-3.5 bg-[#070709] border border-gray-800 rounded-2xl text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-orange-500 transition"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Demo key <code className="text-orange-400 font-mono">FC-DEMO-2026-KEYS</code> is active.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-extrabold text-black rounded-2xl shadow-lg shadow-orange-500/20 transition disabled:opacity-50"
                >
                  {loading ? 'Verifying License Key...' : 'Verify License & Proceed →'}
                </button>
              </form>
            )}

            {/* STEP 2: Gym Facility Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Gym Facility Name
                    </label>
                    <input
                      type="text"
                      value={gymName}
                      onChange={(e) => setGymName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#070709] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-orange-500 transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-4 py-3 bg-[#070709] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-orange-500 transition text-xs"
                      >
                        <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                        <option value="UTC">UTC (Universal)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-4 py-3 bg-[#070709] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-orange-500 transition text-xs"
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
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 bg-gray-900 hover:bg-gray-800 font-semibold text-white rounded-2xl transition border border-gray-800"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-2/3 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-extrabold text-black rounded-2xl transition shadow-lg shadow-orange-500/20"
                  >
                    Configure Theme →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Theme Customization */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Primary Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-12 rounded-2xl bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full px-4 py-3 bg-[#070709] border border-gray-800 rounded-2xl text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Secondary Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-12 rounded-2xl bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-full px-4 py-3 bg-[#070709] border border-gray-800 rounded-2xl text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 py-3 bg-gray-900 hover:bg-gray-800 font-semibold text-white rounded-2xl transition border border-gray-800"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="w-2/3 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-extrabold text-black rounded-2xl transition shadow-lg shadow-orange-500/20"
                  >
                    Admin Credentials →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Admin Credentials */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#070709] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-orange-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#070709] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-orange-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#070709] border border-gray-800 rounded-2xl text-white focus:outline-none focus:border-orange-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-1/3 py-3 bg-gray-900 hover:bg-gray-800 font-semibold text-white rounded-2xl transition border border-gray-800"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteSetup}
                    disabled={loading}
                    className="w-2/3 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-extrabold text-black rounded-2xl transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
                  >
                    {loading ? 'Provisioning Tenant System...' : '🚀 Provision & Launch System!'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Complete & Launch Summary */}
            {step === 5 && resultData && (
              <div className="space-y-6 py-2">
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-4">
                  <span className="text-3xl">🎉</span>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">System Provisioned Successfully!</h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {resultData.tenant.name} is now live on <code className="text-emerald-400 font-mono">FitCloud.io</code> with a 30-Day Unlimited Trial!
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[#070709] border border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">Gym Manager Admin Console</p>
                      <p className="text-xs text-orange-400 font-mono">{resultData.urls.admin_app}</p>
                    </div>
                    <a
                      href={resultData.urls.admin_app}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs rounded-xl transition"
                    >
                      Open Admin Console →
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#070709] border border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">Public Member Portal</p>
                      <p className="text-xs text-orange-400 font-mono">{resultData.urls.member_app}</p>
                    </div>
                    <a
                      href={resultData.urls.member_app}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 font-bold text-white text-xs rounded-xl transition"
                    >
                      Open Member Portal →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT LIVE PREVIEW PANEL */}
        <aside className="w-full md:w-80 flex-shrink-0 bg-[#0f0f13] border border-gray-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Portal Preview</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* Simulated Gym Web App Card */}
            <div className="rounded-2xl bg-[#070709] border border-gray-800 p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: primaryColor }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-black text-xs shadow-md"
                  >
                    {gymName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-white leading-tight">{gymName || 'Gym Name'}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{currency} • {timezone}</p>
                  </div>
                </div>
              </div>

              {/* Subdomain Pill */}
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[10px] font-mono text-orange-400">
                🌐 http://localhost:3001?tenant=<span className="font-bold underline">{gymSlug || 'yourgym'}</span>
              </div>

              {/* Simulated Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-2 px-3 rounded-xl font-extrabold text-black text-xs shadow-md"
                >
                  Member Sign In
                </button>
                <button
                  type="button"
                  style={{ backgroundColor: accentColor }}
                  className="w-full py-2 px-3 rounded-xl font-bold text-white text-xs border border-gray-700"
                >
                  View Membership Plans
                </button>
              </div>
            </div>

            {/* Active Features List */}
            <div className="mt-5 space-y-2 text-[11px] text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Active System Stack</span>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/60">
                <span>🎁 30-Day Trial</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/60">
                <span>🖐️ Biometric Hardware</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/60">
                <span>🔒 Database Schema</span>
                <span className="text-emerald-400 font-bold">ISOLATED</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-800 text-[10px] text-gray-500 text-center">
            FitCloud SaaS Engine v2.0
          </div>
        </aside>
      </div>

      {/* Operating Model Preview Modal (Triggered when trial conclusions are near) */}
      {showOperatingModelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#121217] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white space-y-6">
            <button
              onClick={() => setShowOperatingModelModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-800/60 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition"
            >
              ✕
            </button>

            <div>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Post-Trial Billing Configuration</span>
              <h2 className="text-2xl font-black text-white mt-1">Choose Operating Model</h2>
              <p className="text-xs text-gray-400 mt-1">
                This selection is automatically triggered towards the end of your 30-day trial period.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => { setPricingPath('free_tier'); setShowOperatingModelModal(false); }}
                className={`p-6 rounded-2xl border cursor-pointer transition ${
                  pricingPath === 'free_tier'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-800 bg-[#070709] hover:border-gray-700'
                }`}
              >
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Option 1</span>
                <h3 className="text-lg font-bold text-white mt-1">Free Setup (1% Split)</h3>
                <p className="text-xs text-gray-400 mt-1">
                  $0 upfront cost. 1% transaction split on Paystack member payments.
                </p>
              </div>

              <div
                onClick={() => { setPricingPath('annual_subscription'); setShowOperatingModelModal(false); }}
                className={`p-6 rounded-2xl border cursor-pointer transition ${
                  pricingPath === 'annual_subscription'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-800 bg-[#070709] hover:border-gray-700'
                }`}
              >
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Option 2</span>
                <h3 className="text-lg font-bold text-white mt-1">Annual Subscription</h3>
                <p className="text-xs text-gray-400 mt-1">
                  $299/year flat license key. 0% split fee on transactions.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowOperatingModelModal(false)}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 font-bold text-white text-xs rounded-xl border border-gray-800 transition"
            >
              Close Operating Model Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
