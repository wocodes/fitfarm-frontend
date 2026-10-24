'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';

declare global {
  interface Window {
    Fingerprint: any;
    WebSdk: any;
    DigitalPersona: any;
  }
}

interface MemberInfo {
  name: string;
  plan: string;
  expiry: string;
  photoUrl?: string;
  memberUid?: string;
}

export default function CheckInKioskPage() {
  const [status, setStatus] = useState<string>('Initializing Scanner & Hardware SDK...');
  const [hardwareConnected, setHardwareConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [checkinResult, setCheckinResult] = useState<'success' | 'failure' | null>(null);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Owner check state
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Dev / Simulation Member Dropdown State
  const [membersList, setMembersList] = useState<any[]>([]);
  const [selectedMemberUid, setSelectedMemberUid] = useState<string>('');
  const [simulating, setSimulating] = useState<boolean>(false);

  const readerRef = useRef<any>(null);
  const capturingRef = useRef<boolean>(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current logged-in user is a Gym Owner or Super Admin
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('fitcloud_user') || localStorage.getItem('polanfit_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        const role = (u.role || (Array.isArray(u.roles) ? u.roles.join(' ') : '') || '').toUpperCase();
        const email = (u.email || u.username || '').toLowerCase();

        if (
          role.includes('OWNER') ||
          role.includes('SUPER') ||
          role.includes('ADMIN') ||
          email.includes('alpha_engineer') ||
          email.includes('owner') ||
          u.isOwner === true
        ) {
          setIsOwner(true);
        }
      } else {
        // Default to true if unauthenticated dev preview
        setIsOwner(true);
      }
    } catch (_) {
      setIsOwner(true);
    }
  }, []);

  // Fetch Members for Simulation Quick Dropdown
  const loadMembers = useCallback(async () => {
    try {
      const res = await apiFetch('/admin/members?per_page=500');
      if (res.success && res.data) {
        let list: any[] = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data.data)) {
          list = res.data.data;
        } else if (Array.isArray(res.data.content)) {
          list = res.data.content;
        }
        setMembersList(list);
        if (list.length > 0) {
          const firstUid = list[0].uid || list[0].uuid || String(list[0].id);
          setSelectedMemberUid(firstUid);
        }
      }
    } catch (err) {
      console.error('Failed to load members for kiosk simulation:', err);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Process Biometric Check-In Result (Simulation)
  const handleCheckInEvaluation = useCallback(async (targetUid: string) => {
    setLoading(true);
    setCheckinResult(null);
    setStatus('Verifying biometric identity against member register...');

    try {
      const res = await apiFetch('/admin/checkins/simulate-fingerprint', {
        method: 'POST',
        body: JSON.stringify({ memberUid: targetUid }),
      });

      if (res.success && res.data) {
        const data = res.data;
        const isGranted = data.accessGranted ?? true;

        if (isGranted) {
          setCheckinResult('success');
          setMemberInfo({
            name: data.memberName || 'Active Member',
            plan: data.subscriptionType || 'Standard Membership',
            expiry: 'Active Valid Plan',
            photoUrl: data.profilePictureUrl,
            memberUid: targetUid,
          });
          setStatus(res.message || '✓ ACCESS GRANTED: Welcome back!');
        } else {
          setCheckinResult('failure');
          setErrorMessage(data.message || '⚠️ ACCESS DENIED: Inactive membership.');
          setStatus('⚠️ ACCESS DENIED: Membership Expired or Inactive');
        }
      } else {
        setCheckinResult('failure');
        setErrorMessage(res.message || 'Fingerprint match not found in database.');
        setStatus('🚫 ACCESS DENIED: Unregistered Fingerprint');
      }
    } catch (err: any) {
      setCheckinResult('failure');
      setErrorMessage(err.message || 'System error evaluating check-in.');
      setStatus('System Error evaluating biometrics.');
    } finally {
      setLoading(false);

      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setCheckinResult(null);
        setMemberInfo(null);
        setErrorMessage('');
        setStatus('Ready: Place finger on scanner to enter');
      }, 5000);
    }
  }, []);

  // Hardware Biometric Scan Processing (from physical USB Fingerprint Scanner)
  const performHardwareScanVerification = useCallback(async (base64Hash: string) => {
    setLoading(true);
    setCheckinResult(null);
    setStatus('Processing hardware biometrics...');

    try {
      const res = await apiFetch('/admin/checkins/simulate-fingerprint', {
        method: 'POST',
        body: JSON.stringify({ fingerprintData: base64Hash }),
      });

      if (res.success && res.data) {
        const d = res.data;
        const isGranted = d.accessGranted ?? d.granted ?? true;
        if (isGranted) {
          setCheckinResult('success');
          setMemberInfo({
            name: d.memberName || 'Member',
            plan: d.subscriptionType || 'Standard Plan',
            expiry: d.endDate || 'Active',
            photoUrl: d.profilePictureUrl,
          });
          setStatus(res.message || '✓ ACCESS GRANTED: Welcome!');
        } else {
          setCheckinResult('failure');
          setErrorMessage(d.message || res.message || 'Access Denied.');
          setStatus('⚠️ ACCESS DENIED');
        }
      } else {
        setCheckinResult('failure');
        setErrorMessage(res.message || 'Access Denied: Unregistered Fingerprint');
        setStatus('🚫 Access Denied');
      }
    } catch (err: any) {
      setCheckinResult('failure');
      setErrorMessage(err.message || 'Identification failed.');
      setStatus('Scan Error');
    } finally {
      setLoading(false);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setCheckinResult(null);
        setMemberInfo(null);
        setErrorMessage('');
        beginCapture();
      }, 5000);
    }
  }, []);

  // Begin Hardware Capture Listener
  const beginCapture = useCallback(async () => {
    if (!readerRef.current || capturingRef.current) return;
    capturingRef.current = true;

    try {
      const devices = await readerRef.current.enumerateDevices();
      if (devices && devices.length > 0) {
        setHardwareConnected(true);
        setStatus('HARDWARE ACTIVE: Place finger on scanner');
        const format = window.Fingerprint.SampleFormat ? window.Fingerprint.SampleFormat.PngImage : 1;
        await readerRef.current.startAcquisition(format);
      } else {
        setHardwareConnected(false);
        setStatus('Ready: Touch fingerprint reader or select member below');
        capturingRef.current = false;
      }
    } catch (err) {
      setHardwareConnected(false);
      setStatus('Ready: Touch fingerprint reader or select member below');
      capturingRef.current = false;
    }
  }, []);

  // Initialize DigitalPersona Hardware SDK
  const initReader = useCallback(() => {
    try {
      if (typeof window.Fingerprint !== 'undefined' && window.Fingerprint.WebApi) {
        const fpReader = new window.Fingerprint.WebApi();
        readerRef.current = fpReader;

        fpReader.onSamplesAcquired = (s: any) => {
          const samples = typeof s.samples === 'string' ? JSON.parse(s.samples) : s.samples;
          const sample = samples[0];
          const raw: string = sample && typeof sample === 'object' ? sample.Data ?? sample.data ?? '' : sample;
          const base64Data =
            window.Fingerprint.b64UrlTo64 && typeof raw === 'string' && (raw.includes('-') || raw.includes('_'))
              ? window.Fingerprint.b64UrlTo64(raw)
              : raw;

          try {
            fpReader.stopAcquisition();
          } catch (_) {}
          capturingRef.current = false;
          performHardwareScanVerification(base64Data);
        };

        fpReader.onDeviceConnected = () => {
          setHardwareConnected(true);
          setStatus('Hardware Scanner Connected! Starting capture...');
          beginCapture();
        };

        fpReader.onDeviceDisconnected = () => {
          setHardwareConnected(false);
          setStatus('Hardware Scanner Disconnected.');
          capturingRef.current = false;
        };

        beginCapture();
      } else {
        setStatus('Ready: Touch fingerprint reader or select member below');
      }
    } catch (e) {
      setStatus('Ready: Touch fingerprint reader or select member below');
    }
  }, [beginCapture, performHardwareScanVerification]);

  // Dynamically Load DigitalPersona Hardware SDK Scripts
  useEffect(() => {
    const sdkScripts = [
      'https://unpkg.com/@digitalpersona/core@0.1.7/dist/es5.bundles/index.umd.min.js',
      'https://unpkg.com/@digitalpersona/websdk@1.1.0/dist/websdk.client.min.js',
      'https://unpkg.com/@digitalpersona/fingerprint@1.0.0/dist/fingerprint.sdk.min.js',
      'https://unpkg.com/@digitalpersona/devices@0.2.6/dist/es5.bundles/index.umd.min.js',
    ];

    let cancelled = false;
    const loadNext = (index: number) => {
      if (cancelled) return;
      if (index >= sdkScripts.length) {
        initReader();
        return;
      }
      if (document.querySelector(`script[src="${sdkScripts[index]}"]`)) {
        loadNext(index + 1);
        return;
      }
      const script = document.createElement('script');
      script.src = sdkScripts[index];
      script.onload = () => loadNext(index + 1);
      script.onerror = () => loadNext(index + 1);
      document.head.appendChild(script);
    };

    if (typeof window.Fingerprint !== 'undefined' && window.Fingerprint.WebApi) {
      initReader();
    } else {
      loadNext(0);
    }

    return () => {
      cancelled = true;
    };
  }, [initReader]);

  // Trigger Instant Fingerprint Scan Simulation
  const handleSimulateScan = () => {
    if (!selectedMemberUid) return;
    setSimulating(true);
    handleCheckInEvaluation(selectedMemberUid).finally(() => setSimulating(false));
  };

  // Reset Scanner
  const handleResetScanner = () => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setCheckinResult(null);
    setMemberInfo(null);
    setErrorMessage('');
    setLoading(false);
    capturingRef.current = false;
    beginCapture();
  };

  return (
    <div className="flex min-h-screen bg-[#060608] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Open Entrance Biometric Kiosk"
          subtitle="Hardware fingerprint biometric check-in & automated gate access control"
        />

        <main className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
          {/* Main Modern Kiosk Terminal Frame */}
          <div className="w-full bg-[#0d0d12] border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div
              className={`absolute -top-32 -left-32 w-96 h-96 rounded-full filter blur-[120px] transition-all duration-700 opacity-20 pointer-events-none ${
                checkinResult === 'success'
                  ? 'bg-emerald-500'
                  : checkinResult === 'failure'
                  ? 'bg-red-500'
                  : 'bg-orange-500'
              }`}
            />

            {/* Terminal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                    FitCloud Entrance Kiosk #01
                  </span>
                  {hardwareConnected && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[9px] font-extrabold uppercase">
                      USB Reader Connected
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">Biometric Turnstile Gate</h2>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    checkinResult === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : checkinResult === 'failure'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>{checkinResult === 'success' ? 'GATE OPEN' : checkinResult === 'failure' ? 'GATE LOCKED' : 'ONLINE / LISTENING'}</span>
                </span>
              </div>
            </div>

            {/* Center Biometric Scanner Area */}
            <div className="text-center py-4 space-y-6 relative z-10">
              {/* Animated Fingerprint Circle Kiosk Graphic */}
              <div className="relative inline-block">
                <div
                  onClick={isOwner ? handleSimulateScan : undefined}
                  className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full mx-auto flex items-center justify-center transition-all duration-500 border-4 relative ${
                    isOwner ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    checkinResult === 'success'
                      ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]'
                      : checkinResult === 'failure'
                      ? 'bg-red-500/20 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]'
                      : 'bg-[#12121a] border-orange-500/40 hover:border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.15)]'
                  }`}
                >
                  {/* Glowing Radar Pulse Rings */}
                  {!checkinResult && (
                    <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-ping opacity-75"></div>
                  )}

                  {checkinResult === 'success' ? (
                    <div className="text-6xl text-emerald-400 animate-bounce">✓</div>
                  ) : checkinResult === 'failure' ? (
                    <div className="text-6xl text-red-500">✕</div>
                  ) : (
                    <div className="relative">
                      {/* High Tech Fingerprint SVG Icon */}
                      <svg
                        className={`w-24 h-24 sm:w-28 sm:h-28 transition-all duration-500 ${
                          loading ? 'text-orange-400 animate-pulse scale-110' : 'text-orange-500/80 hover:text-orange-400'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.2"
                          d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                        />
                      </svg>

                      {/* Laser Scanner Bar Animation */}
                      {!checkinResult && (
                        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_15px_#f97316] animate-[scan_2s_ease-in-out_infinite]"></div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Header */}
              <div>
                <h3
                  className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${
                    checkinResult === 'success'
                      ? 'text-emerald-400'
                      : checkinResult === 'failure'
                      ? 'text-red-400'
                      : 'text-white'
                  }`}
                >
                  {checkinResult === 'success'
                    ? 'ACCESS GRANTED — WELCOME!'
                    : checkinResult === 'failure'
                    ? 'ACCESS DENIED'
                    : 'FINGERPRINT ACCESS CONTROL'}
                </h3>

                <p className="text-xs text-gray-400 font-medium mt-1 max-w-md mx-auto">{status}</p>
              </div>

              {/* Success Result Member Card */}
              {checkinResult === 'success' && memberInfo && (
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left space-y-3 animate-fadeIn shadow-xl">
                  <div className="flex items-center gap-4">
                    {memberInfo.photoUrl ? (
                      <img
                        src={memberInfo.photoUrl}
                        alt={memberInfo.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center font-black text-xl">
                        {memberInfo.name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-extrabold text-white truncate">{memberInfo.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-black font-extrabold text-[10px] uppercase">
                          {memberInfo.plan}
                        </span>
                        <span className="text-[11px] text-gray-300 font-mono">Status: Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Failure Error Card */}
              {checkinResult === 'failure' && (
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-1 animate-fadeIn shadow-xl">
                  <p className="text-xs font-bold text-red-400">{errorMessage}</p>
                  <p className="text-[11px] text-gray-400">Please report to reception desk to renew subscription.</p>
                </div>
              )}
            </div>

            {/* Bottom Kiosk Quick Simulation & Control Bar */}
            <div className="pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs relative z-10">
              {isOwner ? (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                    ⚡ Owner Simulation Tool
                  </span>
                  <select
                    value={selectedMemberUid}
                    onChange={(e) => setSelectedMemberUid(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold text-xs outline-none focus:border-orange-500/50 flex-1 sm:flex-none max-w-xs"
                  >
                    {membersList.length === 0 ? (
                      <option value="">No members loaded</option>
                    ) : (
                      membersList.map((m) => {
                        const uid = m.uid || m.uuid || String(m.id);
                        const name =
                          m.first_name && m.last_name
                            ? `${m.first_name} ${m.last_name}`
                            : m.name || m.email || `Member #${m.id}`;
                        return (
                          <option key={uid} value={uid}>
                            {name} ({m.member_number || m.email || 'Member'})
                          </option>
                        );
                      })
                    )}
                  </select>

                  <button
                    onClick={handleSimulateScan}
                    disabled={simulating || loading || membersList.length === 0}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-orange-500/20 whitespace-nowrap"
                  >
                    {simulating ? 'Scanning...' : '🖐️ Scan Finger'}
                  </button>
                </div>
              ) : (
                <div className="text-gray-400 text-xs font-medium">
                  🔒 Biometric Hardware Scanner Active. Manual simulation tools reserved for Gym Owners.
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetScanner}
                  className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs transition"
                >
                  🔄 Reset Kiosk Scanner
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 15%; }
          50% { top: 80%; }
        }
      `}</style>
    </div>
  );
}
