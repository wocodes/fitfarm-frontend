'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch, getTenantSlug, handleLogout } from '../lib/apiClient';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [tenantName, setTenantName] = useState('My Gym');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const slug = getTenantSlug();
    if (slug) {
      setTenantName(slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '));
    }

    apiFetch('/admin/settings')
      .then((res) => {
        if (res.success && res.data?.tenant) {
          setTenantName(res.data.tenant.name || 'My Gym');
          setLogoUrl(res.data.tenant.logo_url || '');
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-20 px-8 border-b border-gray-800/80 bg-[#0a0a0c]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Active Gym Tenant Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-400 font-bold max-w-[260px]">
          {logoUrl ? (
            <img src={logoUrl} alt={`${tenantName} logo`} className="w-6 h-6 rounded-md object-contain bg-black/20" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shrink-0" />
          )}
          <span className="truncate">{tenantName}</span>
        </div>

        {/* Quick Kiosk Link Button */}
        <a
          href="/check-in"
          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs transition shadow-lg shadow-orange-500/20"
        >
          🚪 Open Entrance Kiosk
        </a>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 transition-all cursor-pointer flex items-center gap-1.5"
          title="Sign Out of Admin Portal"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
