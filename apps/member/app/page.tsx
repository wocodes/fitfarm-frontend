'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

export default function MemberPortalPage() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  // Leaderboard State
  const leaderboardData = [
    { rank: 1, name: 'Kelechi O.', checkIns: 18, points: 180, badge: '🏆 Champion' },
    { rank: 2, name: 'Gabriel O.', checkIns: 15, points: 150, badge: '🥈 2nd Place' },
    { rank: 3, name: 'David A.', checkIns: 12, points: 120, badge: '🥉 3rd Place' },
    { rank: 4, name: 'Sarah P.', checkIns: 9, points: 90, badge: null },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col font-sans">
      {/* Topmost Sticky Header & Active Session Banner */}
      <div className="sticky top-0 z-[10002] w-full">
        {/* Active Session Banner */}
        {isCheckedIn && (
          <div className="bg-[#18181b]/95 backdrop-blur-md border-b border-gray-800 px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="font-semibold text-gray-200">
                Active Session at <span className="text-orange-400 font-bold">PolanFit Arena</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-mono">
                Time Spent: <span className="text-white font-bold">01h 24m</span>
              </span>
              <button
                onClick={() => setIsCheckedIn(false)}
                className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition text-[11px]"
              >
                Check Out
              </button>
            </div>
          </div>
        )}

        {/* Main Navbar */}
        <header className="bg-[#0f0f11]/90 backdrop-blur-md border-b border-gray-800/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-orange-500/20">
              PF
            </div>
            <div>
              <h1 className="font-bold text-white leading-tight text-base">PolanFit Arena</h1>
              <span className="text-xs text-gray-400">Powered by FitCloud SaaS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDashboard(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 font-bold text-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition"
            >
              Member Dashboard
            </button>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 font-semibold text-white text-xs rounded-xl transition"
            >
              Sign In
            </button>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 px-6 max-w-6xl w-full mx-auto text-center space-y-6">
        <div className="inline-block px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider">
          🔥 September 2 Remember Challenge Active
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight max-w-4xl mx-auto">
          Transform Your Fitness Journey at <span className="text-orange-500">PolanFit</span>
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
          Join state-of-the-art workouts, earn points on every check-in, climb the leaderboard, and unlock exclusive rewards.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setShowDashboard(true)}
            className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 font-bold text-black rounded-xl shadow-xl shadow-orange-500/20 text-sm transition"
          >
            Instant QR Check-in
          </button>
          <a
            href="#pricing"
            className="px-6 py-3.5 bg-gray-800 hover:bg-gray-700 font-semibold text-white rounded-xl text-sm transition"
          >
            Explore Membership Plans
          </a>
        </div>
      </section>

      {/* Live Leaderboard Section */}
      <section className="py-12 px-6 max-w-5xl w-full mx-auto">
        <div className="p-8 rounded-3xl bg-[#18181b] border border-gray-800 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <div>
              <h2 className="text-2xl font-bold text-white">🏆 September Challenge Leaderboard</h2>
              <p className="text-xs text-gray-400">Earn 10 points for every verified gym check-in</p>
            </div>
            <span className="text-xs text-orange-400 font-semibold">Updated Real-Time</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {leaderboardData.map((item) => (
              <div
                key={item.rank}
                className={`p-5 rounded-2xl border transition ${
                  item.rank === 1
                    ? 'bg-gradient-to-br from-orange-500/20 to-transparent border-orange-500/50'
                    : 'bg-[#0f0f11] border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-orange-400">Rank #{item.rank}</span>
                  {item.badge && <span className="text-xs font-bold">{item.badge}</span>}
                </div>
                <div className="text-lg font-bold text-white mb-1">{item.name}</div>
                <div className="text-xs text-gray-400">{item.checkIns} check-ins</div>
                <div className="text-sm font-extrabold text-green-400 mt-2">{item.points} Points</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section id="pricing" className="py-12 px-6 max-w-5xl w-full mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Membership Plans</h2>
          <p className="text-sm text-gray-400">Choose a subscription plan tailored to your fitness schedule.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#18181b] border border-gray-800 space-y-4">
            <h3 className="text-xl font-bold text-white">Day Pass</h3>
            <div className="text-3xl font-extrabold text-white">₦2,500 <span className="text-xs text-gray-400 font-normal">/ day</span></div>
            <p className="text-xs text-gray-400">Full access to gym equipment and locker rooms for 24 hours.</p>
            <button className="w-full py-3 bg-gray-800 hover:bg-gray-700 font-bold text-white rounded-xl text-xs transition">
              Get Day Pass
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-orange-500/20 to-[#18181b] border border-orange-500/40 space-y-4 relative">
            <span className="absolute -top-3 right-6 bg-orange-500 text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Best Value
            </span>
            <h3 className="text-xl font-bold text-white">Monthly Standard</h3>
            <div className="text-3xl font-extrabold text-orange-400">₦25,000 <span className="text-xs text-gray-400 font-normal">/ month</span></div>
            <p className="text-xs text-gray-400">Unlimited monthly access, free fitness assessment & leaderboard eligibility.</p>
            <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 font-bold text-black rounded-xl text-xs shadow-lg shadow-orange-500/20 transition">
              Subscribe Monthly
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-[#18181b] border border-gray-800 space-y-4">
            <h3 className="text-xl font-bold text-white">Annual VIP</h3>
            <div className="text-3xl font-extrabold text-white">₦240,000 <span className="text-xs text-gray-400 font-normal">/ year</span></div>
            <p className="text-xs text-gray-400">Full annual membership with 2 months free, personal trainer sessions, & VIP perks.</p>
            <button className="w-full py-3 bg-gray-800 hover:bg-gray-700 font-bold text-white rounded-xl text-xs transition">
              Subscribe Annual
            </button>
          </div>
        </div>
      </section>

      {/* MEMBER DASHBOARD MODAL */}
      {showDashboard && (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-gray-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowDashboard(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-xl font-bold"
            >
              ✕
            </button>

            <div>
              <h2 className="text-2xl font-extrabold text-white">Member Dashboard</h2>
              <p className="text-xs text-gray-400">Welcome back, <span className="text-orange-400 font-semibold">Kelechi O.</span></p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#0f0f11] border border-gray-800">
                <span className="text-xs text-gray-400 font-medium">Active Subscription</span>
                <div className="text-lg font-bold text-green-400 mt-1">Monthly Standard</div>
                <span className="text-[11px] text-gray-500">Expires in 18 days</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0f0f11] border border-gray-800">
                <span className="text-xs text-gray-400 font-medium">Earned Challenge Points</span>
                <div className="text-lg font-bold text-orange-400 mt-1">180 Points</div>
                <span className="text-[11px] text-gray-500">Rank #1 Champion</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-center space-y-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">Your Check-in QR Code</span>
              <div className="w-32 h-32 bg-white text-black mx-auto rounded-xl flex items-center justify-center font-mono font-bold text-xs p-2">
                [QR: FC-M-001]
              </div>
              <p className="text-[11px] text-gray-400">Scan at the front desk turnstile to check in instantly.</p>
            </div>

            <button
              onClick={() => setShowDashboard(false)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 font-bold text-white text-xs rounded-xl transition"
            >
              Close Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-800/80 py-6 px-6 text-center text-xs text-gray-500">
        PolanFit Arena Portal © 2026. Powered by FitCloud SaaS Platform.
      </footer>
    </div>
  );
}
