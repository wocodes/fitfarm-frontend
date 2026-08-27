'use client';

import React, { useState, useEffect } from 'react';
import DigitalPassModal from './components/DigitalPassModal';
import MemberDashboardModal from './components/MemberDashboardModal';
import PlanPurchaseModal from './components/PlanPurchaseModal';
import MemberAuthModals from './components/MemberAuthModals';

export default function MemberPortalPage() {
  const [tenantName, setTenantName] = useState('PolanFit Arena');
  const [tenantInfo, setTenantInfo] = useState<any>(null);

  const [showDashboard, setShowDashboard] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>({
    name: 'Gabriel Omokpoga',
    email: 'gabriel@polanfit.com',
    uuid: 'FC-M-99214A',
  });

  const [isCheckedIn, setIsCheckedIn] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tenant = searchParams.get('tenant');
      if (tenant) {
        setTenantName(tenant.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      fetch(`${apiBase}/member/portal/info?tenant=${tenant || 'polanfit-arena'}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTenantInfo(data.data);
            if (data.data?.tenant?.name) setTenantName(data.data.tenant.name);
          }
        })
        .catch(() => {});
    }
  }, []);

  const leaderboardData = [
    { rank: 1, name: 'Kelechi O.', checkIns: 18, points: 180, badge: '🏆 Champion' },
    { rank: 2, name: 'Gabriel O.', checkIns: 15, points: 150, badge: '🥈 2nd Place' },
    { rank: 3, name: 'David A.', checkIns: 12, points: 120, badge: '🥉 3rd Place' },
    { rank: 4, name: 'Sarah P.', checkIns: 9, points: 90, badge: null },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans">
      {/* Topmost Sticky Header & Active Session Banner */}
      <div className="sticky top-0 z-40 w-full">
        {/* Active Session Banner */}
        {isCheckedIn && (
          <div className="bg-[#121217]/95 backdrop-blur-md border-b border-gray-800 px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-gray-200">
                Active Workout Session at <span className="text-orange-400 font-bold">{tenantName}</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-400 font-mono">
                Time Logged: <span className="text-white font-bold">01h 24m</span>
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
        <header className="bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-gray-800/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-extrabold text-black text-lg shadow-lg shadow-orange-500/20">
              {tenantName.charAt(0)}
            </div>
            <div>
              <h1 className="font-extrabold text-white leading-tight text-base">{tenantName}</h1>
              <span className="text-xs text-orange-400 font-mono">Member Web Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPassModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition"
            >
              📱 Digital Pass
            </button>
            <button
              onClick={() => setShowDashboard(true)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 font-bold text-white text-xs rounded-xl transition"
            >
              My Dashboard
            </button>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 font-semibold text-gray-300 text-xs rounded-xl transition"
            >
              Sign In
            </button>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 px-6 max-w-6xl w-full mx-auto text-center space-y-6">
        <div className="inline-block px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
          🔥 September Fitness Challenge Active
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight max-w-4xl mx-auto">
          Push Beyond Limits at <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">{tenantName}</span>
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
          Scan your digital QR pass at gate entrance, track workout progress, climb gym leaderboards, and renew plans online instantly.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setShowPassModal(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black rounded-xl shadow-xl shadow-orange-500/20 text-sm transition"
          >
            📱 Open Entrance QR Pass
          </button>
          <button
            onClick={() => setShowPlanModal(true)}
            className="px-6 py-3.5 bg-gray-800 hover:bg-gray-700 font-bold text-white rounded-xl text-sm transition"
          >
            💳 Renew Membership Online
          </button>
        </div>
      </section>

      {/* Main Grid: Leaderboard & Membership Plans */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pb-16 space-y-12">
        {/* Workout Leaderboard Widget */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#0f0f13] border border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Gym Rankings</span>
              <h2 className="text-xl font-extrabold text-white">Monthly Workout Leaderboard</h2>
            </div>
            <span className="text-xs text-emerald-400 font-bold font-mono">🏆 100 Points = 1 Free Day</span>
          </div>

          <div className="space-y-3">
            {leaderboardData.map((item) => (
              <div
                key={item.rank}
                className="p-4 rounded-2xl bg-[#070709] border border-gray-800 flex items-center justify-between hover:border-gray-700 transition"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                      item.rank === 1
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                        : item.rank === 2
                        ? 'bg-gray-300 text-black'
                        : item.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    #{item.rank}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{item.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{item.checkIns} Check-ins this month</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-orange-400 font-mono">{item.points} PTS</span>
                  {item.badge && <p className="text-[10px] font-bold text-gray-300 mt-0.5">{item.badge}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gym Membership Plans */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white">Membership Plans & Pricing</h2>
            <p className="text-xs text-gray-400 mt-1">Select a membership tier to join or extend your plan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#0f0f13] border border-gray-800 flex flex-col justify-between hover:border-orange-500/50 transition">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
                  Starter Tier
                </span>
                <h3 className="text-xl font-extrabold text-white mt-3">Starter Monthly</h3>
                <p className="text-xs text-gray-400 mt-1">Full access to equipment & lockers.</p>
                <div className="mt-6">
                  <span className="text-3xl font-black text-white">₦25,000</span>
                  <span className="text-xs text-gray-400"> / 30 days</span>
                </div>
              </div>

              <button
                onClick={() => setShowPlanModal(true)}
                className="w-full mt-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20"
              >
                Choose Plan
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-[#0f0f13] border-2 border-orange-500 flex flex-col justify-between relative shadow-2xl">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-black font-extrabold text-[10px] uppercase tracking-widest shadow-md">
                Most Popular
              </span>

              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400">
                  VIP Tier
                </span>
                <h3 className="text-xl font-extrabold text-white mt-3">VIP Quarterly</h3>
                <p className="text-xs text-gray-400 mt-1">Gym access, trainer consult & sauna.</p>
                <div className="mt-6">
                  <span className="text-3xl font-black text-white">₦65,000</span>
                  <span className="text-xs text-gray-400"> / 90 days</span>
                </div>
              </div>

              <button
                onClick={() => setShowPlanModal(true)}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20"
              >
                Choose Plan
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-[#0f0f13] border border-gray-800 flex flex-col justify-between hover:border-orange-500/50 transition">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
                  Annual Tier
                </span>
                <h3 className="text-xl font-extrabold text-white mt-3">Annual All-Access</h3>
                <p className="text-xs text-gray-400 mt-1">Unlimited 365-day access & VIP perks.</p>
                <div className="mt-6">
                  <span className="text-3xl font-black text-white">₦220,000</span>
                  <span className="text-xs text-gray-400"> / 365 days</span>
                </div>
              </div>

              <button
                onClick={() => setShowPlanModal(true)}
                className="w-full mt-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 font-extrabold text-white text-xs transition"
              >
                Choose Plan
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800/80 text-center text-xs text-gray-500">
        <p>© 2026 {tenantName}. Powered by FitCloud SaaS Management System.</p>
      </footer>

      {/* Modals */}
      <DigitalPassModal
        isOpen={showPassModal}
        onClose={() => setShowPassModal(false)}
        memberData={currentUser}
      />

      <MemberDashboardModal
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
        onOpenPass={() => setShowPassModal(true)}
        onOpenRenew={() => setShowPlanModal(true)}
      />

      <PlanPurchaseModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        plans={tenantInfo?.pricing_plans}
      />

      <MemberAuthModals
        isLoginOpen={showLoginModal}
        isRegisterOpen={showRegisterModal}
        onCloseLogin={() => setShowLoginModal(false)}
        onCloseRegister={() => setShowRegisterModal(false)}
        onSwitchToRegister={() => setShowRegisterModal(true)}
        onSwitchToLogin={() => setShowLoginModal(true)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
