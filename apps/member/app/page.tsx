'use client';

import React, { useState, useEffect, useCallback } from 'react';
import HeroSlider from './components/HeroSlider';
import GymPulseBar from './components/GymPulseBar';
import HowItWorksSection from './components/HowItWorksSection';
import AmenitiesGrid from './components/AmenitiesGrid';
import MembershipPlansSection from './components/MembershipPlansSection';
import FaqLocationSection from './components/FaqLocationSection';
import DigitalPassModal from './components/DigitalPassModal';
import MemberDashboardModal from './components/MemberDashboardModal';
import PlanPurchaseModal from './components/PlanPurchaseModal';
import MemberAuthModals from './components/MemberAuthModals';
import { memberApiFetch, getMemberToken, clearMemberToken } from './lib/api';

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

  // 2. Fetch Leaderboard (for Member Dashboard)
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
          <div className="bg-orange-500/10 border-b border-orange-500/30 text-orange-400 px-6 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <span>{notificationMsg}</span>
            <button onClick={() => setNotificationMsg('')} className="text-orange-400 hover:text-white font-mono">✕</button>
          </div>
        )}

        {/* Top Sticky Navigation Bar */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-gray-800/80 bg-[#0a0a0c]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-orange-500/20">
              {tenantName.charAt(0)}
            </div>
            <div>
              <h1 className="font-extrabold text-white leading-tight text-base tracking-tight">{tenantName}</h1>
              <span className="text-xs text-orange-400 font-mono">Member Web Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowPassModal(true)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center gap-1.5"
                >
                  <span>📱</span>
                  <span>Digital Pass</span>
                </button>
                <button
                  onClick={() => setShowDashboard(true)}
                  className="px-3.5 py-2 bg-gray-800/90 hover:bg-gray-700 font-bold text-white text-xs rounded-xl border border-gray-700/60 transition"
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
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition"
                >
                  Join Gym
                </button>
              </>
            )}
          </div>
        </header>
      </div>

      {/* Hero Section with Brightened Dark Background Slider & Overlay */}
      <HeroSlider
        tenantName={tenantName}
        campaignTitle={leaderboardCampaign?.title || 'Active Fitness Challenge'}
        isAuthenticated={isAuthenticated}
        onOpenPass={() => setShowPassModal(true)}
        onOpenRenew={() => setShowPlanModal(true)}
        onOpenRegister={() => setShowRegisterModal(true)}
      />

      {/* Live Gym Operating Hours & Capacity Status */}
      <GymPulseBar tenantName={tenantName} />

      {/* How Turnstile Gate Access Works */}
      <HowItWorksSection />

      {/* Elite Amenities & Infrastructure Grid */}
      <AmenitiesGrid />

      {/* Compact & Categorized Membership Plans */}
      <main className="w-full max-w-6xl mx-auto px-6 py-12">
        <MembershipPlansSection
          plans={pricingPlans}
          currencySymbol={currencySymbol}
          onSelectPlan={handlePlanSelect}
        />
      </main>

      {/* FAQs & Front Desk Support */}
      <FaqLocationSection tenantName={tenantName} />

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800/80 text-center text-xs text-gray-500 space-y-1">
        <p>© 2026 {tenantName}. Powered by FitCloud SaaS Management System.</p>
        <p className="text-[10px] text-gray-600 font-mono">
          Biometric Fingerprint • Turnstile QR Access • Real-time Attendance Telemetry • Paystack Verified
        </p>
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
        leaderboardStandings={leaderboardStandings}
        leaderboardCampaign={leaderboardCampaign}
      />

      <PlanPurchaseModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        plans={pricingPlans}
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
