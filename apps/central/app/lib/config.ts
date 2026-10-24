const isDevelopment = process.env.NODE_ENV === 'development';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isDevelopment
    ? 'http://localhost:8000/api/v1'
    : 'https://api.fitfarmhq.com/api/v1');

export const ADMIN_APP_URL =
  process.env.NEXT_PUBLIC_ADMIN_APP_URL ||
  (isDevelopment ? 'http://localhost:3001' : 'https://admin.fitfarmhq.com');

export const PLATFORM_DOMAIN =
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'fitfarmhq.com';
