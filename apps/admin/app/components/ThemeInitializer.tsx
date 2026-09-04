'use client';

import { useEffect } from 'react';
import { applyTheme, initThemeSync } from '../lib/theme';
import apiClient from '../lib/apiClient';

export default function ThemeInitializer() {
  useEffect(() => {
    // 1. Sync from localStorage or cross-tab broadcast
    const cleanup = initThemeSync();

    // 2. Fetch fresh theme settings from backend
    apiClient
      .get('/theme')
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          applyTheme(res.data.data);
        }
      })
      .catch(() => {
        // Fallback to default
        applyTheme();
      });

    return cleanup;
  }, []);

  return null;
}
