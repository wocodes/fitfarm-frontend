'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DigitalPassModal from './components/DigitalPassModal';
import MemberDashboardModal from './components/MemberDashboardModal';
import PlanPurchaseModal from './components/PlanPurchaseModal';
import MemberAuthModals from './components/MemberAuthModals';
import { memberApiFetch, getMemberToken, clearMemberToken, getStoredMember } from './lib/api';

export default function MemberPortalPage() {
  const [tenantName, setTenantName] = useState('PolanFit Arena');
  const [tenantSlug, setTenantSlug] = useState('polanfit-fitness');
  const [tenantInfo, setTenantInfo] = useState<any>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [workoutElapsed, setWorkoutElapsed] = useState('00h 00m 00s');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [leaderboardStandings, setLeaderboardStandings] = useState<any[]>([]);
  const [leaderboardCampaign, setLeaderboardCampaign] = useState<any>(null);

  const [showDashboard, setShowDashboard] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<number | null>(null);
  const [notificationMsg, setNotificationMsg] = useState('');

  // 1. Fetch Tenant Public Info & Active Plans
  const fetchTenantData = useCallback(async (slug: string) => {
    try {
      const res = await memberApiFetch(`/member/portal/info?tenant=${slug}`);
      if (res.success && res.data) {
        setTenantInfo(res.data);
        if (res.data.tenant?.name) setTenantName(res.data.tenant.name);
        if (res.data.pricing_plans && Array.isArray(res.data.pricing_plans)) {
          setPricingPlans(res.data.pricing_plans);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tenant info:', err);
    }
  }, []);

  // 2. Fetch Leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await memberApiFetch('/campaigns/leaderboard');
      if (res.success && res.data) {
        setLeaderboardStandings(res.data.standings || []);
        setLeaderboardCampaign(res.data.campaign || null);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  }, []);

  // 3. Fetch Authenticated Member Profile & Active Session
  const fetchMemberProfile = useCallback(async () => {
    const token = getMemberToken();
    if (!token) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActiveSession(null);
      return;
    }

    try {
      const profileRes = await memberApiFetch('/member/profile');
      if (profileRes.success && profileRes.data) {
        const fullMember = {
          ...profileRes.data.member,
          active_plan: profileRes.data.active_plan,
          qr_code_token: profileRes.data.qr_code_token,
          check_in_history: profileRes.data.check_in_history || [],
        };
        setCurrentUser(fullMember);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      clearMemberToken();
      setIsAuthenticated(false);
      setCurrentUser(null);
    }

    // Check active workout session
    try {
      const sessionRes = await memberApiFetch('/member/active-session');
      if (sessionRes.success && sessionRes.data) {
        if (sessionRes.data.isCheckedIn && sessionRes.data.session) {
          setActiveSession(sessionRes.data.session);
        } else {
          setActiveSession(null);
        }
      }
    } catch {
      setActiveSession(null);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    let slug = 'polanfit-fitness';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlSlug = params.get('tenant');
      if (urlSlug) {
        slug = urlSlug;
        setTenantSlug(urlSlug);
      }
    }

    fetchTenantData(slug);
    fetchLeaderboard();
    fetchMemberProfile();
  }, [fetchTenantData, fetchLeaderboard, fetchMemberProfile]);

  // Live Workout Timer
  useEffect(() => {
    if (!activeSession || !activeSession.check_in_time) {
      setWorkoutElapsed('00h 00m 00s');
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(activeSession.check_in_time).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));

      const h = Math.floor(diffSec / 3600);
      const m = Math.floor((diffSec % 3600) / 60);
      const s = diffSec % 60;

      const formatted = `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
      setWorkoutElapsed(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Member Checkout Handler
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await memberApiFetch('/member/checkout', {
        method: 'POST',
      });
      if (res.success) {
        setActiveSession(null);
        setNotificationMsg(`🎉 ${res.message || 'Checked out successfully!'}`);
        setTimeout(() => setNotificationMsg(''), 5000);
        fetchMemberProfile();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to check out');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    clearMemberToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveSession(null);
    setNotificationMsg('ℹ️ Signed out from member portal.');
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  // Plan Selection Handler
  const handlePlanSelect = (planId: number) => {
    setSelectedPlanForPurchase(planId);
    if (!isAuthenticated) {
      setNotificationMsg('💡 Please sign in or register an account to renew or purchase a membership.');
      setTimeout(() => setNotificationMsg(''), 5000);
      setShowLoginModal(true);
    } else {
      setShowPlanModal(true);
    }
  };

  const currencySymbol = tenantInfo?.tenant?.currency === 'USD' ? '$' : '₦';

  // Default fallback plans if tenant has not configured custom plans yet
  const displayPlans = pricingPlans.length > 0 ? pricingPlans : [
    { id: 1, name: 'Starter Monthly', price: 25000, duration_days: 30, description: 'Full access to gym equipment & locker room.' },
    { id: 2, name: 'VIP Quarterly', price: 65000, duration_days: 90, description: 'Gym access, personal trainer consult & sauna.' },
    { id: 3, name: 'Annual All-Access', price: 220000, duration_days: 365, description: 'Unlimited 365-day access & VIP amenities.' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans">
      {/* Top Sticky Header & Active Session Banner */}
      <div className="sticky top-0 z-40 w-full">
        {/* Active Workout Session Banner */}
        {activeSession && (
          <div className="bg-[#121217]/95 backdrop-blur-md border-b border-emerald-500/30 px-6 py-2.5 flex items-center justify-between text-xs animate-fadeIn">
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
                Workout Timer: <span className="text-emerald-400 font-bold">{workoutElapsed}</span>
              </span>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-lg transition text-[11px] border border-red-500/30 disabled:opacity-50"
              >
                {isCheckingOut ? 'Checking Out...' : 'Check Out Now'}
              </button>
            </div>
          </div>
        )}

        {/* Global Toast Notification */}
        {notificationMsg && (
          <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-b border-orange-500/30 text-orange-400 px-6 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span>{notificationMsg}</span>
            <button onClick={() => setNotificationMsg('')} className="text-orange-400 hover:text-white font-mono">✕</button>
          </div>
        )}

        {/* Main Navbar */}
        <header className="bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-gray-800/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-orange-500/20">
              {tenantName.charAt(0)}
            </div>
            <div>
              <h1 className="font-extrabold text-white leading-tight text-base">{tenantName}</h1>
              <span className="text-xs text-orange-400 font-mono">Member Web Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowPassModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center gap-1.5"
                >
                  <span>📱</span>
                  <span>Digital Pass</span>
                </button>
                <button
                  onClick={() => setShowDashboard(true)}
                  className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 font-bold text-white text-xs rounded-xl transition"
                >
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs rounded-xl transition"
                  title="Sign Out"
                >
                  🚪
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 font-bold text-gray-200 text-xs rounded-xl transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition"
                >
                  Join Gym
                </button>
              </>
            )}
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 px-6 max-w-6xl w-full mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
          <span>🔥</span>
          <span>{leaderboardCampaign?.title || 'Active Fitness Challenge'}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight max-w-4xl mx-auto">
          Push Beyond Limits at{' '}
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            {tenantName}
          </span>
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
          Scan your digital QR pass at gate turnstiles, track live workout sessions, climb gym leaderboards, and renew plans online instantly.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setShowPassModal(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black rounded-xl shadow-xl shadow-orange-500/20 text-sm transition flex items-center gap-2"
              >
                <span>📱</span>
                <span>Open Entrance QR Pass</span>
              </button>
              <button
                onClick={() => setShowPlanModal(true)}
                className="px-6 py-3.5 bg-gray-800 hover:bg-gray-700 font-bold text-white rounded-xl text-sm transition flex items-center gap-2"
              >
                <span>💳</span>
                <span>Renew Membership Online</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black rounded-xl shadow-xl shadow-orange-500/20 text-sm transition flex items-center gap-2"
              >
                <span>🚀</span>
                <span>Register & Get Digital Pass</span>
              </button>
              <a
                href="#pricing"
                className="px-6 py-3.5 bg-gray-800 hover:bg-gray-700 font-bold text-white rounded-xl text-sm transition flex items-center gap-2"
              >
                <span>💳</span>
                <span>View Membership Plans</span>
              </a>
            </>
          )}
        </div>
      </section>

      {/* Main Grid: Telemetry Features & Real Leaderboard */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pb-16 space-y-12">
        {/* Workout Leaderboard Widget */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#0f0f13] border border-gray-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Gym Rankings</span>
              <h2 className="text-xl font-extrabold text-white">Monthly Workout Leaderboard</h2>
            </div>
            <span className="text-xs text-emerald-400 font-bold font-mono">
              🏆 {leaderboardCampaign?.points_per_checkin || 10} Points Per Check-in
            </span>
          </div>

          <div className="space-y-3">
            {leaderboardStandings.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#070709] border border-gray-800 text-center text-gray-500 italic text-sm">
                No check-in standings recorded for this cycle yet. Be the first to scan in and top the leaderboard!
              </div>
            ) : (
              leaderboardStandings.slice(0, 5).map((item, index) => {
                const rank = item.rank || index + 1;
                return (
                  <div
                    key={item.memberId || index}
                    className="p-4 rounded-2xl bg-[#070709] border border-gray-800 flex items-center justify-between hover:border-gray-700 transition"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
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
                        <h3 className="font-extrabold text-sm text-white">{item.fullName}</h3>
                        <p className="text-xs text-gray-400 font-mono">
                          {item.checkInCount} Check-in{item.checkInCount !== 1 ? 's' : ''} this month
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-orange-400 font-mono">{item.points} PTS</span>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                        {rank === 1 ? '🥇 Top Performer' : rank === 2 ? '🥈 2nd Place' : rank === 3 ? '🥉 3rd Place' : 'Top 10'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic Gym Membership Plans */}
        <div id="pricing" className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white">Membership Plans & Pricing</h2>
            <p className="text-xs text-gray-400 mt-1">Select a membership tier to join or extend your plan instantly online.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayPlans.map((plan, index) => {
              const price = Number(plan.price || plan.subscription_fee || 0);
              const duration = plan.duration_days ? `${plan.duration_days} days` : plan.duration || '30 days';
              const isPopular = index === 1 || plan.is_featured;

              return (
                <div
                  key={plan.id}
                  className={`p-6 rounded-3xl bg-[#0f0f13] flex flex-col justify-between transition relative ${
                    isPopular
                      ? 'border-2 border-orange-500 shadow-2xl shadow-orange-500/10'
                      : 'border border-gray-800 hover:border-orange-500/50'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-black font-extrabold text-[10px] uppercase tracking-widest shadow-md">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
                      Tier {index + 1}
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-3">{plan.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{plan.description || `Full access to gym facilities for ${duration}.`}</p>
                    
                    <div className="mt-6">
                      <span className="text-3xl font-black text-white">{currencySymbol}{price.toLocaleString()}</span>
                      <span className="text-xs text-gray-400"> / {duration}</span>
                    </div>

                    <ul className="mt-6 space-y-2 text-xs text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400">✔</span>
                        <span>Digital Turnstile QR Pass included</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400">✔</span>
                        <span>Locker Room & Shower Access</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-emerald-400">✔</span>
                        <span>Workout Telemetry & Leaderboard Points</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full mt-6 py-3 rounded-xl font-extrabold text-xs transition shadow-lg ${
                      isPopular
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-black shadow-orange-500/20'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    Choose Plan
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800/80 text-center text-xs text-gray-500 space-y-1">
        <p>© 2026 {tenantName}. Powered by FitCloud SaaS Management System.</p>
        <p className="text-[10px] text-gray-600 font-mono">Turnstile Gate Access • Real-time Attendance Telemetry • Paystack Verified</p>
      </footer>

      {/* Modals */}
      <DigitalPassModal
        isOpen={showPassModal}
        onClose={() => setShowPassModal(false)}
        memberData={currentUser}
        tenantName={tenantName}
      />

      <MemberDashboardModal
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
        onOpenPass={() => setShowPassModal(true)}
        onOpenRenew={() => setShowPlanModal(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
        tenantName={tenantName}
      />

      <PlanPurchaseModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        plans={displayPlans}
        currentUser={currentUser}
        initialSelectedPlanId={selectedPlanForPurchase}
        onSuccess={() => {
          fetchMemberProfile();
        }}
        onRequireAuth={() => {
          setShowLoginModal(true);
        }}
      />

      <MemberAuthModals
        isLoginOpen={showLoginModal}
        isRegisterOpen={showRegisterModal}
        onCloseLogin={() => setShowLoginModal(false)}
        onCloseRegister={() => setShowRegisterModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
        onLoginSuccess={(user) => {
          fetchMemberProfile();
          setNotificationMsg(`👋 Welcome, ${user.first_name || user.name || 'Member'}! Your pass is ready.`);
          setTimeout(() => setNotificationMsg(''), 5000);
        }}
        tenantSlug={tenantSlug}
      />
    </div>
  );
}
