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
  const [isDemo, setIsDemo] = useState(false);

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
          setIsDemo(Boolean(res.data.tenant.is_demo));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="min-h-20 px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-800/80 bg-[#0a0a0c]/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 sticky top-0 z-30">
      <div className="min-w-0 w-full sm:flex-1">
        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white truncate">{title}</h1>
        {subtitle && <p className="text-[11px] sm:text-xs text-gray-400 font-medium line-clamp-2">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between sm:justify-end w-full sm:w-auto">
        {/* Active Gym Tenant Badge */}
        <div className="flex items-center gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-400 font-bold max-w-[135px] sm:max-w-[260px]">
          {logoUrl ? (
            <img src={logoUrl} alt={`${tenantName} logo`} className="w-6 h-6 rounded-md object-contain bg-black/20" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shrink-0" />
          )}
          <span className="truncate">{tenantName}</span>
          {isDemo && (
            <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/15 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-300">
              Demo
            </span>
          )}
        </div>

        {/* Quick Kiosk Link Button */}
        <a
          href="/check-in"
          className="px-3 sm:px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black font-extrabold text-xs transition shadow-lg shadow-orange-500/20"
        >
          🚪 <span className="hidden sm:inline">Open Entrance Kiosk</span><span className="sm:hidden">Kiosk</span>
        </a>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 transition-all cursor-pointer flex items-center gap-1.5"
          title="Sign Out of Admin Portal"
        >
          <span>🚪</span>
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
