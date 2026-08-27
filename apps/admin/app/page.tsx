'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    total_members: 42,
    active_members: 38,
    check_ins_today: 14,
    active_sessions_now: 5,
    revenue_today: 148500,
  });

  const [leaderboard, setLeaderboard] = useState<any[]>([
    { rank: 1, memberId: 1, memberUid: 'fc-m-001', fullName: 'Kelechi O.', checkInCount: 18, points: 180, email: 'kelechi@gmail.com' },
    { rank: 2, memberId: 2, memberUid: 'fc-m-002', fullName: 'Gabriel O.', checkInCount: 15, points: 150, email: 'gabriel@gmail.com' },
    { rank: 3, memberId: 3, memberUid: 'fc-m-003', fullName: 'David A.', checkInCount: 12, points: 120, email: 'david@gmail.com' },
    { rank: 4, memberId: 4, memberUid: 'fc-m-004', fullName: 'Sarah P.', checkInCount: 9, points: 90, email: 'sarah@gmail.com' },
  ]);

  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([
    { id: 1, name: 'Kelechi O.', time: '10:45 AM', method: 'QR Code', status: 'Active' },
    { id: 2, name: 'Gabriel O.', time: '09:30 AM', method: 'Fingerprint', status: 'Active' },
    { id: 3, name: 'David A.', time: '08:15 AM', method: 'Manual', status: 'Completed' },
  ]);

  const [checkInName, setCheckInName] = useState('');

  const handleSimulateCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInName.trim()) return;

    const newLog = {
      id: Date.now(),
      name: checkInName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      method: 'Manual',
      status: 'Active',
    };

    setRecentCheckIns([newLog, ...recentCheckIns]);
    setStats((prev: any) => ({
      ...prev,
      check_ins_today: prev.check_ins_today + 1,
      active_sessions_now: prev.active_sessions_now + 1,
    }));
    setCheckInName('');
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Dashboard Overview" subtitle="Real-time gym performance, active sessions, and attendance metrics" />

        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl">
        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#18181b] border border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Members</span>
            <div className="text-3xl font-extrabold text-white mt-1">{stats.total_members}</div>
            <span className="text-xs text-green-400 mt-2 block font-medium">↑ 12% this month</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#18181b] border border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Subscriptions</span>
            <div className="text-3xl font-extrabold text-orange-400 mt-1">{stats.active_members}</div>
            <span className="text-xs text-gray-400 mt-2 block">90.4% renewal rate</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#18181b] border border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Check-ins Today</span>
            <div className="text-3xl font-extrabold text-blue-400 mt-1">{stats.check_ins_today}</div>
            <span className="text-xs text-gray-400 mt-2 block">Peak time: 08:00 - 10:00 AM</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#18181b] border border-gray-800">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today's Revenue</span>
            <div className="text-3xl font-extrabold text-green-400 mt-1">₦{stats.revenue_today.toLocaleString()}</div>
            <span className="text-xs text-gray-500 mt-2 block font-mono">1% FitCloud fee split active</span>
          </div>
        </div>

        {/* Live Desk & Leaderboard Split Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Live Desk Check-in Feed & Quick Check-in */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl bg-[#18181b] border border-gray-800 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center justify-between">
                <span>Front Desk Check-in</span>
                <span className="text-xs font-mono text-orange-400">Live API</span>
              </h2>

              <form onSubmit={handleSimulateCheckIn} className="flex gap-2">
                <input
                  type="text"
                  value={checkInName}
                  onChange={(e) => setCheckInName(e.target.value)}
                  placeholder="Enter Member Name or Code..."
                  className="flex-1 px-3.5 py-2.5 bg-[#0f0f11] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 font-bold text-black text-sm rounded-xl transition"
                >
                  Check In
                </button>
              </form>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Recent Desk Logs</span>
                {recentCheckIns.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-[#0f0f11] border border-gray-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{log.name}</div>
                      <div className="text-xs text-gray-500">{log.time} • {log.method}</div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Campaign Leaderboard Table */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#18181b] border border-gray-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-white">🏆 Live Leaderboard Standings</h2>
                <p className="text-xs text-gray-400">Current Campaign: <span className="text-orange-400 font-medium">September 2 Remember Challenge</span></p>
              </div>
              <span className="text-xs bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1 rounded-full font-semibold">
                10 Points / Check-in
              </span>
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Check-ins</th>
                    <th className="py-3 px-4">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {leaderboard.map((item) => (
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
                          title="Open Member Profile in new tab"
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
        </div>
      </main>
      </div>
    </div>
  );
}
