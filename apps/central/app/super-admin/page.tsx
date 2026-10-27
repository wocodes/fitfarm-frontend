'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '../lib/config';

export default function SuperAdminPage() {
  const [stats, setStats] = useState({
    total_tenants: 0,
    active_tenants: 0,
    trialing_tenants: 0,
    suspended_tenants: 0,
    total_licenses: 0,
  });
  const [tenants, setTenants] = useState<any[]>([]);
  const [platformSettings, setPlatformSettings] = useState<any>(null);
  const [landingJson, setLandingJson] = useState('');
  const [platformSaving, setPlatformSaving] = useState(false);
  const [platformMessage, setPlatformMessage] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');

  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [planTier, setPlanTier] = useState('pro');
  const [maxMembers, setMaxMembers] = useState(500);

  useEffect(() => {
    const token = localStorage.getItem('fitcloud_token') || localStorage.getItem('polanfit_token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

    fetch(`${API_URL}/super-admin/dashboard`, { headers })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setStats(json.data);
      })
      .catch(() => {});

    fetch(`${API_URL}/super-admin/tenants?per_page=100`, { headers })
      .then((res) => res.json())
      .then((json) => {
        const rows = json?.data?.data;
        if (Array.isArray(rows)) {
          setTenants(rows.map((tenant: any) => ({
            ...tenant,
            owner_email: tenant.users?.[0]?.email || 'No owner',
          })));
        }
      })
      .catch(() => {});

    fetch(`${API_URL}/super-admin/platform-content`, { headers })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setPlatformSettings(json.data);
          setLandingJson(JSON.stringify(json.data.landing || {}, null, 2));
        }
      })
      .catch(() => {});
  }, []);

  const handleSavePlatformContent = async () => {
    const token = localStorage.getItem('fitcloud_token') || localStorage.getItem('polanfit_token');
    if (!token || !platformSettings) {
      setPlatformMessage('Your super-admin session has expired. Sign in again.');
      return;
    }

    let landing: any;
    try {
      landing = JSON.parse(landingJson);
    } catch {
      setPlatformMessage('Landing JSON is invalid. Fix the syntax before saving.');
      return;
    }

    setPlatformSaving(true);
    setPlatformMessage('');

    try {
      const res = await fetch(`${API_URL}/super-admin/platform-content`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trial_days: Number(platformSettings.trial_days || 90),
          default_currency: platformSettings.default_currency || 'NGN',
          usd_rate: Number(platformSettings.usd_rate || 1600),
          landing,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setPlatformMessage(json.message || 'Could not save landing content.');
        return;
      }

      setPlatformSettings(json.data);
      setLandingJson(JSON.stringify(json.data.landing || {}, null, 2));
      setPlatformMessage('Landing page settings saved.');
    } catch (err: any) {
      setPlatformMessage(err.message || 'Could not save landing content.');
    } finally {
      setPlatformSaving(false);
    }
  };

  const handleResetPlatform = async () => {
    if (resetConfirmation !== 'RESET ALL GYMS') {
      setResetError('Type RESET ALL GYMS exactly to continue.');
      return;
    }

    const token = localStorage.getItem('fitcloud_token') || localStorage.getItem('polanfit_token');
    if (!token) {
      setResetError('Your super-admin session has expired. Sign in again.');
      return;
    }

    setResetting(true);
    setResetError('');

    try {
      const res = await fetch(`${API_URL}/super-admin/system/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation: resetConfirmation }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setResetError(json.message || 'Reset failed.');
        return;
      }

      setTenants([]);
      setStats({
        total_tenants: 0,
        active_tenants: 0,
        trialing_tenants: 0,
        suspended_tenants: 0,
        total_licenses: 0,
      });
      setGeneratedKey(null);
      setResetOpen(false);
      setResetConfirmation('');
      alert('All gym tenants and related data have been reset.');
    } catch (err: any) {
      setResetError(err.message || 'Reset failed.');
    } finally {
      setResetting(false);
    }
  };

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
            <h1 className="text-2xl font-extrabold text-white">FitFarmHQ Super Admin Center</h1>
            <p className="text-xs text-gray-400">Platform administration • fitfarmhq.com/super-admin</p>
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
                        {t.slug}.fitfarmhq.com
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

        {/* Editable public landing content */}
        <div className="p-6 rounded-2xl bg-[#18181b] border border-gray-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Landing Page & Platform Settings</h2>
              <p className="text-xs text-gray-400 mt-1">
                Edit hero copy, statistics, pricing plans, currency prices, FAQs, trial length, and the USD rate.
                The JSON editor supports any additional content keys you want to keep with the landing payload.
              </p>
            </div>
            <button
              onClick={handleSavePlatformContent}
              disabled={platformSaving}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-extrabold disabled:opacity-40"
            >
              {platformSaving ? 'Saving...' : 'Save Landing Settings'}
            </button>
          </div>

          {platformMessage && (
            <div className="p-3 rounded-xl bg-gray-900 border border-gray-700 text-xs text-gray-300">
              {platformMessage}
            </div>
          )}

          {platformSettings && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Trial days</span>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={platformSettings.trial_days ?? 90}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, trial_days: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0f0f11] border border-gray-700 text-white text-sm"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Default currency</span>
                  <select
                    value={platformSettings.default_currency || 'NGN'}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, default_currency: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0f0f11] border border-gray-700 text-white text-sm"
                  >
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">NGN per USD</span>
                  <input
                    type="number"
                    min={0.0001}
                    step="0.01"
                    value={platformSettings.usd_rate ?? 1600}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, usd_rate: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0f0f11] border border-gray-700 text-white text-sm"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Landing content JSON</span>
                <textarea
                  value={landingJson}
                  onChange={(e) => setLandingJson(e.target.value)}
                  rows={18}
                  spellCheck={false}
                  className="w-full px-4 py-3 rounded-xl bg-[#0f0f11] border border-gray-700 text-emerald-300 text-xs font-mono leading-relaxed"
                />
              </label>
            </>
          )}
        </div>

        {/* Destructive platform reset */}
        <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-red-400">Danger Zone: Reset Platform</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl">
              Permanently delete every gym, owner/staff account, member, subscription, transaction, check-in,
              campaign, CMS entry, backup, and tenant-owned file. Platform super admins are preserved.
            </p>
          </div>
          <button
            onClick={() => { setResetOpen(true); setResetConfirmation(''); setResetError(''); }}
            className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition"
          >
            Reset All Gyms
          </button>
        </div>
      </main>

      {resetOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#18181b] border border-red-500/40 p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-xl font-black text-white">This cannot be undone</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  This permanently removes all gym tenants and every piece of tenant-owned data.
                  Platform super-admin accounts remain active.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-[11px] text-red-300">
              Type <strong>RESET ALL GYMS</strong> below to confirm.
            </div>

            <input
              value={resetConfirmation}
              onChange={(e) => setResetConfirmation(e.target.value)}
              placeholder="RESET ALL GYMS"
              className="w-full px-4 py-3 rounded-xl bg-[#0f0f11] border border-red-500/30 text-white text-sm outline-none focus:border-red-400"
            />

            {resetError && <p className="text-xs text-red-400">{resetError}</p>}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setResetOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPlatform}
                disabled={resetting || resetConfirmation !== 'RESET ALL GYMS'}
                className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold disabled:opacity-40"
              >
                {resetting ? 'Resetting...' : 'Permanently Reset Platform'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
