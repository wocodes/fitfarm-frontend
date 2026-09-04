'use client';

export interface TerminalMeta {
  token: string;
  name: string;
  registeredAt: string;
  deviceFingerprint: string;
}

const STORAGE_KEY_TOKEN = 'fitcloud_terminal_token';
const STORAGE_KEY_META = 'fitcloud_terminal_meta';

/**
 * Retrieve the active terminal secret token stored on this browser device.
 */
export function getTerminalToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_TOKEN);
}

/**
 * Retrieve the active terminal metadata stored on this browser device.
 */
export function getTerminalMeta(): TerminalMeta | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY_META);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Store newly enrolled terminal token and metadata in localStorage.
 */
export function saveTerminalToken(token: string, name: string, deviceFingerprint: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
  localStorage.setItem(
    STORAGE_KEY_META,
    JSON.stringify({
      token,
      name,
      registeredAt: new Date().toISOString(),
      deviceFingerprint,
    })
  );
}

/**
 * Clear terminal registration from this browser device.
 */
export function clearTerminalRegistration() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_META);
}

/**
 * Build a human-readable device fingerprint describing the current OS, browser and screen.
 */
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'Unknown Device';

  const userAgent = navigator.userAgent || '';
  let os = 'Unknown OS';
  if (userAgent.indexOf('Win') !== -1) os = 'Windows';
  else if (userAgent.indexOf('Mac') !== -1) os = 'macOS';
  else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';
  else if (userAgent.indexOf('Android') !== -1) os = 'Android';
  else if (userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) os = 'iOS';

  let browser = 'Unknown Browser';
  if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (userAgent.indexOf('Edg') !== -1) browser = 'Microsoft Edge';
  else if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';

  const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0}`;

  return `${browser} on ${os} (${screenRes})`;
}
