'use client';

import { useEffect } from 'react';
import { getAuthToken, handleUnauthorized } from '../lib/apiClient';

export default function AuthInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const token = hashParams.get('token') || params.get('token');
      const tenant = hashParams.get('tenant') || params.get('tenant');

      if (token) {
        localStorage.setItem('fitcloud_token', token);
        localStorage.setItem('polanfit_token', token);
        if (tenant) {
          localStorage.setItem('fitcloud_tenant_slug', tenant);
        }
        // Remove the credential from both the query string and fragment.
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      } else {
        // If no token in URL and no token in localStorage, redirect to central login/setup
        const storedToken = getAuthToken();
        if (!storedToken) {
          handleUnauthorized();
        }
      }
    }
  }, []);

  return null;
}
