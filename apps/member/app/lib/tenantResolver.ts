'use client';

const PLATFORM_DOMAIN = (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || '')
  .toLowerCase()
  .replace(/^\.|\.$/g, '');

const STORAGE_KEY = 'fitcloud_member_tenant';

export const DEFAULT_TENANT_SLUG = 'polanfit-fitness';

function normalizeHost(host: string): string {
  return (host || '')
    .toLowerCase()
    .replace(/:\d+$/, '')
    .replace(/^www\./, '');
}

export function persistTenantSlug(slug: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, slug.toLowerCase());
  } catch {}
}

/**
 * Resolve the tenant slug for this page load.
 *
 * Priority:
 *   1. `?tenant=` query param (explicit, wins always)
 *   2. Platform subdomain: `{slug}.fitfarmhq.com` (wildcard member portals)
 *   3. Previously used tenant for this origin (custom gym domains)
 *   4. DEFAULT_TENANT_SLUG
 *
 * The resolved value is persisted so the pre-paint theme script and repeat
 * visits on a custom domain render the correct branding instantly.
 */
export function resolveTenantSlug(): string {
  if (typeof window === 'undefined') return DEFAULT_TENANT_SLUG;

  // 1. Explicit query param
  const params = new URLSearchParams(window.location.search);
  const urlSlug = params.get('tenant');
  if (urlSlug && urlSlug.trim()) {
    persistTenantSlug(urlSlug.trim());
    return urlSlug.trim().toLowerCase();
  }

  // 2. Platform subdomain (single label before the platform domain)
  const host = normalizeHost(window.location.hostname);
  if (PLATFORM_DOMAIN && host.endsWith('.' + PLATFORM_DOMAIN)) {
    const label = host.slice(0, -(PLATFORM_DOMAIN.length + 1));
    if (label && !label.includes('.')) {
      persistTenantSlug(label);
      return label;
    }
  }

  // 3. Previously used tenant for this origin (custom domains)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored.trim()) return stored.trim().toLowerCase();
  } catch {}

  // 4. Fallback
  return DEFAULT_TENANT_SLUG;
}