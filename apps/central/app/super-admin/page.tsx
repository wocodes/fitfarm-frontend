'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SuperAdminPage() {
  const [stats, setStats] = useState({
    total_tenants: 8,
    active_tenants: 6,
    trialing_tenants: 2,
    suspended_tenants: 0,
    total_licenses: 12,
  });

  const [tenants, setTenants] = useState([
    {
      id: 1,
      uuid: 'tenant-001',
      name: 'PolanFit Arena',
      slug: 'polanfit-arena',
      pricing_path: 'free_tier',
      status: 'active',
      created_at: '2026-08-25',
      owner_email: 'admin@polanfit.com',
    },
    {
      id: 2,
      uuid: 'tenant-002',
      name: 'Iron Fitness Center',
      slug: 'iron-fitness',
      pricing_path: 'annual_subscription',
      status: 'trialing',
      created_at: '2026-08-24',
      owner_email: 'owner@ironfitness.com',
    },
  ]);

  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [planTier, setPlanTier] = useState('pro');
  const [maxMembers, setMaxMembers] = useState(500);

  const handleGenerateLicense = () => {
    const key = `FC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setGeneratedKey(key);
  };

  const handleToggleStatus = (uuid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setTenants(tenants.map(t => t.uuid === uuid ? { ...t, status: newStatus } : t));
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col font-sans p-6 md:p-10 space-y-8">
      {/* Super Admin Top Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center font-bold text-red-400 text-lg shadow-lg">
            👑
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">FitCloud Super Admin Center</h1>
            <p className="text-xs text-gray-400">Platform God Mode Console • fitcloud.io/super-admin</p>
          </div>
        </div>

        <Link href="/setup" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 font-bold text-black text-xs rounded-xl transition">
          + Launch Setup Wizard
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto space-y-8">
        {/* Global Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#18181b] border border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Provisioned Gyms</span>
            <div className="text-3xl font-extrabold text-white mt-1">{stats.total_tenants}</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#18181b] border border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Gyms</span>
            <div className="text-3xl font-extrabold text-green-400 mt-1">{stats.active_tenants}</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#18181b] border border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trialing Gyms</span>
            <div className="text-3xl font-extrabold text-orange-400 mt-1">{stats.trialing_tenants}</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#18181b] border border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Generated License Keys</span>
            <div className="text-3xl font-extrabold text-blue-400 mt-1">{stats.total_licenses}</div>
          </div>
        </div>

        {/* License Generator & Gym Management Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: License Key Generator */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-[#18181b] border border-gray-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Generate License Key</span>
              <span className="text-xs font-mono text-orange-400">Generator</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Plan Tier</label>
                <select
                  value={planTier}
                  onChange={(e) => setPlanTier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs"
                >
                  <option value="starter">Starter (100 Members)</option>
                  <option value="pro">Pro (500 Members)</option>
                  <option value="enterprise">Enterprise (Unlimited)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Max Member Cap</label>
                <input
                  type="number"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-xs"
                />
              </div>

              <button
                onClick={handleGenerateLicense}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 font-bold text-black text-xs rounded-xl transition shadow-lg shadow-orange-500/20"
              >
                + Generate License Key
              </button>

              {generatedKey && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-center space-y-1">
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Generated Key</span>
                  <div className="text-base font-mono font-bold text-orange-400 tracking-wider select-all">
                    {generatedKey}
                  </div>
                  <span className="text-[10px] text-gray-500">Copy & send this key to the gym developer</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Gym Tenants Directory */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#18181b] border border-gray-800 space-y-4">
            <h2 className="text-lg font-bold text-white">All Gym Tenants</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                    <th className="py-3 px-4">Gym Name</th>
                    <th className="py-3 px-4">Subdomain</th>
                    <th className="py-3 px-4">Pricing Model</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {tenants.map((t) => (
                    <tr key={t.uuid} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.owner_email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-orange-400">
                        {t.slug}.fitcloud.io
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-300">
                        {t.pricing_path === 'free_tier' ? '🆓 Free (1% Fee)' : '💎 Annual Sub'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          t.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(t.uuid, t.status)}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white rounded-lg transition"
                        >
                          {t.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
