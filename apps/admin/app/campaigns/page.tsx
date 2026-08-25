'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CampaignSettingsPage() {
  const [campaignName, setCampaignName] = useState('September 2 Remember Challenge');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [pointsPerCheckIn, setPointsPerCheckIn] = useState(10);
  const [isActive, setIsActive] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const leaderboardStandings = [
    { rank: 1, memberId: 1, memberUid: 'fc-m-001', fullName: 'Kelechi O.', checkInCount: 18, points: 180, email: 'kelechi@gmail.com' },
    { rank: 2, memberId: 2, memberUid: 'fc-m-002', fullName: 'Gabriel O.', checkInCount: 15, points: 150, email: 'gabriel@gmail.com' },
    { rank: 3, memberId: 3, memberUid: 'fc-m-003', fullName: 'David A.', checkInCount: 12, points: 120, email: 'david@gmail.com' },
  ];

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#18181b]/90 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-black text-lg">
            FC
          </Link>
          <div>
            <h1 className="font-bold text-white leading-tight text-base">Campaign & Leaderboard Settings</h1>
            <span className="text-xs text-gray-400">PolanFit Arena • Gym Admin Center</span>
          </div>
        </div>

        <Link href="/" className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition">
          ← Dashboard
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Campaign Settings Form */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#18181b] border border-gray-800 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <div>
              <h2 className="text-xl font-bold text-white">Active Promotional Campaign</h2>
              <p className="text-xs text-gray-400">Set start and end date bounds for leaderboard check-in counting.</p>
            </div>

            {saveSuccess && (
              <span className="text-xs font-bold text-green-400 bg-green-500/20 px-3 py-1.5 rounded-xl">
                ✓ Campaign settings saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCampaign} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Campaign Title</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Start Date Selector</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">End Date Selector</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Points per Check-in</label>
                <input
                  type="number"
                  value={pointsPerCheckIn}
                  onChange={(e) => setPointsPerCheckIn(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="activeToggle"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0f0f11] border-gray-700 text-orange-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="activeToggle" className="text-xs text-white font-medium cursor-pointer">
                Campaign is active (Check-ins during date bounds award points)
              </label>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 font-bold text-black rounded-xl text-xs shadow-lg shadow-orange-500/20 transition"
            >
              Save Campaign Settings
            </button>
          </form>
        </div>

        {/* Live Leaderboard Standings Table */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#18181b] border border-gray-800 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <div>
              <h2 className="text-lg font-bold text-white">Live Leaderboard Rankings</h2>
              <p className="text-xs text-gray-400">Restricted to check-ins between <span className="text-orange-400 font-mono">{startDate}</span> and <span className="text-orange-400 font-mono">{endDate}</span></p>
            </div>

            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
              {pointsPerCheckIn} Points / Check-in
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Member Display Name</th>
                  <th className="py-3 px-4">Verified Check-ins</th>
                  <th className="py-3 px-4">Awarded Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {leaderboardStandings.map((item) => (
                  <tr key={item.rank} className="hover:bg-gray-800/30 transition">
                    <td className="py-3.5 px-4 font-extrabold text-orange-400">
                      {item.rank === 1 ? '🥇 #1' : item.rank === 2 ? '🥈 #2' : item.rank === 3 ? '🥉 #3' : `#${item.rank}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/members/profile?uid=${item.memberUid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-white hover:text-orange-400 transition inline-flex items-center gap-1.5"
                        title="View Member Profile in new tab"
                      >
                        <span>{item.fullName}</span>
                        <span className="text-xs text-gray-500 font-normal">↗</span>
                      </Link>
                      {item.email && <div className="text-xs text-gray-500">{item.email}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-300">{item.checkInCount} check-ins</td>
                    <td className="py-3.5 px-4 font-bold text-green-400">{item.points} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
