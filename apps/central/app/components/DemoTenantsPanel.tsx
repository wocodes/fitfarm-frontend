'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { API_URL } from '../lib/config';

interface DemoTenant {
  uuid: string;
  name: string;
  slug: string;
  status: string;
  demo_status: string;
  demo_expires_at: string | null;
  demo_purge_after: string | null;
  demo_notes?: string | null;
  owner_name?: string | null;
  owner_email?: string | null;
  days_remaining?: number | null;
  purge_in_days?: number | null;
  member_portal_url: string;
  created_at: string;
}

interface CreatedAccess {
  name: string;
  accessUrl: string;
  memberUrl: string;
}

const initialForm = {
  gym_name: '',
  owner_name: '',
  owner_email: '',
  owner_phone: '',
  duration_days: 30,
  notes: '',
};

export default function DemoTenantsPanel() {
  const [demos, setDemos] = useState<DemoTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);
  const [busyUuid, setBusyUuid] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [createdAccess, setCreatedAccess] = useState<CreatedAccess | null>(null);
  const [accessLink, setAccessLink] = useState<{ demo: DemoTenant; url: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DemoTenant | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [copied, setCopied] = useState(false);

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('fitcloud_token') || localStorage.getItem('polanfit_token')
    : null;

  const request = useCallback(async (path: string, options: RequestInit = {}) => {
    if (!token) throw new Error('Your super-admin session has expired. Sign in again.');

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'The demo request failed.');
    }

    return json;
  }, [token]);

  const loadDemos = useCallback(async () => {
    setLoading(true);
    try {
      const json = await request('/super-admin/demos');
      setDemos(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Could not load demos.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadDemos();
  }, [loadDemos]);

  const flash = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 4500);
  };

  const copy = async (value: string, text = 'Access link copied.') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      flash(text);
    } catch {
      setError('Could not copy automatically. Select and copy the link manually.');
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    setMessage('');

    try {
      const json = await request('/super-admin/demos', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      setCreatedAccess({
        name: json.data.name,
        accessUrl: json.data.access_url,
        memberUrl: json.data.member_portal_url,
      });
      setForm(initialForm);
      setFormOpen(false);
      await loadDemos();
      flash('Demo gym created. Send the access link to the prospect.');
    } catch (err: any) {
      setError(err.message || 'Could not create the demo.');
    } finally {
      setCreating(false);
    }
  };

  const handleExtend = async (demo: DemoTenant) => {
    setBusyUuid(demo.uuid);
    setError('');
    try {
      await request(`/super-admin/demos/${demo.uuid}/extend`, {
        method: 'POST',
        body: JSON.stringify({ days: 30 }),
      });
      await loadDemos();
      flash(`${demo.name} extended by 30 days.`);
    } catch (err: any) {
      setError(err.message || 'Could not extend the demo.');
    } finally {
      setBusyUuid(null);
    }
  };

  const handleAccessLink = async (demo: DemoTenant) => {
    setBusyUuid(demo.uuid);
    setError('');
    try {
      const json = await request(`/super-admin/demos/${demo.uuid}/access-link`, {
        method: 'POST',
      });
      setAccessLink({ demo, url: json.data.access_url });
    } catch (err: any) {
      setError(err.message || 'Could not generate an access link.');
    } finally {
      setBusyUuid(null);
    }
  };

  const handleConvert = async (demo: DemoTenant) => {
    if (!window.confirm(`Convert ${demo.name} to a live gym? The demo timer will stop and sample data will be kept.`)) {
      return;
    }

    setBusyUuid(demo.uuid);
    setError('');
    try {
      await request(`/super-admin/demos/${demo.uuid}/convert`, { method: 'POST' });
      await loadDemos();
      flash(`${demo.name} is now a live gym.`);
    } catch (err: any) {
      setError(err.message || 'Could not convert the demo.');
    } finally {
      setBusyUuid(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmation !== deleteTarget.slug) {
      setError('Type the gym subdomain exactly to confirm deletion.');
      return;
    }

    setBusyUuid(deleteTarget.uuid);
    setError('');
    try {
      const json = await request(`/super-admin/demos/${deleteTarget.uuid}`, {
        method: 'DELETE',
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });
      setDeleteTarget(null);
      setDeleteConfirmation('');
      await loadDemos();
      flash(`Demo deleted. Members removed: ${json.data?.members ?? 0}.`);
    } catch (err: any) {
      setError(err.message || 'Could not delete the demo.');
    } finally {
      setBusyUuid(null);
    }
  };

  return (
    <section className="p-5 sm:p-6 rounded-2xl bg-[#18181b] border border-orange-500/25 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🧪</span>
            <h2 className="text-lg font-bold text-white">Demo Gyms</h2>
            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-300">
              30-day sandbox
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400 max-w-2xl">
            Create an isolated demo with sample members, plans, check-ins, and sandbox payment testing.
            Demos auto-expire after 30 days and are permanently deleted after the 7-day grace period unless converted first.
          </p>
        </div>
        <button
          onClick={() => { setFormOpen((open) => !open); setError(''); }}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-extrabold"
        >
          {formOpen ? 'Close form' : '+ Create demo gym'}
        </button>
      </div>

      {message && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">{message}</div>}
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-400">{error}</div>}

      {createdAccess && (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-300">Demo ready: {createdAccess.name}</p>
              <p className="mt-1 text-[11px] text-gray-400">Send this one-time access link to the prospect.</p>
            </div>
            <button onClick={() => setCreatedAccess(null)} className="text-gray-500 hover:text-white">✕</button>
          </div>
          <div className="break-all rounded-xl border border-gray-700 bg-[#0a0a0c] p-3 font-mono text-[11px] text-orange-300">
            {createdAccess.accessUrl}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => copy(createdAccess.accessUrl)} className="rounded-lg bg-orange-500 px-3 py-2 text-[11px] font-bold text-black">
              Copy admin link
            </button>
            <a href={createdAccess.accessUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-[11px] font-bold text-gray-200">
              Open admin demo
            </a>
            <a href={createdAccess.memberUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-[11px] font-bold text-gray-200">
              Open member site
            </a>
          </div>
        </div>
      )}

      {formOpen && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Gym name</span>
              <input required value={form.gym_name} onChange={(e) => setForm({ ...form, gym_name: e.target.value })} placeholder="Peak Performance Gym" className="w-full rounded-xl border border-gray-700 bg-[#0f0f11] px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Owner name</span>
              <input required value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} placeholder="John Doe" className="w-full rounded-xl border border-gray-700 bg-[#0f0f11] px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Owner email</span>
              <input type="email" required value={form.owner_email} onChange={(e) => setForm({ ...form, owner_email: e.target.value })} placeholder="owner@peakperformance.com" className="w-full rounded-xl border border-gray-700 bg-[#0f0f11] px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Owner phone</span>
              <input value={form.owner_phone} onChange={(e) => setForm({ ...form, owner_phone: e.target.value })} placeholder="08011223322" className="w-full rounded-xl border border-gray-700 bg-[#0f0f11] px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Demo length (days)</span>
              <input type="number" min={1} max={365} value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) || 30 })} className="w-full rounded-xl border border-gray-700 bg-[#0f0f11] px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Internal notes</span>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Prospect asked for a preview" className="w-full rounded-xl border border-gray-700 bg-[#0f0f11] px-3 py-2.5 text-sm text-white" />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-gray-500">Sample data uses fake names and <code>@example.invalid</code> emails. Payments are sandbox-only.</p>
            <button disabled={creating} className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-black disabled:opacity-40">
              {creating ? 'Creating demo…' : 'Create demo gym'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="py-6 text-center text-xs text-gray-500">Loading demo gyms…</p>
        ) : demos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-700 p-8 text-center">
            <p className="text-sm font-bold text-white">No active demos</p>
            <p className="mt-1 text-xs text-gray-500">Create one when a prospect wants to preview the platform.</p>
          </div>
        ) : (
          demos.map((demo) => (
            <div key={demo.uuid} className="rounded-2xl border border-gray-800 bg-[#0f0f11] p-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">{demo.name}</h3>
                    <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-300">
                      {demo.demo_status === 'expired' ? 'Expired' : 'Demo'}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">{demo.slug}.fitfarmhq.com</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {demo.owner_name || 'No owner'} · {demo.owner_email || 'No email'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                    <span>Expires: {demo.demo_expires_at ? new Date(demo.demo_expires_at).toLocaleDateString() : '—'}</span>
                    <span>Purge: {demo.demo_purge_after ? new Date(demo.demo_purge_after).toLocaleDateString() : '—'}</span>
                    <span>{demo.days_remaining ?? 0} days active</span>
                    <span>{demo.purge_in_days ?? 0} days until deletion</span>
                  </div>
                  {demo.demo_notes && <p className="mt-2 text-[11px] text-gray-500">{demo.demo_notes}</p>}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <a href={demo.member_portal_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-[11px] font-bold text-gray-200">
                    Member site
                  </a>
                  <button disabled={busyUuid === demo.uuid} onClick={() => handleAccessLink(demo)} className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-[11px] font-bold text-orange-300 disabled:opacity-40">
                    Access link
                  </button>
                  <button disabled={busyUuid === demo.uuid} onClick={() => handleExtend(demo)} className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-[11px] font-bold text-gray-200 disabled:opacity-40">
                    +30 days
                  </button>
                  <button disabled={busyUuid === demo.uuid} onClick={() => handleConvert(demo)} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[11px] font-bold text-emerald-300 disabled:opacity-40">
                    Convert to live
                  </button>
                  <button disabled={busyUuid === demo.uuid} onClick={() => { setDeleteTarget(demo); setDeleteConfirmation(''); setError(''); }} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-300 disabled:opacity-40">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {accessLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-orange-500/30 bg-[#18181b] p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-white">{accessLink.demo.name} access link</h3>
                <p className="mt-1 text-xs text-gray-400">This logs the prospect into their demo admin console.</p>
              </div>
              <button onClick={() => setAccessLink(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="break-all rounded-xl border border-gray-700 bg-[#0a0a0c] p-3 font-mono text-xs text-orange-300">{accessLink.url}</div>
            <div className="flex flex-wrap justify-end gap-2">
              <button onClick={() => copy(accessLink.url)} className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-black">
                {copied ? 'Copied ✓' : 'Copy link'}
              </button>
              <a href={accessLink.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-2 text-xs font-bold text-gray-200">
                Open admin
              </a>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-red-500/40 bg-[#18181b] p-6 space-y-4">
            <div>
              <h3 className="text-lg font-black text-white">Delete {deleteTarget.name}?</h3>
              <p className="mt-1 text-xs text-gray-400">
                This permanently removes the demo tenant, members, plans, check-ins, transactions, admin account, and uploaded files.
              </p>
            </div>
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-[11px] text-red-300">
              Type <strong>{deleteTarget.slug}</strong> to confirm.
            </div>
            <input value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} placeholder={deleteTarget.slug} className="w-full rounded-xl border border-red-500/30 bg-[#0f0f11] px-4 py-3 text-sm text-white outline-none focus:border-red-400" />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setDeleteTarget(null); setDeleteConfirmation(''); }} className="rounded-xl bg-gray-800 px-4 py-2.5 text-xs font-bold text-gray-300">Cancel</button>
              <button onClick={handleDelete} disabled={busyUuid === deleteTarget.uuid || deleteConfirmation !== deleteTarget.slug} className="rounded-xl bg-red-500 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">
                {busyUuid === deleteTarget.uuid ? 'Deleting…' : 'Delete demo permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
