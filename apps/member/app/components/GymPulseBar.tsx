'use client';

import React from 'react';

interface GymPulseBarProps {
  tenantName?: string;
}

export default function GymPulseBar({ tenantName = 'PolanFit Arena' }: GymPulseBarProps) {
  return (
    <div className="w-full bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-gray-800/60 px-6 py-4 shadow-2xl relative z-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Operating Status */}
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <span className="font-extrabold text-white block">Gym Open Today</span>
            <span className="text-gray-400 font-mono text-[11px]">06:00 AM – 10:00 PM</span>
          </div>
        </div>

        {/* Live Traffic Meter */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
            ⚡
          </div>
          <div>
            <span className="font-extrabold text-white block">Floor Traffic: Light (34%)</span>
            <span className="text-emerald-400 font-medium text-[11px]">Optimal workout floor flow</span>
          </div>
        </div>

        {/* Turnstile Access Speed */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
            📱
          </div>
          <div>
            <span className="font-extrabold text-white block">Fast-Track Turnstiles</span>
            <span className="text-gray-400 text-[11px]">Optical QR & Fingerprint Active</span>
          </div>
        </div>

        {/* Location & Support */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
            📍
          </div>
          <div>
            <span className="font-extrabold text-white block truncate">{tenantName}</span>
            <span className="text-gray-400 text-[11px]">Secure Parking & Locker Suites</span>
          </div>
        </div>
      </div>
    </div>
  );
}
