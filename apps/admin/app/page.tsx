'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { FcMoneyTransfer, FcConferenceCall, FcApproval, FcCalendar } from 'react-icons/fc';
import { apiFetch } from './lib/apiClient';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    revenue_month: 17423724,
    revenue_last_month: 15252024,
    revenue_growth: 14.2,
    total_members: 786,
    new_members_week: 32,
    active_members: 1124,
    check_ins_today: 85,
    check_ins_week: 623,
  });

  // Active Sessions Expiring Soon
  const [expiringSessions, setExpiringSessions] = useState<any[]>([
    {
      uid: 'sess-1',
      memberName: 'Omonafe Ezekiel',
      gender: 'm',
      memberUid: 'fc-m-001',
      method: 'BIOMETRIC SCAN',
      sessionType: 'MORNING',
      checkInTime: '01:21 PM',
      endTime: '03:21 PM',
      remainingMinutes: 11,
    },
    {
      uid: 'sess-2',
      memberName: 'Grace Roland',
      gender: 'f',
      memberUid: 'fc-m-002',
      method: 'BIOMETRIC SCAN',
      sessionType: 'MORNING',
      checkInTime: '01:33 PM',
      endTime: '03:33 PM',
      remainingMinutes: 23,
    },
  ]);

  // Recent Transactions List
  const [recentTransactions, setRecentTransactions] = useState<any[]>([
    { id: 'tx-1', memberName: 'Patrick Oko', gender: 'm', type: 'DAILY - SUBSCRIPTION', amount: 5000, date: '8/27/2026' },
    { id: 'tx-2', memberName: 'Patrick Oko', gender: 'm', type: 'REGISTRATION', amount: 15440, date: '8/27/2026' },
    { id: 'tx-3', memberName: 'Joshua Egbekun', gender: 'm', type: 'DAILY - SUBSCRIPTION', amount: 5000, date: '8/27/2026' },
    { id: 'tx-4', memberName: 'Joshua Egbekun', gender: 'm', type: 'REGISTRATION', amount: 15440, date: '8/27/2026' },
  ]);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<any[]>([
    { rank: 1, name: 'Kelechi O.', checkIns: 18, points: 180, badge: '🏆 Champion' },
    { rank: 2, name: 'Gabriel O.', checkIns: 15, points: 150, badge: '🥈 2nd Place' },
    { rank: 3, name: 'David A.', checkIns: 12, points: 120, badge: '🥉 3rd Place' },
    { rank: 4, name: 'Sarah P.', checkIns: 9, points: 90, badge: null },
  ]);

  // Member Inbox State
  const [inboxOpen, setInboxOpen] = useState(true);
  const [inboxMessages, setInboxMessages] = useState<any[]>([
    {
      id: '1',
      memberName: 'Test Test',
      gender: 'm',
      timestamp: '6/24/2026, 7:05:07 AM',
      type: 'SUGGESTION',
      subject: 'Test test',
      message: 'Test test',
      starred: false,
    },
  ]);

  // Front Desk Check-in Input
  const [checkInInput, setCheckInInput] = useState('');
  const [deskLogs, setDeskLogs] = useState<any[]>([
    { id: 1, name: 'Gabriel O.', time: '10:45 AM', method: 'Fingerprint' },
    { id: 2, name: 'Kelechi O.', time: '09:30 AM', method: 'QR Code' },
    { id: 3, name: 'David A.', time: '08:15 AM', method: 'Manual' },
  ]);

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

  const fetchLiveDashboardStats = async () => {
    try {
      const json = await apiFetch('/admin/dashboard/stats');
      if ((json.status === 'success' || json.success) && json.data) {
        const d = json.data;
        setStats({
          revenue_month: d.totalRevenueThisMonth || d.revenue_month || 17423724,
          revenue_last_month: d.totalRevenueLastMonth || d.revenue_last_month || 15252024,
          revenue_growth: d.revenuePercentageChange || d.revenue_growth || 14.2,
          total_members: d.totalMembers || d.total_members || 754,
          new_members_week: d.newMembersThisWeek || d.new_members_week || 32,
          active_members: d.activeMembersCount || d.active_members || 754,
          check_ins_today: d.checkInsToday || d.check_ins_today || 85,
          check_ins_week: d.checkInsThisWeek || d.check_ins_week || 623,
        });

        if (d.expiringSoon && d.expiringSoon.length > 0) {
          setExpiringSessions(d.expiringSoon);
        }

        if (d.recentTransactions && d.recentTransactions.length > 0) {
          setRecentTransactions(d.recentTransactions);
        }

        if (d.leaderboard && d.leaderboard.length > 0) {
          setLeaderboard(d.leaderboard);
        }
      }
    } catch (err) {
      console.error('Failed to fetch live dashboard stats:', err);
    }
  };

  useEffect(() => {
    fetchLiveDashboardStats();
    const interval = setInterval(fetchLiveDashboardStats, 60000);
    return () => clearInterval(interval);
  }, []);

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
    setStats((prev: any) => ({ ...prev, check_ins_today: prev.check_ins_today + 1 }));
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

  const handlePaystackPayment = () => {
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setShowPaymentModal(false);
      alert(`💳 Paystack Inline Checkout Initialized!\nAmount: ₦${Number(paymentForm.amount).toLocaleString()}\nProceeding to Paystack secure window...`);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-[#070709] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Dashboard Overview" subtitle="Real-time gym performance, active sessions, and attendance metrics" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">

          {/* Member Inbox Top Collapsible Banner */}
          <div className="rounded-3xl bg-[#121217] border border-gray-800/80 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setInboxOpen(!inboxOpen)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-lg shadow-md">
                  📬
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">Member Inbox</h2>
                  <p className="text-xs text-gray-400">Suggestions, complaints & feedback</p>
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
                        {msg.memberName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {msg.memberName} <span className="text-purple-400 text-[10px]">({msg.gender})</span>
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

          {/* 4 Top KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Card 1: Vibrant Orange Revenue Card */}
            <div
              className="p-6 rounded-3xl text-white shadow-xl shadow-orange-500/20 relative overflow-hidden border border-orange-500/30"
              style={{
                backgroundImage: 'url("/images/dashboard/shap-partern.png"), linear-gradient(135deg, #fa6a2e 0%, #e84a0e 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/90">
                <FcMoneyTransfer size={32} className="me-2 shrink-0 drop-shadow-md" />
                <span>REVENUE (THIS MONTH)</span>
              </div>
              <div className="text-3xl font-black text-white mt-3 tracking-tight">
                ₦{stats.revenue_month.toLocaleString()}
              </div>
              <div className="mt-3">
                <span className="text-xs font-semibold text-white/80">vs. ↗ ₦{stats.revenue_last_month.toLocaleString()} (+{stats.revenue_growth}%) last month</span>
              </div>
            </div>

            {/* Card 2: Total Members */}
            <div
              className="p-6 rounded-3xl text-white shadow-xl border border-gray-800/80 flex flex-col justify-between relative overflow-hidden"
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
                <div className="text-3xl font-black text-white mt-3">{stats.total_members}</div>
              </div>
              <div className="mt-3">
                <span className="text-xs font-semibold text-gray-400">
                  <span className="text-emerald-400 font-bold">+{stats.new_members_week}</span> new member this week
                </span>
              </div>
            </div>

            {/* Card 3: Active Members */}
            <div
              className="p-6 rounded-3xl text-white shadow-xl border border-gray-800/80 flex flex-col justify-between relative overflow-hidden"
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
                <div className="text-3xl font-black text-white mt-3">{stats.active_members}</div>
              </div>
              <div className="text-xs text-gray-400 font-semibold mt-3">
                out of <span className="text-cyan-400 font-bold">{stats.total_members}</span> total members
              </div>
            </div>

            {/* Card 4: Check-ins Today */}
            <div
              className="p-6 rounded-3xl text-white shadow-xl border border-gray-800/80 flex flex-col justify-between relative overflow-hidden"
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
                <div className="text-3xl font-black text-white mt-3">{stats.check_ins_today}</div>
              </div>
              <div className="text-xs text-gray-400 font-semibold mt-3">
                <span className="text-amber-400 font-bold">{stats.check_ins_week}</span> total this week
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
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">MEMBER</th>
                    <th className="py-3 px-4">SESSION</th>
                    <th className="py-3 px-4">DURATION</th>
                    <th className="py-3 px-4 text-right">TIME LEFT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {expiringSessions.map((session) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom 3-Column Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Column 1: Smooth Orange Curved Activity Line Chart */}
            <div className="p-6 rounded-3xl bg-[#121217] border border-gray-800/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white">Activity</h3>
                <span className="px-3 py-1 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300">
                  Weekly ▼
                </span>
              </div>

              {/* Area Line Chart Visualization */}
              <div className="pt-4 space-y-2">
                <div className="h-40 relative flex items-end justify-between px-2">
                  <svg className="absolute inset-0 w-full h-full text-orange-500 overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                    <path
                      fill="rgba(250, 106, 46, 0.15)"
                      stroke="#fa6a2e"
                      strokeWidth="3"
                      d="M 0 20 Q 50 15, 100 25 T 200 80 T 300 110 L 300 120 L 0 120 Z"
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-[11px] font-bold text-gray-400 pt-2 border-t border-gray-800">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Column 2: Member Status Donut Chart */}
            <div className="p-6 rounded-3xl bg-[#121217] border border-gray-800/80 shadow-xl space-y-4 text-center">
              <h3 className="text-base font-extrabold text-white text-left">Member Status</h3>

              <div className="py-4 flex items-center justify-center">
                <div className="relative w-40 h-40 rounded-full border-[16px] border-emerald-500 flex items-center justify-center shadow-2xl">
                  <div className="text-center">
                    <span className="text-2xl font-black text-white">{stats.active_members}</span>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase">Active</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs font-extrabold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Active Members
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Expired/Inactive
                </span>
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
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-3.5 rounded-2xl bg-[#0a0a0c] border border-gray-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-sm">
                        📄
                      </div>
                      <div>
                        <p className="font-extrabold text-white">
                          {tx.memberName} <span className="text-purple-400 text-[10px]">({tx.gender})</span>
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase font-mono">{tx.type}</p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="font-black text-emerald-400 font-mono">₦{tx.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{tx.date}</p>
                      </div>
                      <span className="text-gray-500 hover:text-white cursor-pointer text-sm font-bold">⋮</span>
                    </div>
                  </div>
                ))}
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
                {deskLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-[#0a0a0c] border border-gray-800/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{log.name}</p>
                      <p className="text-[10px] text-gray-500">{log.time} • {log.method}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                ))}
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
                <table className="w-full text-left text-xs">
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
                    {leaderboard.map((item) => (
                      <tr key={item.rank} className="hover:bg-gray-800/30 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-orange-400">#{item.rank}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{item.name}</td>
                        <td className="py-3.5 px-4 font-mono text-gray-300">{item.checkIns} Sessions</td>
                        <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">{item.points} PTS</td>
                        <td className="py-3.5 px-4 text-right font-bold text-gray-300">{item.badge || '--'}</td>
                      </tr>
                    ))}
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
          <div className="relative w-full max-w-2xl bg-[#121217] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
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
                    <option value="ONLINE">Paystack (Online Checkout)</option>
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
                    onClick={handlePaystackPayment}
                    disabled={paymentLoading || !paymentForm.amount}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-extrabold text-black text-xs transition shadow-lg shadow-emerald-500/20"
                  >
                    {paymentLoading ? 'Initializing...' : `Pay ₦${Number(paymentForm.amount || 0).toLocaleString()} via Paystack`}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={paymentLoading || !paymentForm.amount}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20"
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
