'use client';

import React from 'react';

interface MemberDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPass: () => void;
  onOpenRenew: () => void;
}

export default function MemberDashboardModal({
  isOpen,
  onClose,
  onOpenPass,
  onOpenRenew,
}: MemberDashboardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#121217] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition text-xs"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-extrabold text-xl shadow-lg">
            GO
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Gabriel Omokpoga</h2>
            <p className="text-xs text-gray-400 font-mono">Member ID: FC-M-99214A • PolanFit Arena</p>
          </div>
        </div>

        {/* Active Plan Progress Card */}
        <div className="p-6 rounded-2xl bg-[#070709] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Current Subscription</span>
              <h3 className="text-lg font-extrabold text-white">VIP Quarterly Pass</h3>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase">
              ● Active (82 Days Left)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>Start: Jun 01, 2026</span>
              <span>Expires: Nov 30, 2026</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenPass();
              }}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20"
            >
              📱 Show Digital Entrance Pass
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenRenew();
              }}
              className="py-2.5 px-5 rounded-xl bg-gray-800 hover:bg-gray-700 font-bold text-white text-xs transition"
            >
              💳 Renew / Upgrade Online
            </button>
          </div>
        </div>

        {/* Recent Check-Ins Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-white">Recent Entrance History</h4>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#070709] border border-gray-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Today's Workout Session</p>
                <p className="text-[10px] text-gray-400">10:45 AM • Fingerprint Reader Gate A</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Passed</span>
            </div>

            <div className="p-3 rounded-xl bg-[#070709] border border-gray-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Evening Cardio Session</p>
                <p className="text-[10px] text-gray-400">Aug 25, 2026 • QR Code Scanner</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Passed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
