'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function CheckInKioskPage() {
  const [searchInput, setSearchInput] = useState('');
  const [lastCheckIn, setLastCheckIn] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    if (searchInput.toLowerCase().includes('expired') || searchInput === '999') {
      setStatus('error');
      setErrorMessage('⚠️ ACCESS DENIED: Member subscription expired on 2026-08-20.');
      setLastCheckIn(null);
    } else {
      setStatus('success');
      setLastCheckIn({
        memberName: searchInput,
        planName: 'VIP Quarterly',
        checkInTime: new Date().toLocaleTimeString(),
        method: 'Fingerprint Biometric Scanner',
        expiresAt: '2026-11-30',
      });
      setSearchInput('');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Entrance Check-In Kiosk" subtitle="Live entrance access validation (USB Biometric Scanner / QR Code / Manual ID)" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
          {/* Kiosk Scan Card */}
          <div className="p-8 rounded-3xl bg-[#0f0f13] border border-gray-800 text-center space-y-6 shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange-500/10 text-orange-500 border border-orange-500/30 text-4xl shadow-xl animate-pulse">
              🚪
            </div>

            <div>
              <h2 className="text-2xl font-black">Scan Fingerprint or QR Code</h2>
              <p className="text-xs text-gray-400 mt-1">
                Touch the USB fingerprint reader or type member ID / phone number below to validate entry.
              </p>
            </div>

            <form onSubmit={handleManualScan} className="max-w-md mx-auto flex gap-2">
              <input
                type="text"
                placeholder="Enter Member Name or Phone (e.g. Gabriel O.)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-5 py-3 rounded-2xl bg-[#070709] border border-gray-800 text-white text-sm font-medium focus:border-orange-500 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-black font-extrabold text-xs transition shadow-lg shadow-orange-500/20"
              >
                Scan Entry
              </button>
            </form>

            {/* Validation Banner Result */}
            {status === 'success' && lastCheckIn && (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-left space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-black font-black text-xs uppercase tracking-wider">
                    ✓ ACCESS GRANTED
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">{lastCheckIn.checkInTime}</span>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                    {lastCheckIn.memberName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{lastCheckIn.memberName}</h3>
                    <p className="text-xs text-gray-300">
                      Plan: <span className="font-bold text-orange-400">{lastCheckIn.planName}</span> (Valid until {lastCheckIn.expiresAt})
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-400 font-bold text-sm text-center animate-fadeIn">
                {errorMessage}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
