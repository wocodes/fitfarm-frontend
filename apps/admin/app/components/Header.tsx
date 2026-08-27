'use client';

import React, { useEffect, useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [tenantName, setTenantName] = useState('PolanFit Arena');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tenant = searchParams.get('tenant');
      if (tenant) {
        setTenantName(tenant.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
      }
    }
  }, []);

  return (
    <header className="h-20 px-8 border-b border-gray-800/80 bg-[#0a0a0c]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Active Gym Tenant Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span>{tenantName}</span>
        </div>

        {/* Quick Kiosk Link Button */}
        <a
          href="/check-in"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-extrabold text-xs transition shadow-lg shadow-orange-500/20"
        >
          🚪 Open Entrance Kiosk
        </a>
      </div>
    </header>
  );
}
