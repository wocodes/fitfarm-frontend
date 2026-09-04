'use client';

import React from 'react';

interface MemberDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPass: () => void;
  onOpenRenew: () => void;
  onLogout?: () => void;
  currentUser?: any;
  tenantName?: string;
}

export default function MemberDashboardModal({
  isOpen,
  onClose,
  onOpenPass,
  onOpenRenew,
  onLogout,
  currentUser,
  tenantName = 'PolanFit Arena',
}: MemberDashboardModalProps) {
  if (!isOpen) return null;

  const firstName = currentUser?.first_name || '';
  const lastName = currentUser?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || currentUser?.name || 'Member';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'M';
  const memberUid = currentUser?.uuid || currentUser?.member_number || 'FC-M-99214A';
  const email = currentUser?.email || 'member@polanfit.com';

  const activePlan = currentUser?.active_plan || currentUser?.activePlan;
  const planName = activePlan?.pricing_plan?.name || activePlan?.pricingPlan?.name || 'Standard Access';
  const expiresAt = activePlan?.expires_at ? new Date(activePlan.expires_at) : null;
  const startsAt = activePlan?.starts_at ? new Date(activePlan.starts_at) : null;

  const now = new Date();
  const isPlanActive = expiresAt && expiresAt.getTime() > now.getTime();
  const daysRemaining = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  let progressPercent = 0;
  if (startsAt && expiresAt) {
    const totalDuration = expiresAt.getTime() - startsAt.getTime();
    const elapsed = now.getTime() - startsAt.getTime();
    if (totalDuration > 0) {
      progressPercent = Math.min(100, Math.max(0, Math.round((1 - elapsed / totalDuration) * 100)));
    }
  }

  const checkIns = currentUser?.check_in_history || [];

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-black text-xl shadow-lg">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">{fullName}</h2>
              <p className="text-xs text-gray-400 font-mono">
                {email} • ID: <span className="text-orange-400">{memberUid}</span>
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs transition self-start sm:self-auto"
            >
              🚪 Sign Out
            </button>
          )}
        </div>

        {/* Active Plan Progress Card */}
        <div className="p-6 rounded-2xl bg-[#070709] border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Current Subscription</span>
              <h3 className="text-lg font-extrabold text-white">{isPlanActive ? planName : 'No Active Subscription'}</h3>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
              isPlanActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {isPlanActive ? `● Active (${daysRemaining} Days Left)` : '● Inactive / Expired'}
            </span>
          </div>

          {/* Progress Bar */}
          {isPlanActive && (
            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>Start: {startsAt?.toLocaleDateString()}</span>
                <span>Expires: {expiresAt?.toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenPass();
              }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5"
            >
              <span>📱</span>
              <span>Open Digital Gate Pass</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenRenew();
              }}
              className="py-2.5 px-5 rounded-xl bg-gray-800 hover:bg-gray-700 font-bold text-white text-xs transition flex items-center justify-center gap-1.5"
            >
              <span>💳</span>
              <span>Renew / Upgrade Online</span>
            </button>
          </div>
        </div>

        {/* Recent Check-Ins Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white">Recent Turnstile Check-Ins</h4>
            <span className="text-[11px] text-gray-500 font-mono">Real-time Telemetry</span>
          </div>

          <div className="space-y-2 text-xs">
            {checkIns.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#070709] border border-gray-800 text-center text-gray-500 italic">
                No check-in logs recorded yet. Scan your pass at the gym entrance to log a workout.
              </div>
            ) : (
              checkIns.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[#070709] border border-gray-800 flex items-center justify-between hover:border-gray-700 transition"
                >
                  <div>
                    <p className="font-bold text-white">
                      Workout Session
                      {log.is_active_session && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          CURRENTLY IN GYM
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {new Date(log.check_in_time).toLocaleString()} • Method: {log.method ? log.method.toUpperCase() : 'QR PASS'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    GRANTED
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
