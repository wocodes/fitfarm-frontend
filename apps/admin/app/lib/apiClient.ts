'use client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const CENTRAL_URL = process.env.NEXT_PUBLIC_CENTRAL_URL || 'http://localhost:3000';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fitcloud_token') || localStorage.getItem('polanfit_token');
}

export function getTenantSlug(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('fitcloud_tenant_slug') || localStorage.getItem('polanfit_tenant_slug') || 'polanfit';
}

export function handleUnauthorized() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fitcloud_token');
    localStorage.removeItem('polanfit_token');
    localStorage.removeItem('fitcloud_user');
    window.location.href = `${CENTRAL_URL}/setup`;
  }
}

export function handleLogout() {
  if (typeof window !== 'undefined') {
    const token = getAuthToken();
    if (token) {
      fetch(`${API_URL}/central/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }).catch(() => {});
    }
    localStorage.removeItem('fitcloud_token');
    localStorage.removeItem('polanfit_token');
    localStorage.removeItem('fitcloud_user');
    localStorage.removeItem('fitcloud_tenant_slug');
    window.location.href = `${CENTRAL_URL}/setup`;
  }
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const tenantSlug = getTenantSlug();

  // If no token exists at call time, redirect immediately to setup/login
  if (!token) {
    handleUnauthorized();
    throw new Error('Unauthenticated');
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  if (tenantSlug) {
    defaultHeaders['X-Tenant-Slug'] = tenantSlug;
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body && !(options.body instanceof FormData) && !mergedHeaders['Content-Type']) {
    mergedHeaders['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthenticated (401)');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    const error: any = new Error(errorData.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = errorData;
    throw error;
  }

  return await res.json();
}
