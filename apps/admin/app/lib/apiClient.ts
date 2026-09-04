'use client';

import { getTerminalToken } from './terminalManager';

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

// -------------------------------------------------------------
// High-Performance In-Memory & SWR Client Cache Layer
// -------------------------------------------------------------

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
}

const clientCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();

export interface ApiFetchOptions extends RequestInit {
  /**
   * Cache duration in milliseconds for GET requests.
   * Default is 30,000ms (30 seconds). Set to 0 to disable caching for this call.
   */
  cacheDurationMs?: number;
  /**
   * If true, ignores cached data and forces a live network fetch, then updates cache.
   */
  forceRefresh?: boolean;
}

/**
 * Invalidate in-memory client cache.
 * Call this when a mutation (create, edit, delete) occurs to ensure fresh data.
 * @param prefix Optional endpoint prefix to selectively invalidate (e.g. '/admin/members'). If omitted, clears all cache.
 */
export function invalidateApiCache(prefix?: string) {
  if (!prefix) {
    clientCache.clear();
    return;
  }
  const tenantSlug = getTenantSlug() || 'default';
  const targetPrefix = `${tenantSlug}:${prefix}`;
  for (const key of clientCache.keys()) {
    if (key.startsWith(targetPrefix)) {
      clientCache.delete(key);
    }
  }
}

/**
 * Prefetches an endpoint in the background and populates the client cache.
 * Useful for hover-based preloading so page transitions feel instantaneous.
 */
export function prefetchApi(endpoint: string, cacheDurationMs = 60000) {
  if (typeof window === 'undefined') return;
  const token = getAuthToken();
  if (!token) return;

  const tenantSlug = getTenantSlug() || 'default';
  const cacheKey = `${tenantSlug}:${endpoint}`;

  // If already fresh in cache, no need to refetch
  const cached = clientCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cacheDurationMs) {
    return;
  }

  // If already in flight, do not duplicate
  if (inFlightRequests.has(cacheKey)) {
    return;
  }

  // Trigger background fetch
  apiFetch(endpoint, { cacheDurationMs }).catch((err) => {
    // Silently ignore prefetch errors
    console.debug('Prefetch note:', endpoint, err?.message);
  });
}

/**
 * Core API fetcher with automatic authentication, tenant headers, SWR caching, and request deduplication.
 */
export async function apiFetch<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const token = getAuthToken();
  const tenantSlug = getTenantSlug();

  // If no token exists at call time, redirect immediately to setup/login
  if (!token) {
    handleUnauthorized();
    throw new Error('Unauthenticated');
  }

  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const cacheDuration = options.cacheDurationMs ?? 30000; // 30s default cache for GET
  const cacheKey = `${tenantSlug || 'default'}:${endpoint}`;

  // If this is a mutation (POST, PUT, DELETE, PATCH), automatically invalidate related cache
  if (!isGet) {
    invalidateApiCache();
  }

  // Check cache for GET requests
  if (isGet && cacheDuration > 0 && !options.forceRefresh) {
    const cached = clientCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data as T;
    }
  }

  // Request deduplication: if identical GET request is currently in-flight, return the existing Promise
  if (isGet && inFlightRequests.has(cacheKey) && !options.forceRefresh) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
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

  const terminalToken = getTerminalToken();
  if (terminalToken) {
    defaultHeaders['X-Terminal-Token'] = terminalToken;
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body && !(options.body instanceof FormData) && !mergedHeaders['Content-Type']) {
    mergedHeaders['Content-Type'] = 'application/json';
  }

  const fetchPromise = (async () => {
    try {
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
        error.errorCode = errorData.error_code;
        error.isTerminalBlocked = errorData.error_code === 'UNAUTHORIZED_TERMINAL_DEVICE';
        throw error;
      }

      const json = await res.json();

      // Store in client cache for GET requests
      if (isGet && cacheDuration > 0) {
        clientCache.set(cacheKey, {
          data: json,
          timestamp: Date.now(),
        });
      }

      return json;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  if (isGet) {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  return await fetchPromise;
}
