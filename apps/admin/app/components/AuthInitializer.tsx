'use client';

import React, { useEffect, useState } from 'react';
import {
  API_URL,
  getAuthToken,
  getTenantSlug,
  handleUnauthorized,
} from '../lib/apiClient';

/**
 * Blocks the admin UI until we know the visitor has a valid session.
 * This prevents the console from briefly flashing before an unauthenticated
 * visitor is redirected back to the central sign-in screen.
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      const token = getAuthToken();
      if (!token) {
        handleUnauthorized();
        return;
      }

      try {
        const res = await fetch(`${API_URL}/central/auth/profile`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          handleUnauthorized();
          return;
        }

        const json = await res.json();
        if (!json?.success || !json?.data) {
          handleUnauthorized();
          return;
        }

        const user = json.data;
        const tenantSlug = user?.tenant?.slug || getTenantSlug();
        if (tenantSlug) {
          localStorage.setItem('fitcloud_tenant_slug', tenantSlug);
          localStorage.setItem('polanfit_tenant_slug', tenantSlug);
        }
        localStorage.setItem('fitcloud_user', JSON.stringify(user));

        if (!cancelled) setReady(true);
      } catch {
        handleUnauthorized();
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070709] text-white">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-orange-500/20 animate-pulse">
          FF
        </div>
        <p className="mt-4 text-xs font-semibold text-gray-400">Verifying your admin session…</p>
      </div>
    );
  }

  return <>{children}</>;
}
