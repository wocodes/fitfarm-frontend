'use client';

import React, { useState, useEffect } from 'react';
import { memberApiFetch } from '../lib/api';

interface MemberDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPass: () => void;
  onOpenRenew: () => void;
  onLogout?: () => void;
  currentUser?: any;
  tenantName?: string;
  leaderboardStandings?: any[];
  leaderboardCampaign?: any;
}

export default function MemberDashboardModal({
  isOpen,
  onClose,
  onOpenPass,
  onOpenRenew,
  onLogout,
  currentUser,
  tenantName = 'Your Gym',
  leaderboardStandings: initialStandings,
  leaderboardCampaign: initialCampaign,
}: MemberDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'leaderboard'>('activity');
  const [standings, setStandings] = useState<any[]>(initialStandings || []);
  const [campaign, setCampaign] = useState<any>(initialCampaign || null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    if (initialStandings && initialStandings.length > 0) {
      setStandings(initialStandings);
    }
    if (initialCampaign) {
      setCampaign(initialCampaign);
    }
  }, [initialStandings, initialCampaign]);

  useEffect(() => {
    if (isOpen && activeTab === 'leaderboard' && standings.length === 0) {
      setLoadingLeaderboard(true);
      memberApiFetch('/campaigns/leaderboard')
        .then((res) => {
          if (res.success && res.data) {
            setStandings(res.data.standings || []);
            setCampaign(res.data.campaign || null);
          }
        })
        .catch((err) => console.error('Error fetching leaderboard:', err))
        .finally(() => setLoadingLeaderboard(false));
    }
  }, [isOpen, activeTab, standings.length]);

  if (!isOpen) return null;

  const firstName = currentUser?.first_name || '';
  const lastName = currentUser?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || currentUser?.name || 'Member';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'M';
  const memberUid = currentUser?.uuid || currentUser?.member_number || 'FC-M-99214A';
  const email = currentUser?.email || 'member@example.com';

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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <span>🏋️</span>
            <span>My Workout Activity</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <span>🏆</span>
            <span>Workout Leaderboard & Rewards</span>
          </button>
        </div>

        {/* Tab 1: Activity & Subscription */}
        {activeTab === 'activity' && (
          <div className="space-y-6 animate-fadeIn">
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
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5"
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
                <h4 className="text-sm font-extrabold text-white">Recent Access Gate Check-Ins</h4>
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
        )}

        {/* Tab 2: Monthly Leaderboard & Rewards */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Active Challenge</span>
                <h3 className="text-base font-extrabold text-white">{campaign?.title || 'September Workout Sprint'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{campaign?.subtitle || 'Rank in the top 3 by check-ins to win free membership extensions.'}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
                  🏆 {campaign?.points_per_checkin || 10} PTS / Check-in
                </span>
                {campaign?.prize_description && (
                  <p className="text-[10px] text-amber-400 font-semibold mt-1">🎁 {campaign.prize_description}</p>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {loadingLeaderboard ? (
                <div className="p-8 text-center text-gray-400 text-xs">Loading gym leaderboard standings...</div>
              ) : standings.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#070709] border border-gray-800 text-center text-gray-500 italic text-xs">
                  No check-in standings recorded yet for this month. Scan in at the gate access gate to take the #1 spot!
                </div>
              ) : (
                standings.map((item, index) => {
                  const rank = item.rank || index + 1;
                  const isCurrentMember = currentUser?.id === item.memberId || currentUser?.uuid === item.memberUid;

                  return (
                    <div
                      key={item.memberId || index}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                        isCurrentMember
                          ? 'bg-orange-500/10 border-orange-500/60 shadow-lg shadow-orange-500/10'
                          : 'bg-[#070709] border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            rank === 1
                              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                              : rank === 2
                              ? 'bg-gray-300 text-black'
                              : rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          #{rank}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                            <span>{item.fullName}</span>
                            {isCurrentMember && (
                              <span className="px-2 py-0.5 rounded-full bg-orange-500 text-black font-extrabold text-[9px] uppercase">
                                You
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-gray-400 font-mono">
                            {item.checkInCount} Check-in{item.checkInCount !== 1 ? 's' : ''} this month
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-orange-400 font-mono">{item.points} PTS</span>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {rank === 1 ? '🥇 Champion' : rank === 2 ? '🥈 2nd Place' : rank === 3 ? '🥉 3rd Place' : `Rank #${rank}`}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
