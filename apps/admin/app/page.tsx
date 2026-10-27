'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { FcMoneyTransfer, FcConferenceCall, FcApproval, FcCalendar } from 'react-icons/fc';
import { apiFetch } from './lib/apiClient';

export default function AdminDashboardPage() {
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [stats, setStats] = useState<any>({
    revenue_month: 0,
    revenue_last_month: 0,
    revenue_growth: 0,
    total_members: 0,
    new_members_week: 0,
    active_members: 0,
    check_ins_today: 0,
    check_ins_week: 0,
  });

  // Active Sessions Expiring Soon
  const [expiringSessions, setExpiringSessions] = useState<any[]>([]);

  // Recent Transactions List
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Member Inbox State
  const [inboxOpen, setInboxOpen] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);

  // Front Desk Check-in Input
  const [checkInInput, setCheckInInput] = useState('');
  const [deskLogs, setDeskLogs] = useState<any[]>([]);

  // Activity Chart & Donut States
  const [activityRange, setActivityRange] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [activityChartData, setActivityChartData] = useState<{ labels: string[]; data: number[] }>({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [0, 0, 0, 0, 0, 0, 0],
  });
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [donutHoveredSegment, setDonutHoveredSegment] = useState<'active' | 'expired' | null>(null);

  // Record Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    transactionType: 'SUBSCRIPTION_RENEWAL',
    paymentMethod: 'POS',
    accountId: '1',
    memberId: '',
    payerName: '',
    pricingPlanUid: 'plan-2',
    amount: '15440',
    durationMonths: '1',
    reference: '',
    notes: '',
  });

  const availablePlans = [
    { uid: 'plan-1', name: 'Daily Subscription', price: 5000, subText: '1 Day Access' },
    { uid: 'plan-2', name: 'Member Registration', price: 15440, subText: 'New Member Onboarding' },
    { uid: 'plan-3', name: 'VIP Monthly Pass', price: 65000, subText: 'Full Gym + Sauna Access' },
  ];

  const fetchLiveDashboardStats = async (range: string = activityRange) => {
    try {
      const json = await apiFetch(`/admin/dashboard/stats?range=${range}`);
      if ((json.status === 'success' || json.success) && json.data) {
        const d = json.data;
        const totalMembers = Number(d.totalMembers ?? d.total_members ?? 0);
        const activeMembers = Number(d.activeMembersCount ?? d.active_members ?? 0);
        const expiredMembers = Number(d.expiredMembersCount ?? d.expired_members ?? Math.max(0, totalMembers - activeMembers));

        setStats({
          revenue_month: Number(d.totalRevenueThisMonth ?? d.revenue_month ?? 0),
          revenue_last_month: Number(d.totalRevenueLastMonth ?? d.revenue_last_month ?? 0),
          revenue_growth: Number(d.revenuePercentageChange ?? d.revenue_growth ?? 0),
          total_members: totalMembers,
          new_members_week: Number(d.newMembersThisWeek ?? d.new_members_week ?? 0),
          active_members: activeMembers,
          expired_members: expiredMembers,
          check_ins_today: Number(d.checkInsToday ?? d.check_ins_today ?? 0),
          check_ins_week: Number(d.checkInsThisWeek ?? d.check_ins_week ?? 0),
        });

        if (d.activityChartData && Array.isArray(d.activityChartData.labels) && Array.isArray(d.activityChartData.data)) {
          setActivityChartData({
            labels: d.activityChartData.labels,
            data: d.activityChartData.data.map((v: any) => Number(v) || 0),
          });
        }

        if (Array.isArray(d.expiringSoon)) {
          setExpiringSessions(d.expiringSoon);
        }

        if (Array.isArray(d.recentTransactions)) {
          setRecentTransactions(d.recentTransactions);
        }

        if (Array.isArray(d.leaderboard)) {
          setLeaderboard(d.leaderboard);
        }

        if (Array.isArray(d.messages)) {
          setInboxMessages(d.messages);
        }
      }
    } catch (err) {
      console.error('Failed to fetch live dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchLiveDashboardStats(activityRange);
    const interval = setInterval(() => fetchLiveDashboardStats(activityRange), 60000);
    return () => clearInterval(interval);
  }, [activityRange]);

  const handleSimulateCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInInput.trim()) return;

    const newLog = {
      id: Date.now(),
      name: checkInInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      method: 'Manual Staff Gate',
    };

    setDeskLogs([newLog, ...deskLogs]);
    setCheckInInput('');
    setStats((prev: any) => ({
      ...prev,
      check_ins_today: (prev.check_ins_today || 0) + 1,
      check_ins_week: (prev.check_ins_week || 0) + 1,
    }));
    // Real-time update to the activity telemetry curve
    setActivityChartData((prev) => {
      const nextData = [...prev.data];
      if (nextData.length > 0) {
        const todayIdx = (new Date().getDay() + 6) % 7;
        if (activityRange === 'weekly' && todayIdx < nextData.length) {
          nextData[todayIdx] = (nextData[todayIdx] || 0) + 1;
        } else {
          nextData[nextData.length - 1] = (nextData[nextData.length - 1] || 0) + 1;
        }
      }
      return { ...prev, data: nextData };
    });
  };

  const handleCancelSession = (uid: string) => {
    if (confirm('Are you sure you want to end this active session?')) {
      setExpiringSessions((prev) => prev.filter((s) => s.uid !== uid));
    }
  };

  const handleCancelAllActive = () => {
    if (confirm('⚠️ DANGER: Are you sure you want to terminate ALL active sessions in the gym right now?')) {
      setExpiringSessions([]);
      alert('✅ All active sessions have been terminated.');
    }
  };

  const handleClearHistory = () => {
    if (confirm('⚠️ DANGER: Clear all check-in history logs? This cannot be undone.')) {
      alert('✅ Check-in history cleared.');
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setShowPaymentModal(false);
      alert(`💳 Payment Recorded Successfully!\nAmount: ₦${Number(paymentForm.amount).toLocaleString()}\nMethod: ${paymentForm.paymentMethod}`);
    }, 800);
  };

  const handleOnlinePayment = () => {
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setShowPaymentModal(false);
      alert(`💳 Online checkout initialized!\nAmount: ₦${Number(paymentForm.amount).toLocaleString()}\nProceeding to the secure payment window...`);
    }, 1000);
  };

  // Activity Chart Calculations
  const chartLabels = activityChartData.labels.length > 0 ? activityChartData.labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartData = activityChartData.data.length > 0 ? activityChartData.data : [0, 0, 0, 0, 0, 0, 0];
  const maxCheckIns = Math.max(...chartData, 5); // baseline minimum scale of 5 for aesthetics
  const totalPeriodCheckIns = chartData.reduce((a, b) => a + b, 0);

  // SVG dimensions
  const svgW = 500;
  const svgH = 170;
  const padL = 36;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const points = chartData.map((val, idx) => {
    const x = padL + (idx / Math.max(chartData.length - 1, 1)) * plotW;
    const y = padT + (1 - val / maxCheckIns) * plotH;
    return { x, y, val, label: chartLabels[idx] };
  });

  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padT + plotH} L ${points[0].x} ${padT + plotH} Z`
    : '';

  // Member Status Donut Calculations
  const totalM = Number(stats.total_members) || 0;
  const activeM = Number(stats.active_members) || 0;
  const expiredM = Number(stats.expired_members) || Math.max(0, totalM - activeM);
  const activePct = totalM > 0 ? Math.min(100, Math.round((activeM / totalM) * 100)) : 0;
  const expiredPct = totalM > 0 ? Math.max(0, 100 - activePct) : 0;

  const donutR = 56;
  const donutC = 2 * Math.PI * donutR; // ~351.858
  const activeDash = (activePct / 100) * donutC;
  const expiredDash = (expiredPct / 100) * donutC;

  return (
    <div className="flex min-h-screen bg-[#070709] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Dashboard Overview" subtitle="Real-time gym performance, active sessions, and attendance metrics" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6 max-w-7xl">

          {/* Member Inbox Top Collapsible Banner (Only shown if active messages exist) */}
          {inboxMessages.length > 0 && (
            <div className="rounded-3xl bg-[#121217] border border-gray-800/80 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setInboxOpen(!inboxOpen)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-lg shadow-md">
                    📬
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">Member Inbox</h2>
                    <p className="text-xs text-gray-400">Suggestions, complaints & feedback ({inboxMessages.length})</p>
                  </div>
                </div>

                <button className="text-gray-400 hover:text-white font-bold text-sm">
                  {inboxOpen ? '▲' : '▼'}
                </button>
              </div>

              {inboxOpen && (
                <div className="space-y-3 pt-1">
                  {inboxMessages.map((msg) => (
                    <div key={msg.id} className="p-4 rounded-2xl bg-[#0a0a0c] border border-gray-800 flex items-center justify-between text-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-800 text-gray-300 font-bold flex items-center justify-center text-sm border border-gray-700">
                          {msg.memberName ? msg.memberName.charAt(0) : 'M'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {msg.memberName} <span className="text-purple-400 text-[10px]">({msg.gender || 'm'})</span>
                            </span>
                            <span className="text-[10px] text-amber-500 font-mono">{msg.timestamp}</span>
                          </div>
                          <p className="font-extrabold text-white mt-1">{msg.subject}</p>
                          <p className="text-gray-400 mt-0.5">{msg.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-extrabold text-[10px] uppercase tracking-wider">
                          {msg.type}
                        </span>
                        <button className="text-gray-400 hover:text-white transition">↶</button>
                        <button className="text-gray-400 hover:text-amber-400 transition">⭐</button>
                        <button className="text-gray-400 hover:text-red-400 transition">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4 Top KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Card 1: Vibrant Orange Revenue Card */}
            <div
              className="p-6 rounded-3xl text-white shadow-xl shadow-orange-500/20 relative overflow-hidden border border-orange-500/30 min-h-[148px] flex flex-col justify-between"
              style={{
                backgroundImage: 'url("/images/dashboard/shap-partern.png"), linear-gradient(135deg, #fa6a2e 0%, #e84a0e 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/90">
                  <FcMoneyTransfer size={32} className="me-2 shrink-0 drop-shadow-md" />
                  <span>REVENUE (THIS MONTH)</span>
                </div>
                {loadingStats ? (
                  <div className="mt-3 space-y-2 animate-pulse">
                    <div className="h-8 w-44 bg-white/30 rounded-xl" />
                    <div className="h-4 w-52 bg-white/20 rounded-lg" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-black text-white mt-3 tracking-tight">
                      ₦{Number(stats.revenue_month ?? 0).toLocaleString()}
                    </div>
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-white/80">
                        vs. ↗ ₦{Number(stats.revenue_last_month ?? 0).toLocaleString()} ({Number(stats.revenue_growth ?? 0) >= 0 ? '+' : ''}{Number(stats.revenue_growth ?? 0).toFixed(1)}%) last month
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Card 2: Total Members */}
            <div
              className="p-6 rounded-3xl text-white shadow-xl border border-gray-800/80 flex flex-col justify-between relative overflow-hidden min-h-[148px]"
              style={{
                backgroundImage: 'url("/images/dashboard/shap-partern.png"), linear-gradient(135deg, #242426 0%, #1a1a1c 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  <FcConferenceCall size={32} className="me-2 shrink-0 drop-shadow-md" />
                  <span>TOTAL MEMBERS</span>
                </div>
                {loadingStats ? (
                  <div className="mt-3 space-y-2 animate-pulse">
                    <div className="h-8 w-24 bg-gray-800 rounded-xl" />
                    <div className="h-4 w-40 bg-gray-800/70 rounded-lg" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-black text-white mt-3">{stats.total_members ?? 0}</div>
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-gray-400">
                        <span className="text-emerald-400 font-bold">+{stats.new_members_week ?? 0}</span> new member this week
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Card 3: Active Members */}
            <div
              className="p-6 rounded-3xl text-white shadow-xl border border-gray-800/80 flex flex-col justify-between relative overflow-hidden min-h-[148px]"
              style={{
                backgroundImage: 'url("/images/dashboard/shap-partern.png"), linear-gradient(135deg, #242426 0%, #1a1a1c 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  <FcApproval size={32} className="me-2 shrink-0 drop-shadow-md" />
                  <span>ACTIVE MEMBERS</span>
                </div>
                {loadingStats ? (
                  <div className="mt-3 space-y-2 animate-pulse">
                    <div className="h-8 w-24 bg-gray-800 rounded-xl" />
                    <div className="h-4 w-44 bg-gray-800/70 rounded-lg" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-black text-white mt-3">{stats.active_members ?? 0}</div>
                    <div className="text-xs text-gray-400 font-semibold mt-3">
                      out of <span className="text-cyan-400 font-bold">{stats.total_members ?? 0}</span> total members
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Card 4: Check-ins Today */}
            <div
              className="p-6 rounded-3xl text-white shadow-xl border border-gray-800/80 flex flex-col justify-between relative overflow-hidden min-h-[148px]"
              style={{
                backgroundImage: 'url("/images/dashboard/shap-partern.png"), linear-gradient(135deg, #242426 0%, #1a1a1c 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  <FcCalendar size={32} className="me-2 shrink-0 drop-shadow-md" />
                  <span>CHECK-INS TODAY</span>
                </div>
                {loadingStats ? (
                  <div className="mt-3 space-y-2 animate-pulse">
                    <div className="h-8 w-24 bg-gray-800 rounded-xl" />
                    <div className="h-4 w-36 bg-gray-800/70 rounded-lg" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-black text-white mt-3">{stats.check_ins_today ?? 0}</div>
                    <div className="text-xs text-gray-400 font-semibold mt-3">
                      <span className="text-amber-400 font-bold">{stats.check_ins_week ?? 0}</span> total this week
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* LIVE: Sessions Expiring Soon Widget */}
          <div className="p-6 rounded-3xl bg-[#121217] border border-gray-800/80 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  Sessions Expiring Soon
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                    LIVE
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelAllActive}
                  className="px-3.5 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-extrabold hover:bg-orange-500/20 transition"
                >
                  End All Active
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-extrabold hover:bg-red-500/20 transition"
                >
                  Clear History
                </button>
                <Link
                  href="/check-ins"
                  className="px-3.5 py-1.5 rounded-full bg-gray-800 text-gray-300 text-xs font-extrabold hover:bg-gray-700 transition"
                >
                  View All ↗
                </Link>
              </div>
            </div>

            {/* Expiring Sessions Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="border-b border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">MEMBER</th>
                    <th className="py-3 px-4">SESSION</th>
                    <th className="py-3 px-4">DURATION</th>
                    <th className="py-3 px-4 text-right">TIME LEFT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {loadingStats ? (
                    [1, 2, 3].map((n) => (
                      <tr key={n} className="animate-pulse">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-800" />
                            <div className="space-y-1.5">
                              <div className="h-3.5 w-32 bg-gray-800 rounded" />
                              <div className="h-2.5 w-20 bg-gray-800/60 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="h-5 w-16 bg-gray-800 rounded-full" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="h-3.5 w-28 bg-gray-800 rounded" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="h-6 w-20 bg-gray-800 rounded-full ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : expiringSessions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-2xl">⚡</span>
                          <span className="text-xs font-semibold">No active sessions expiring soon</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    expiringSessions.map((session) => (
                      <tr key={session.uid} className="hover:bg-gray-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-xs">
                              {session.memberName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">
                                {session.memberName} <span className="text-purple-400 text-xs font-mono">({session.gender})</span>
                              </p>
                              <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">{session.method}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-extrabold">
                            {session.sessionType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-300">
                          {session.checkInTime} - {session.endTime}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="px-3.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-mono font-extrabold text-xs shadow-lg shadow-red-500/10 animate-pulse">
                              {session.remainingMinutes}m Left
                            </span>
                            <button
                              onClick={() => handleCancelSession(session.uid)}
                              className="text-gray-400 hover:text-red-400 text-sm transition font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom 3-Column Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Column 1: Live Interactive Activity Area Chart */}
            <div className="p-6 rounded-3xl bg-[#121217] border border-gray-800/80 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
              {/* Header with Title, Period Total Subtitle, and Range Selector */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-md shadow-orange-500/50 shrink-0" />
                    <h3 className="text-base font-extrabold text-white tracking-tight">Activity</h3>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 whitespace-nowrap">
                    <span className="text-orange-400 font-extrabold">{Number(totalPeriodCheckIns).toLocaleString()}</span>{' '}
                    {totalPeriodCheckIns === 1 ? 'check-in' : 'check-ins'}{' '}
                    <span className="text-gray-500">({activityRange === 'weekly' ? 'this week' : activityRange === 'monthly' ? 'this month' : 'this year'})</span>
                  </p>
                </div>

                {/* Range Filter Pills */}
                <div className="flex items-center gap-0.5 p-1 rounded-xl bg-[#0a0a0c] border border-gray-800 text-[11px] font-bold shrink-0">
                  {(['weekly', 'monthly', 'yearly'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setActivityRange(r)}
                      className={`px-2.5 py-1 rounded-lg transition-all capitalize text-[11px] ${
                        activityRange === r
                          ? 'bg-orange-500 text-black font-black shadow-md shadow-orange-500/20'
                          : 'text-gray-400 hover:text-white font-medium'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Visualization Container */}
              <div className="pt-2 relative">
                {loadingStats ? (
                  <div className="h-44 w-full bg-gray-800/30 rounded-2xl animate-pulse flex items-center justify-center">
                    <span className="text-xs text-gray-500 font-semibold">Loading activity telemetry...</span>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Floating Tooltip when hovering a point */}
                    {hoveredPointIndex !== null && points[hoveredPointIndex] && (
                      <div
                        className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-[#1e1e26] border border-orange-500/40 text-xs shadow-2xl backdrop-blur-md -translate-x-1/2 -translate-y-full transition-all duration-150"
                        style={{
                          left: `${(points[hoveredPointIndex].x / svgW) * 100}%`,
                          top: `${(points[hoveredPointIndex].y / svgH) * 100 - 8}%`,
                        }}
                      >
                        <div className="font-extrabold text-white text-[11px]">
                          {points[hoveredPointIndex].label}
                        </div>
                        <div className="text-[12px] font-black text-orange-400">
                          {points[hoveredPointIndex].val} <span className="text-[10px] text-gray-300 font-normal">Check-ins</span>
                        </div>
                      </div>
                    )}

                    <svg
                      className="w-full h-44 overflow-visible"
                      viewBox={`0 0 ${svgW} ${svgH}`}
                      preserveAspectRatio="none"
                    >
                      <defs>
                        {/* Luminous Neon Orange Gradient Fill */}
                        <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fa6a2e" stopOpacity="0.4" />
                          <stop offset="60%" stopColor="#fa6a2e" stopOpacity="0.08" />
                          <stop offset="100%" stopColor="#fa6a2e" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Glow Filter */}
                        <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#fa6a2e" floodOpacity="0.4" />
                        </filter>
                      </defs>

                      {/* Horizontal Grid Guidelines & Y-Axis Labels */}
                      {[0, 0.5, 1].map((ratio, i) => {
                        const yPos = padT + ratio * plotH;
                        const labelVal = Math.round(maxCheckIns * (1 - ratio));
                        return (
                          <g key={i}>
                            <line
                              x1={padL}
                              y1={yPos}
                              x2={svgW - padR}
                              y2={yPos}
                              stroke="rgba(255, 255, 255, 0.07)"
                              strokeDasharray="4 4"
                              strokeWidth="1"
                            />
                            <text
                              x={padL - 8}
                              y={yPos + 3.5}
                              textAnchor="end"
                              fill="#6b7280"
                              fontSize="9"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {labelVal}
                            </text>
                          </g>
                        );
                      })}

                      {/* Vertical Crosshair Line on Hover */}
                      {hoveredPointIndex !== null && points[hoveredPointIndex] && (
                        <line
                          x1={points[hoveredPointIndex].x}
                          y1={padT}
                          x2={points[hoveredPointIndex].x}
                          y2={padT + plotH}
                          stroke="#fa6a2e"
                          strokeDasharray="3 3"
                          strokeWidth="1.5"
                          opacity="0.8"
                        />
                      )}

                      {/* Gradient Fill Path */}
                      {areaPath && <path d={areaPath} fill="url(#activityGradient)" />}

                      {/* Smooth Glowing Trend Line */}
                      {linePath && (
                        <path
                          d={linePath}
                          fill="none"
                          stroke="#fa6a2e"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#orangeGlow)"
                        />
                      )}

                      {/* Interactive Point Nodes */}
                      {points.map((pt, i) => {
                        const isHovered = hoveredPointIndex === i;
                        return (
                          <g
                            key={i}
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredPointIndex(i)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                          >
                            {/* Invisible touch/hover target */}
                            <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                            {/* Halo ripple on hover */}
                            {isHovered && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="10"
                                fill="none"
                                stroke="rgba(250, 106, 46, 0.5)"
                                strokeWidth="3"
                                className="animate-ping origin-center"
                              />
                            )}

                            {/* Center Point Circle */}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 5.5 : 3.5}
                              fill={isHovered ? '#fa6a2e' : '#0a0a0c'}
                              stroke="#fa6a2e"
                              strokeWidth={isHovered ? 2.5 : 2}
                              className="transition-all duration-150"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* X-Axis Labels Row */}
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 pt-1 border-t border-gray-800/80 px-1">
                      {chartLabels.map((lbl, idx) => {
                        // For monthly with many labels, only display periodically
                        if (activityRange === 'monthly' && idx % 4 !== 0 && idx !== chartLabels.length - 1) {
                          return null;
                        }
                        const isHovered = hoveredPointIndex === idx;
                        return (
                          <span
                            key={idx}
                            onMouseEnter={() => setHoveredPointIndex(idx)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                            className={`cursor-pointer transition ${
                              isHovered ? 'text-orange-400 font-black scale-110' : 'hover:text-white'
                            }`}
                          >
                            {lbl}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Live Dual-Arc Member Status Donut Chart */}
            <div className="p-6 rounded-3xl bg-[#121217] border border-gray-800/80 shadow-xl space-y-4 text-center flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white text-left">Member Status</h3>
                  <p className="text-[11px] text-gray-400 text-left">
                    {totalM.toLocaleString()} Registered {totalM === 1 ? 'Member' : 'Members'}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black tracking-wider uppercase">
                  {activePct}% Active
                </span>
              </div>

              {/* Dynamic SVG Donut Visualization */}
              <div className="py-2 flex items-center justify-center relative">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                    <defs>
                      {/* Emerald Glow & Gradient */}
                      <linearGradient id="emeraldNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>

                      {/* Red/Coral Gradient */}
                      <linearGradient id="roseNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#b91c1c" />
                      </linearGradient>

                      <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {/* Background Track Ring */}
                    <circle
                      cx="70"
                      cy="70"
                      r={donutR}
                      fill="none"
                      stroke="#1e1e24"
                      strokeWidth="14"
                    />

                    {/* Active Members Arc */}
                    {activePct > 0 && (
                      <circle
                        cx="70"
                        cy="70"
                        r={donutR}
                        fill="none"
                        stroke="url(#emeraldNeonGrad)"
                        strokeWidth={donutHoveredSegment === 'active' ? 18 : 14}
                        strokeDasharray={`${activeDash} ${donutC}`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        filter={donutHoveredSegment === 'active' ? 'url(#activeGlow)' : undefined}
                        className="transition-all duration-500 cursor-pointer"
                        onMouseEnter={() => setDonutHoveredSegment('active')}
                        onMouseLeave={() => setDonutHoveredSegment(null)}
                      />
                    )}

                    {/* Expired / Inactive Members Arc */}
                    {expiredPct > 0 && (
                      <circle
                        cx="70"
                        cy="70"
                        r={donutR}
                        fill="none"
                        stroke="url(#roseNeonGrad)"
                        strokeWidth={donutHoveredSegment === 'expired' ? 18 : 14}
                        strokeDasharray={`${expiredDash} ${donutC}`}
                        strokeDashoffset={-activeDash}
                        strokeLinecap="round"
                        className="transition-all duration-500 cursor-pointer"
                        onMouseEnter={() => setDonutHoveredSegment('expired')}
                        onMouseLeave={() => setDonutHoveredSegment(null)}
                      />
                    )}
                  </svg>

                  {/* Donut Center Hub Info */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    {loadingStats ? (
                      <div className="h-8 w-16 bg-gray-800 rounded-lg animate-pulse" />
                    ) : donutHoveredSegment === 'active' ? (
                      <div className="animate-fadeIn">
                        <span className="text-2xl font-black text-emerald-400 leading-none">
                          {activeM.toLocaleString()}
                        </span>
                        <p className="text-[9px] font-extrabold text-emerald-300 uppercase tracking-wider mt-1">
                          Active
                        </p>
                      </div>
                    ) : donutHoveredSegment === 'expired' ? (
                      <div className="animate-fadeIn">
                        <span className="text-2xl font-black text-red-400 leading-none">
                          {expiredM.toLocaleString()}
                        </span>
                        <p className="text-[9px] font-extrabold text-red-300 uppercase tracking-wider mt-1">
                          Expired
                        </p>
                      </div>
                    ) : (
                      <div className="animate-fadeIn">
                        <span className="text-3xl font-black text-white leading-none tracking-tight">
                          {activePct}%
                        </span>
                        <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mt-1">
                          Active Ratio
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Legend & Metric Breakdown */}
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onMouseEnter={() => setDonutHoveredSegment('active')}
                    onMouseLeave={() => setDonutHoveredSegment(null)}
                    className={`p-2.5 rounded-2xl border transition cursor-pointer text-left ${
                      donutHoveredSegment === 'active'
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                        : 'bg-[#0a0a0c] border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                    </div>
                    <div className="text-base font-extrabold text-white mt-0.5">
                      {activeM.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-400">{activePct}% of members</div>
                  </div>

                  <div
                    onMouseEnter={() => setDonutHoveredSegment('expired')}
                    onMouseLeave={() => setDonutHoveredSegment(null)}
                    className={`p-2.5 rounded-2xl border transition cursor-pointer text-left ${
                      donutHoveredSegment === 'expired'
                        ? 'bg-red-500/15 border-red-500/50 shadow-lg shadow-red-500/10'
                        : 'bg-[#0a0a0c] border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> Expired
                    </div>
                    <div className="text-base font-extrabold text-white mt-0.5">
                      {expiredM.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-400">{expiredPct}% of members</div>
                  </div>
                </div>

                {/* Micro Retention Bar */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-[#1e1e24] rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${activePct}%` }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    />
                    <div
                      style={{ width: `${expiredPct}%` }}
                      className="bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-500"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                    <span>Gym Retention Health</span>
                    <span className={activePct >= 70 ? 'text-emerald-400' : activePct >= 50 ? 'text-amber-400' : 'text-red-400'}>
                      {activePct >= 70 ? 'Optimal' : activePct >= 50 ? 'Moderate' : 'Low Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Recent Transactions Widget */}
            <div className="p-6 rounded-3xl bg-[#121217] border border-gray-800/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white">Recent Transactions</h3>
                <Link href="/transactions" className="text-xs font-bold text-gray-400 hover:text-white">
                  View all
                </Link>
              </div>

              <div className="space-y-3">
                {loadingStats ? (
                  [1, 2, 3].map((n) => (
                    <div key={n} className="p-3.5 rounded-2xl bg-[#0a0a0c] border border-gray-800 flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-800" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-28 bg-gray-800 rounded" />
                          <div className="h-2.5 w-16 bg-gray-800/60 rounded" />
                        </div>
                      </div>
                      <div className="space-y-1.5 text-right">
                        <div className="h-3 w-16 bg-gray-800 rounded ml-auto" />
                        <div className="h-2 w-12 bg-gray-800/60 rounded ml-auto" />
                      </div>
                    </div>
                  ))
                ) : recentTransactions.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-xs font-medium">
                    No recent transactions found
                  </div>
                ) : (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="p-3.5 rounded-2xl bg-[#0a0a0c] border border-gray-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-sm">
                          📄
                        </div>
                        <div>
                          <p className="font-extrabold text-white">
                            {tx.memberName} <span className="text-purple-400 text-[10px]">({tx.gender || 'm'})</span>
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-mono">{tx.type}</p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p className="font-black text-emerald-400 font-mono">₦{Number(tx.amount || 0).toLocaleString()}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{tx.date}</p>
                        </div>
                        <span className="text-gray-500 hover:text-white cursor-pointer text-sm font-bold">⋮</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Bottom Split Row: Front Desk Quick Check-in & Live Campaign Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Front Desk Desk Quick Scanner / Entry Form */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-[#121217] border border-gray-800/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white">Front Desk Quick Check-in</h3>
                <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                  Desk API
                </span>
              </div>

              <form onSubmit={handleSimulateCheckIn} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Member Name / ID..."
                  value={checkInInput}
                  onChange={(e) => setCheckInInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0a0a0c] border border-gray-800 text-white text-xs font-medium focus:border-orange-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs transition"
                >
                  Check In
                </button>
              </form>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Recent Reception Logs
                </span>
                {deskLogs.length === 0 ? (
                  <div className="py-6 text-center text-gray-500 text-xs">
                    No desk check-ins recorded yet
                  </div>
                ) : (
                  deskLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-[#0a0a0c] border border-gray-800/80 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{log.name}</p>
                        <p className="text-[10px] text-gray-500">{log.time} • {log.method}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        Active
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Campaign Leaderboard Standings */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#121217] border border-gray-800/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <div>
                  <h3 className="text-base font-extrabold text-white">🏆 Live Campaign Leaderboard</h3>
                  <p className="text-xs text-gray-400">Current Campaign: <span className="text-orange-400 font-bold">September 2 Remember Challenge</span></p>
                </div>
                <span className="text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full">
                  10 PTS / Check-in
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-[#0a0a0c] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Check-ins</th>
                      <th className="py-3 px-4">Points</th>
                      <th className="py-3 px-4 text-right">Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-medium">
                    {loadingStats ? (
                      [1, 2, 3].map((n) => (
                        <tr key={n} className="animate-pulse">
                          <td className="py-3.5 px-4"><div className="h-3.5 w-8 bg-gray-800 rounded" /></td>
                          <td className="py-3.5 px-4"><div className="h-3.5 w-28 bg-gray-800 rounded" /></td>
                          <td className="py-3.5 px-4"><div className="h-3.5 w-20 bg-gray-800 rounded" /></td>
                          <td className="py-3.5 px-4"><div className="h-3.5 w-16 bg-gray-800 rounded" /></td>
                          <td className="py-3.5 px-4 text-right"><div className="h-3.5 w-20 bg-gray-800 rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                          No campaign leaderboard entries recorded yet.
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((item) => (
                        <tr key={item.rank} className="hover:bg-gray-800/30 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-orange-400">#{item.rank}</td>
                          <td className="py-3.5 px-4 font-bold text-white">{item.name}</td>
                          <td className="py-3.5 px-4 font-mono text-gray-300">{item.checkIns} Sessions</td>
                          <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">{item.points} PTS</td>
                          <td className="py-3.5 px-4 text-right font-bold text-gray-300">{item.badge || '--'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* Record Gym Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#121217] border border-gray-800 rounded-3xl p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition text-xs"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Gym Financial Ledger</span>
              <h3 className="text-2xl font-extrabold text-white">Record Gym Payment</h3>
              <p className="text-xs text-gray-400 mt-0.5">Record member subscription renewals, day passes, or offline POS receipts.</p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Transaction Type</label>
                  <select
                    value={paymentForm.transactionType}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs font-semibold focus:border-orange-500 outline-none"
                  >
                    <option value="SUBSCRIPTION_RENEWAL">Subscription Renewal</option>
                    <option value="DAY_PASS">Day Pass (NGN 5,000)</option>
                    <option value="REGISTRATION">Member Registration (NGN 15,440)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs font-semibold focus:border-orange-500 outline-none"
                  >
                    <option value="POS">POS Terminal</option>
                    <option value="BANK_TRANSFER">Bank Transfer (Default)</option>
                    <option value="WALLET">Gym Wallet</option>
                    <option value="ONLINE">Online Payment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Bank Destination Account</label>
                <select
                  value={paymentForm.accountId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, accountId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs font-semibold focus:border-orange-500 outline-none"
                >
                  <option value="1">Guaranty Trust Bank - Gym Primary Account (0123456789)</option>
                  <option value="2">Zenith Bank - Operations Account (9876543210)</option>
                </select>
              </div>

              {/* Pricing Plan Selector Grid */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300 uppercase">Select Pricing Plan</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {availablePlans.map((plan) => {
                    const isSelected = paymentForm.pricingPlanUid === plan.uid;
                    return (
                      <div
                        key={plan.uid}
                        onClick={() =>
                          setPaymentForm({
                            ...paymentForm,
                            pricingPlanUid: plan.uid,
                            amount: plan.price.toString(),
                          })
                        }
                        className={`p-3.5 rounded-2xl border cursor-pointer transition ${isSelected
                          ? 'bg-orange-500/10 border-orange-500 text-white shadow-lg'
                          : 'bg-[#070709] border-gray-800 hover:border-gray-700 text-gray-300'
                          }`}
                      >
                        <p className="font-extrabold text-xs text-white">{plan.name}</p>
                        <p className="text-sm font-black text-orange-400 mt-1">₦{plan.price.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{plan.subText}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Amount (NGN)</label>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-sm font-mono focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Reference / POS TID</label>
                  <input
                    type="text"
                    placeholder="e.g. POS-889120"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional payment notes..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs focus:border-orange-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-xs font-semibold text-white hover:bg-gray-700"
                >
                  Cancel
                </button>

                {paymentForm.paymentMethod === 'ONLINE' ? (
                  <button
                    type="button"
                    onClick={handleOnlinePayment}
                    disabled={paymentLoading || !paymentForm.amount}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-black text-xs transition shadow-lg shadow-emerald-500/20"
                  >
                    {paymentLoading ? 'Initializing...' : `Pay ₦${Number(paymentForm.amount || 0).toLocaleString()} Securely`}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={paymentLoading || !paymentForm.amount}
                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20"
                  >
                    {paymentLoading ? 'Recording...' : `Record ₦${Number(paymentForm.amount || 0).toLocaleString()} Payment`}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
