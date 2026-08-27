'use client';

import React from 'react';

interface DigitalPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberData?: any;
}

export default function DigitalPassModal({ isOpen, onClose, memberData }: DigitalPassModalProps) {
  if (!isOpen) return null;

  const memberName = memberData?.name || 'Gabriel Omokpoga';
  const memberUid = memberData?.uuid || 'FC-M-99214A';
  const planName = memberData?.active_plan?.pricingPlan?.name || 'VIP Quarterly Pass';
  const expiresAt = memberData?.active_plan?.expires_at ? new Date(memberData.active_plan.expires_at).toLocaleDateString() : '2026-11-30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white text-center space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition text-xs"
        >
          ✕
        </button>

        {/* Card Header */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Digital Gym Pass</span>
          <h3 className="text-xl font-extrabold text-white">PolanFit Entrance Pass</h3>
        </div>

        {/* Simulated Dynamic QR Code */}
        <div className="p-6 rounded-2xl bg-white max-w-[200px] mx-auto shadow-xl">
          <svg viewBox="0 0 100 100" className="w-full h-full text-black">
            <path fill="currentColor" d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 10h20v10H40zM40 40h20v20H40zM70 40h30v10H70zM0 40h30v10H0zM70 70h10v30H70zM90 70h10v10H90zM80 90h20v10H80z" />
          </svg>
        </div>

        {/* Pass Details */}
        <div className="p-4 rounded-2xl bg-[#070709] border border-gray-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Member Name:</span>
            <span className="font-bold text-white">{memberName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Member ID:</span>
            <span className="font-mono font-bold text-orange-400">{memberUid}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Active Subscription:</span>
            <span className="font-bold text-emerald-400">{planName}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
            <span className="text-gray-400">Valid Expiration:</span>
            <span className="font-mono text-gray-300">{expiresAt}</span>
          </div>
        </div>

        <p className="text-[10px] text-gray-500 font-medium">
          Scan this QR code at the entrance kiosk or USB reader to unlock entry gate.
        </p>
      </div>
    </div>
  );
}
