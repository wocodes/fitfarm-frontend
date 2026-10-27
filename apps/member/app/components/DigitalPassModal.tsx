'use client';

import React, { useEffect, useState } from 'react';
import { generateQrDataUrl } from '../lib/qrGenerator';

interface DigitalPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberData?: any;
  tenantName?: string;
}

export default function DigitalPassModal({
  isOpen,
  onClose,
  memberData,
  tenantName = 'PolanFit Arena',
}: DigitalPassModalProps) {
  const [qrSrc, setQrSrc] = useState<string>('');

  const memberName = memberData
    ? `${memberData.first_name || ''} ${memberData.last_name || ''}`.trim() || memberData.name || 'Member'
    : 'Member';
  const memberUid = memberData?.uuid || memberData?.member_number || 'FC-M-99214A';
  const planName = memberData?.active_plan?.pricing_plan?.name
    || memberData?.activePlan?.pricingPlan?.name
    || memberData?.active_plan?.pricingPlan?.name
    || 'All-Access Membership';
  
  const rawExpiresAt = memberData?.active_plan?.expires_at || memberData?.activePlan?.expires_at;
  const expiresAt = rawExpiresAt ? new Date(rawExpiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Lifetime';
  const isExpired = rawExpiresAt ? new Date(rawExpiresAt).getTime() < Date.now() : false;

  useEffect(() => {
    if (!isOpen) return;

    // Use actual qr_code_token if available, otherwise member UUID
    const payload = memberData?.qr_code_token || memberUid;
    generateQrDataUrl(payload).then(setQrSrc);
  }, [isOpen, memberData, memberUid]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white text-center space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition text-xs"
        >
          ✕
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Gate Ready</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">{tenantName}</h3>
          <p className="text-xs text-gray-400">Digital Gate Pass</p>
        </div>

        {/* High-Contrast Dynamic QR Code Container */}
        <div className="relative p-5 rounded-2xl bg-white max-w-[220px] mx-auto shadow-2xl border-4 border-orange-500/30 overflow-hidden">
          {qrSrc ? (
            <img
              src={qrSrc}
              alt="Gate Pass QR Code"
              className="w-full h-auto object-contain block select-none"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-black text-xs font-mono">
              Generating pass...
            </div>
          )}

          {/* Animated Laser Scanline */}
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-lg shadow-orange-500/50 animate-pulse pointer-events-none" style={{ top: '50%' }}></div>
        </div>

        {/* Member & Pass Information */}
        <div className="p-4 rounded-2xl bg-[#070709] border border-gray-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Member:</span>
            <span className="font-bold text-white truncate max-w-[180px]">{memberName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Pass ID:</span>
            <span className="font-mono font-bold text-orange-400">{memberUid}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Plan:</span>
            <span className="font-bold text-white">{planName}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
            <span className="text-gray-400">Status:</span>
            <span className={`font-mono font-bold ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
              {isExpired ? '● EXPIRED' : `● ACTIVE (exp. ${expiresAt})`}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-gray-400 font-medium space-y-1">
          <p>💡 Hold phone screen 10–15cm from access gate optical scanner.</p>
          <p className="text-gray-500">Auto-refreshes for security on every entry.</p>
        </div>
      </div>
    </div>
  );
}
