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

// Supported Google Fonts and their import URLs
export const FONT_OPTIONS = [
  {
    name: 'Inter',
    category: 'Universal Precision',
    desc: 'Crisp, modern, and versatile',
    sample: 'PEAK FITNESS & METRICS',
    googleFont: 'Inter:wght@400;600;700;800;900',
  },
  {
    name: 'Outfit',
    category: 'Geometric Athletic',
    desc: 'Bold, punchy, energetic curves',
    sample: 'EXPLOSIVE SPEED & AGILITY',
    googleFont: 'Outfit:wght@400;600;700;800;900',
  },
  {
    name: 'Plus Jakarta Sans',
    category: 'Sleek SaaS & Tech',
    desc: 'Ultra-modern athletic intelligence',
    sample: 'PRECISION TRACKING 24/7',
    googleFont: 'Plus+Jakarta+Sans:wght@400;600;700;800',
  },
  {
    name: 'Montserrat',
    category: 'Classic Powerhouse',
    desc: 'Impactful, structured, high-energy',
    sample: 'OLYMPIC IRON & LIFTING',
    googleFont: 'Montserrat:wght@400;600;700;800;900',
  },
  {
    name: 'Oswald',
    category: 'Condensed Heavy Strength',
    desc: 'Tall, aggressive, hardcore barbell',
    sample: 'MAX EFFORT HYPERTROPHY',
    googleFont: 'Oswald:wght@500;600;700',
  },
  {
    name: 'Syne',
    category: 'Boutique & Combat Studio',
    desc: 'Avant-garde, stylized fitness club',
    sample: 'ELITE MOVEMENT & FLOW',
    googleFont: 'Syne:wght@600;700;800',
  },
  {
    name: 'Cinzel',
    category: 'Luxury Wellness & Spa',
    desc: 'Refined serif for VIP health resorts',
    sample: 'EXCLUSIVE RECOVERY & SUITE',
    googleFont: 'Cinzel:wght@600;700;800',
  },
];

function hexToRgb(hex: string): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return '250, 106, 46';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export function loadFontFamily(fontName: string) {
  if (typeof window === 'undefined') return;

  const fontConfig = FONT_OPTIONS.find((f) => f.name.toLowerCase() === fontName.toLowerCase());
  if (!fontConfig) return;

  const fontId = `fitcloud-font-${fontName.toLowerCase().replace(/\s+/g, '-')}`;
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontConfig.googleFont}&display=swap`;
    document.head.appendChild(link);
  }
}

export function applyTheme(theme?: Partial<ThemeSettings> | null) {
  if (typeof window === 'undefined') return;

  const primary = theme?.primary_color || '#fa6a2e';
  const accent = theme?.accent_color || '#1e293b';
  const fontFamily = theme?.font_family || 'Inter';
  const rgb = hexToRgb(primary);

  // Load font if needed
  loadFontFamily(fontFamily);

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
      --brand-font: '${fontFamily}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
    
    body, button, input, select, textarea {
      font-family: var(--brand-font);
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

  // 1. Preload default fonts
  FONT_OPTIONS.forEach((f) => loadFontFamily(f.name));

  // 2. Check local storage
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      applyTheme(parsed);
      if (onUpdate) onUpdate(parsed);
    } catch {}
  }

  // 3. Listen for BroadcastChannel
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

  // 4. Listen for window storage events across tabs
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
