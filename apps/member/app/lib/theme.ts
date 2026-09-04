'use client';

export interface ThemeSettings {
  primary_color: string;
  accent_color?: string;
  bg_color?: string;
  text_color?: string;
  font_family?: string;
  dark_mode?: boolean;
  logo_url?: string;
}

const THEME_KEY = 'fitcloud_theme_settings';
const BROADCAST_CHANNEL = 'fitcloud_theme_sync';

function hexToRgb(hex: string): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return '250, 106, 46';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export function applyTheme(theme?: Partial<ThemeSettings> | null) {
  if (typeof window === 'undefined') return;

  const primary = theme?.primary_color || '#fa6a2e';
  const accent = theme?.accent_color || '#1e293b';
  const rgb = hexToRgb(primary);

  let styleEl = document.getElementById('fitcloud-dynamic-theme') as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'fitcloud-dynamic-theme';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    :root {
      --brand-primary: ${primary} !important;
      --brand-primary-rgb: ${rgb} !important;
      --brand-accent: ${accent} !important;
    }
    
    /* Dynamic Primary Color Overrides */
    .bg-orange-500,
    .hover\\:bg-orange-500:hover,
    .bg-orange-600,
    .hover\\:bg-orange-600:hover {
      background-color: var(--brand-primary) !important;
    }
    
    .text-orange-400,
    .text-orange-500,
    .hover\\:text-orange-400:hover,
    .group-hover\\:text-orange-400:hover {
      color: var(--brand-primary) !important;
    }
    
    .border-orange-500,
    .border-orange-500\\/80,
    .border-orange-500\\/60,
    .border-orange-500\\/50,
    .border-orange-500\\/40,
    .border-orange-500\\/30,
    .border-orange-500\\/20,
    .border-orange-500\\/10,
    .hover\\:border-orange-500:hover,
    .hover\\:border-orange-500\\/40:hover,
    .hover\\:border-orange-500\\/50:hover {
      border-color: var(--brand-primary) !important;
    }
    
    .from-orange-500 {
      --tw-gradient-from: var(--brand-primary) var(--tw-gradient-from-position) !important;
    }
    .to-orange-500 {
      --tw-gradient-to: var(--brand-primary) var(--tw-gradient-to-position) !important;
    }
    
    .shadow-orange-500\\/20,
    .shadow-orange-500\\/25,
    .shadow-orange-500\\/10 {
      --tw-shadow-color: rgb(var(--brand-primary-rgb) / 0.25) !important;
    }
  `;

  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  } catch {}
}

export function broadcastThemeChange(theme: ThemeSettings) {
  if (typeof window === 'undefined') return;
  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    channel.postMessage(theme);
    channel.close();
  } catch {}
  applyTheme(theme);
}

export function initThemeSync(onUpdate?: (theme: ThemeSettings) => void) {
  if (typeof window === 'undefined') return () => {};

  // 1. Check local storage
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      applyTheme(parsed);
      if (onUpdate) onUpdate(parsed);
    } catch {}
  }

  // 2. Listen for BroadcastChannel
  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(BROADCAST_CHANNEL);
    channel.onmessage = (event) => {
      if (event.data) {
        applyTheme(event.data);
        if (onUpdate) onUpdate(event.data);
      }
    };
  } catch {}

  // 3. Listen for window storage events across tabs
  const handleStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        applyTheme(parsed);
        if (onUpdate) onUpdate(parsed);
      } catch {}
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    if (channel) channel.close();
    window.removeEventListener('storage', handleStorage);
  };
}
