'use client';

import React, { useState, useEffect, useCallback } from 'react';
import HeroSlider from './components/HeroSlider';
import GymPulseBar from './components/GymPulseBar';
import HowItWorksSection from './components/HowItWorksSection';
import AmenitiesGrid from './components/AmenitiesGrid';
import MembershipPlansSection from './components/MembershipPlansSection';
import FaqLocationSection from './components/FaqLocationSection';
import ClassScheduleSection from './components/ClassScheduleSection';
import BmiCalculatorSection from './components/BmiCalculatorSection';
import TrainersShowcaseSection from './components/TrainersShowcaseSection';
import TestimonialsSection from './components/TestimonialsSection';
import FooterSection from './components/FooterSection';
import DigitalPassModal from './components/DigitalPassModal';
import MemberDashboardModal from './components/MemberDashboardModal';
import PlanPurchaseModal from './components/PlanPurchaseModal';
import MemberAuthModals from './components/MemberAuthModals';
import { memberApiFetch, getMemberToken, clearMemberToken } from './lib/api';
import { applyTheme } from './lib/theme';
import { resolveTenantSlug } from './lib/tenantResolver';

function getInitialPortalCache(): any {
  if (typeof window === 'undefined') return null;
  try {
    const slug = resolveTenantSlug();
    const raw = localStorage.getItem(`fitcloud_portal_info_${slug}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export default function MemberPortalPage() {
  const [cachedData] = useState<any>(() => getInitialPortalCache());
  const [tenantName, setTenantName] = useState<string>(() => cachedData?.tenant?.name || 'Your Gym');
  const [tenantSlug, setTenantSlug] = useState('polanfit-fitness');
  const [tenantInfo, setTenantInfo] = useState<any>(() => cachedData || null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [workoutElapsed, setWorkoutElapsed] = useState('00h 00m 00s');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [pricingPlans, setPricingPlans] = useState<any[]>(() => cachedData?.pricing_plans || []);
  const [leaderboardStandings, setLeaderboardStandings] = useState<any[]>([]);
  const [leaderboardCampaign, setLeaderboardCampaign] = useState<any>(null);

  const [showDashboard, setShowDashboard] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<number | null>(null);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [cmsContent, setCmsContent] = useState<any>(() => cachedData?.cms || null);
  const [isColdLoading, setIsColdLoading] = useState<boolean>(() => !cachedData);

  // Keep the browser tab branded to the active gym, not the platform.
  useEffect(() => {
    if (tenantName && tenantName !== 'Your Gym') {
      document.title = `${tenantName} — Member Portal`;
    }
  }, [tenantName]);

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
        if (res.data.cms) {
          setCmsContent(res.data.cms);
        }
        if (res.data.theme) {
          applyTheme(res.data.theme);
        }
        try {
          localStorage.setItem(`fitcloud_portal_info_${slug}`, JSON.stringify(res.data));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to fetch tenant info:', err);
    } finally {
      setIsColdLoading(false);
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
    const slug = resolveTenantSlug();
    setTenantSlug(slug);

    fetchTenantData(slug);
    fetchLeaderboard();
    fetchMemberProfile();
  }, [fetchTenantData, fetchLeaderboard, fetchMemberProfile]);

  // Confirm a returning online checkout exactly once.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const checkoutId = params.get('checkout_id');
    const paymentState = params.get('payment');

    if (!checkoutId && !paymentState) return;

    window.history.replaceState({}, '', window.location.pathname);

    if (paymentState === 'cancelled') {
      setNotificationMsg('Payment cancelled. Your plan was not changed.');
      setTimeout(() => setNotificationMsg(''), 5000);
      return;
    }

    if (!checkoutId || !getMemberToken()) return;

    const confirm = async (attempt = 0) => {
      try {
        const res = await memberApiFetch('/member/plans/purchase', {
          method: 'POST',
          body: JSON.stringify({ checkout_id: checkoutId }),
        });

        if (res.success) {
          setNotificationMsg(`🎉 ${res.message || 'Membership activated successfully!'}`);
          fetchMemberProfile();
          setTimeout(() => setNotificationMsg(''), 6000);
          return;
        }

        if (attempt < 4) {
          setTimeout(() => confirm(attempt + 1), 2500);
          return;
        }

        setNotificationMsg(res.message || 'Payment is still processing. Refresh in a moment.');
        setTimeout(() => setNotificationMsg(''), 7000);
      } catch (err: any) {
        if (attempt < 4) {
          setTimeout(() => confirm(attempt + 1), 2500);
          return;
        }
        setNotificationMsg(err.message || 'Could not confirm the payment.');
        setTimeout(() => setNotificationMsg(''), 7000);
      }
    };

    confirm();
  }, [fetchMemberProfile]);

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

  if (isColdLoading && !tenantInfo && !cmsContent) {
    return (
      <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 text-3xl font-black shadow-2xl shadow-orange-500/20 animate-pulse">
            ⚡
          </div>
          <div className="absolute -inset-1.5 rounded-3xl border border-orange-500/30 animate-ping opacity-25"></div>
        </div>
        <div className="space-y-1">
          <h2 className="text-white font-black text-lg tracking-tight">Smart Pass Member Portal</h2>
          <p className="text-xs text-gray-500 font-mono">Syncing live biometric telemetry & arena passes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans">
      {/* Top Fixed/Sticky Header & Active Session Banner on top of Hero Image */}
      <div className="fixed top-0 inset-x-0 z-40 w-full transition-all duration-300">
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

        {/* Top Sticky Navigation Bar Floating on Top of Hero Slider (Transparent) */}
        <header className="relative px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-[2px] transition-all">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {tenantInfo?.tenant?.logo_url ? (
              <img
                src={tenantInfo.tenant.logo_url}
                alt={`${tenantName} logo`}
                className="w-10 h-10 rounded-xl object-contain bg-black/20 border border-white/10"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-orange-500/20">
                {tenantName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-white leading-tight text-sm sm:text-base tracking-tight truncate max-w-[150px] sm:max-w-none">{tenantName}</h1>
                {tenantInfo?.tenant?.is_demo && (
                  <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-amber-300">
                    Demo
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs text-orange-400 font-mono">Member Web Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-end">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowPassModal(true)}
                  className="px-3 sm:px-4 py-2 brand-btn-gradient font-extrabold text-black text-xs rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center gap-1.5"
                >
                  <span>📱</span>
                  <span className="hidden sm:inline">Digital Pass</span>
                </button>
                <button
                  onClick={() => setShowDashboard(true)}
                  className="px-2.5 sm:px-3.5 py-2 bg-gray-800/90 hover:bg-gray-700 font-bold text-white text-xs rounded-xl border border-gray-700/60 transition"
                >
                  <span>👤</span><span className="hidden sm:inline ml-1">My Profile</span>
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
                  className="px-3 sm:px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 font-bold text-gray-200 text-[11px] sm:text-xs rounded-xl transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-3 sm:px-4 py-2 brand-btn-gradient font-extrabold text-black text-[11px] sm:text-xs rounded-xl shadow-lg shadow-orange-500/20 transition"
                >
                  Join Gym
                </button>
              </>
            )}
          </div>
        </header>
      </div>

      {/* SECTION VISIBILITY WRAPPERS */}

      {/* 1. Hero Section with Brightened Dark Background Slider & Overlay */}
      {(cmsContent?.section_visibility?.hero !== false) && (
        <HeroSlider
          tenantName={tenantName}
          campaignTitle={leaderboardCampaign?.title || 'Active Fitness Challenge'}
          isAuthenticated={isAuthenticated}
          slides={cmsContent?.hero?.slides}
          onOpenPass={() => setShowPassModal(true)}
          onOpenRenew={() => setShowPlanModal(true)}
          onOpenRegister={() => setShowRegisterModal(true)}
        />
      )}

      {/* 2. Live Gym Operating Hours & Capacity Status */}
      {(cmsContent?.section_visibility?.pulse !== false) && (
        <GymPulseBar
          tenantName={tenantName}
          hours={cmsContent?.contact_socials?.hours_weekday}
        />
      )}

      {/* 3. How Gate Access Works */}
      {(cmsContent?.section_visibility?.how_it_works !== false) && (
        <HowItWorksSection />
      )}

      {/* 4. Elite Amenities & Infrastructure Grid */}
      {(cmsContent?.section_visibility?.amenities !== false) && (
        <AmenitiesGrid items={cmsContent?.amenities?.items} />
      )}

      {/* 5. Weekly Class Timetable & Group Sessions */}
      {(cmsContent?.section_visibility?.classes !== false) && (
        <ClassScheduleSection
          tenantName={tenantName}
          schedule={cmsContent?.classes}
          onSelectClass={(clsName) => {
            if (!isAuthenticated) {
              setNotificationMsg(`✨ Selected ${clsName}. Sign in or create a pass to reserve your spot.`);
              setShowLoginModal(true);
            } else {
              setNotificationMsg(`🎉 Spot reserved for ${clsName}! See you at the studio.`);
              setTimeout(() => setNotificationMsg(''), 5000);
            }
          }}
        />
      )}

      {/* 6. Interactive Body Mass Index (BMI) Telemetry Calculator */}
      {(cmsContent?.section_visibility?.bmi !== false) && (
        <BmiCalculatorSection
          tenantName={tenantName}
          onExplorePlans={() => {
            const plansEl = document.getElementById('plans');
            if (plansEl) plansEl.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* 7. Elite Certified Trainers & Master Coaches */}
      {(cmsContent?.section_visibility?.trainers !== false) && (
        <TrainersShowcaseSection
          tenantName={tenantName}
          trainers={cmsContent?.trainers?.items}
          onBookTrainer={(trainerName) => {
            if (!isAuthenticated) {
              setNotificationMsg(`💬 Booking 1-on-1 consultation with Coach ${trainerName}. Create an account to complete.`);
              setShowRegisterModal(true);
            } else {
              const msg = encodeURIComponent(`Hello ${tenantName}, I would like to schedule a 1-on-1 personal training consultation with coach ${trainerName}.`);
              window.open(`https://wa.me/?text=${msg}`, '_blank');
            }
          }}
        />
      )}

      {/* 8. Compact & Categorized Membership Plans */}
      {(cmsContent?.section_visibility?.plans !== false) && (
        <main className="w-full max-w-6xl mx-auto px-6 py-12" id="plans">
          <MembershipPlansSection
            plans={pricingPlans}
            currencySymbol={currencySymbol}
            onSelectPlan={handlePlanSelect}
          />
        </main>
      )}

      {/* 9. Member Testimonials & Real Transformations */}
      {(cmsContent?.section_visibility?.testimonials !== false) && (
        <TestimonialsSection
          tenantName={tenantName}
          testimonials={cmsContent?.testimonials?.items}
        />
      )}

      {/* 10. FAQs & Front Desk Support */}
      {(cmsContent?.section_visibility?.faqs !== false) && (
        <FaqLocationSection
          tenantName={tenantName}
          faqs={cmsContent?.faqs?.items}
          contactSocials={cmsContent?.contact_socials}
        />
      )}

      {/* Modern Gym Footer with Socials, Physical Address, Operating Hours & Links */}
      <FooterSection
        tenantName={tenantName}
        address={tenantInfo?.tenant?.address || '123 Fitness Avenue, Lagos, Nigeria'}
        phone={tenantInfo?.tenant?.phone || '+234 801 122 3322'}
        email={tenantInfo?.tenant?.email || 'frontdesk@example.com'}
        contactSocials={cmsContent?.contact_socials}
        onOpenPass={() => setShowPassModal(true)}
        onOpenRenew={() => setShowPlanModal(true)}
        onOpenLogin={() => setShowLoginModal(true)}
      />

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
        usdRate={Number(tenantInfo?.platform?.usd_rate || 1600)}
        planCurrency={tenantInfo?.tenant?.currency || 'NGN'}
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
