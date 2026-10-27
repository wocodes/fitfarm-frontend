'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';

interface LeaderboardItem {
  rank: number;
  memberId: number;
  memberUid: string;
  fullName: string;
  checkInCount: number;
  points: number;
  email: string;
}

export default function CampaignSettingsPage() {
  const [campaignTitle, setCampaignTitle] = useState('September 2 Remember Challenge');
  const [pointsPerCheckIn, setPointsPerCheckIn] = useState<number>(10);
  const [status, setStatus] = useState<string>('ACTIVE');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/campaigns/active/leaderboard');
      if (res.success && res.data) {
        const camp = res.data.campaign;
        if (camp) {
          setCampaignTitle(camp.campaignTitle || camp.name || 'September 2 Remember Challenge');
          setPointsPerCheckIn(camp.pointsPerCheckIn || 10);
          setStatus(camp.status || 'ACTIVE');
          if (camp.startDate) setStartDate(new Date(camp.startDate).toISOString().slice(0, 10));
          if (camp.endDate) setEndDate(new Date(camp.endDate).toISOString().slice(0, 10));
        }

        if (Array.isArray(res.data.top10)) {
          setLeaderboard(res.data.top10);
        }
      }
    } catch (err: any) {
      console.error('Failed to load campaign leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const res = await apiFetch('/admin/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title: campaignTitle,
          name: campaignTitle,
          pointsPerCheckIn,
          points_per_checkin: pointsPerCheckIn,
          status,
          is_active: status === 'ACTIVE',
          startDate: startDate ? `${startDate}T00:00:00Z` : null,
          endDate: endDate ? `${endDate}T23:59:59Z` : null,
        }),
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        loadLeaderboard();
      } else {
        setErrorMessage(res.message || 'Failed to update campaign settings.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#060608] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Promotional Campaigns & Leaderboard"
          subtitle="Configure gym-wide challenge events, points rules, and view live member standings"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-10 pb-24 lg:pb-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Top Quick Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0d0d12] border border-gray-800">
            <div>
              <h2 className="text-base font-extrabold text-white">Promotional Email Campaigns</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Broadcast marketing email blasts, discount vouchers, and announcement newsletters to gym members.
              </p>
            </div>

            <Link
              href="/campaigns/email-blast"
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs tracking-wide shadow-lg shadow-orange-500/20 transition flex items-center gap-2"
            >
              <span>📧 Launch Email Blast</span>
              <span className="text-orange-200">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Campaign Configuration Form */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-[#0d0d12] border border-gray-800 space-y-6 shadow-xl h-fit">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Campaign Rules</h3>
                  <p className="text-xs text-gray-400">Configure active challenge settings</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                  }`}
                >
                  {status}
                </span>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  ✓ Campaign settings saved successfully!
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060608] border border-gray-800 text-white font-medium outline-none focus:border-orange-500 transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#060608] border border-gray-800 text-white outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#060608] border border-gray-800 text-white outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Points Awarded per Check-in
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pointsPerCheckIn}
                    onChange={(e) => setPointsPerCheckIn(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060608] border border-gray-800 text-white font-medium outline-none focus:border-orange-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Campaign Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060608] border border-gray-800 text-white font-medium outline-none focus:border-orange-500 transition"
                  >
                    <option value="ACTIVE">ACTIVE (Counting Check-ins)</option>
                    <option value="PAUSED">PAUSED (Hold Standings)</option>
                    <option value="ENDED">ENDED (Finalized)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs tracking-wider uppercase transition shadow-md shadow-orange-500/20"
                >
                  {saving ? 'Saving...' : '💾 Save Campaign Settings'}
                </button>
              </form>
            </div>

            {/* Right Col: Live Standings Leaderboard Table */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0d0d12] border border-gray-800 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">🏆 Live Leaderboard Top 10</h3>
                  <p className="text-xs text-gray-400">Ranked by total check-in count during campaign window</p>
                </div>
                <button
                  onClick={loadLeaderboard}
                  className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-semibold"
                >
                  🔄 Refresh
                </button>
              </div>

              {loading ? (
                <div className="py-16 text-center text-xs text-gray-400">Loading standings...</div>
              ) : leaderboard.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <p className="text-sm font-bold text-gray-400">No member check-ins recorded yet</p>
                  <p className="text-xs text-gray-500">Check-ins logged during campaign dates will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 font-bold">Rank</th>
                        <th className="py-3 px-4 font-bold">Member Name</th>
                        <th className="py-3 px-4 font-bold">Check-ins</th>
                        <th className="py-3 px-4 font-bold">Points Earned</th>
                        <th className="py-3 px-4 font-bold text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 font-medium">
                      {leaderboard.map((item) => (
                        <tr key={item.rank} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 px-4 font-black text-sm">
                            {item.rank === 1 ? (
                              <span className="text-amber-400">🥇 #1</span>
                            ) : item.rank === 2 ? (
                              <span className="text-gray-300">🥈 #2</span>
                            ) : item.rank === 3 ? (
                              <span className="text-amber-600">🥉 #3</span>
                            ) : (
                              <span className="text-gray-500">#{item.rank}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            <div>{item.fullName}</div>
                            {item.email && <div className="text-[10px] text-gray-400 font-normal">{item.email}</div>}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                            {item.checkInCount} visits
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                            {item.points} pts
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {item.email ? (
                              <Link
                                href={`/campaigns/email-blast?to=${encodeURIComponent(item.email)}&subject=${encodeURIComponent(`Congratulations ${item.fullName} on Rank #${item.rank}!`)}`}
                                className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white border border-orange-500/40 text-[10px] font-bold transition inline-block"
                              >
                                ✉️ Email Reward
                              </Link>
                            ) : (
                              <span className="text-gray-600 text-[10px]">No email</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
