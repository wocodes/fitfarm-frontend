'use client';

import { useEffect } from 'react';
import { applyTheme, initThemeSync } from '../lib/theme';
import { memberApiFetch } from '../lib/api';

export default function ThemeInitializer() {
  useEffect(() => {
    // 1. Sync from localStorage or cross-tab broadcast
    const cleanup = initThemeSync();

    // 2. Fetch fresh theme from tenant info
    let slug = 'polanfit-fitness';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlSlug = params.get('tenant');
      if (urlSlug) slug = urlSlug;
    }

    memberApiFetch(`/member/portal/info?tenant=${slug}`)
      .then((res) => {
        if (res.success && res.data?.theme) {
          applyTheme(res.data.theme);
        }
      })
      .catch(() => {
        applyTheme();
      });

    return cleanup;
  }, []);

  return null;
}
