'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    total_members: 142,
    new_members_week: 12,
    check_ins_today: 28,
    check_ins_week: 185,
    revenue_today: 148500,
    total_revenue_gross: 312500,
  });

  // Active Sessions Expiring Soon
  const [expiringSessions, setExpiringSessions] = useState<any[]>([
    { uid: 'sess-1', memberName: 'Kelechi Oshoname', gender: 'male', memberUid: 'fc-m-001', method: 'FINGERPRINT', sessionType: 'MORNING', checkInTime: '08:15 AM', endTime: '10:15 AM', remainingMinutes: 15 },
    { uid: 'sess-2', memberName: 'Gabriel Omokpoga', gender: 'male', memberUid: 'fc-m-002', method: 'QR_CODE', sessionType: 'MORNING', checkInTime: '09:00 AM', endTime: '11:00 AM', remainingMinutes: 28 },
  ]);

  // Activity Chart Range Filter
  const [activityRange, setActivityRange] = useState('weekly');

  // Member Feedback & Receptionist Messages
  const [feedbackOpen, setFeedbackOpen] = useState(true);
  const [feedbackMessages, setFeedbackMessages] = useState<any[]>([
    { id: '1', memberName: 'Kelechi O.', type: 'COMPLAINT', subject: 'Locker 14 Hinge Issue', message: 'The locker door hinge on unit 14 needs oiling.', dateSent: '10 mins ago', read: false },
    { id: '2', memberName: 'Gabriel O.', type: 'SUGGESTION', subject: 'More Kettlebells', message: 'Please add 24kg kettlebells to the functional area.', dateSent: '1 hour ago', read: false },
    { id: '3', memberName: 'David A.', type: 'ACKNOWLEDGEMENT', subject: 'Great Personal Trainer', message: 'Coach Kelechi was excellent during morning session today!', dateSent: 'Yesterday', read: true },
  ]);

  // Leaderboard State
  const [leaderboard] = useState<any[]>([
    { rank: 1, name: 'Kelechi O.', checkIns: 18, points: 180, badge: '🏆 Champion' },
    { rank: 2, name: 'Gabriel O.', checkIns: 15, points: 150, badge: '🥈 2nd Place' },
    { rank: 3, name: 'David A.', checkIns: 12, points: 120, badge: '🥉 3rd Place' },
    { rank: 4, name: 'Sarah P.', checkIns: 9, points: 90, badge: null },
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
    amount: '65000',
    durationMonths: '1',
    reference: '',
    notes: '',
  });

  const availablePlans = [
    { uid: 'plan-1', name: 'Starter Monthly', price: 25000, subText: 'Standard Gym Access' },
    { uid: 'plan-2', name: 'VIP Quarterly', price: 65000, subText: 'Gym + Trainer + Sauna' },
    { uid: 'plan-3', name: 'Annual All-Access', price: 220000, subText: '365 Days Unlimited Access' },
  ];

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

  const handleMarkAsRead = (id: string) => {
    setFeedbackMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
    );
  };

  const handleDeleteFeedback = (id: string) => {
    setFeedbackMessages((prev) => prev.filter((msg) => msg.id !== id));
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

  const unreadFeedbackCount = feedbackMessages.filter((m) => !m.read).length;

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Dashboard Overview" subtitle="Real-time gym performance, active sessions, and attendance metrics" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">
          {/* Top Actions & Modal Trigger Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#0f0f13] border border-gray-800 p-4 rounded-2xl gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-white">Overview Console</h2>
              <p className="text-xs text-gray-400">Manage member entrance, live session timeouts, and revenue transactions.</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFeedbackOpen(!feedbackOpen)}
                className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-xs font-bold text-gray-300 flex items-center gap-2 transition"
              >
                📬 Member Feedback
                {unreadFeedbackCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500 text-black text-[10px] font-extrabold animate-pulse">
                    {unreadFeedbackCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 font-extrabold text-black text-xs transition shadow-lg shadow-orange-500/20"
              >
                + Record Gym Payment
              </button>
              <Link
                href="/check-in"
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 font-bold text-white text-xs transition"
              >
                🚪 Open Entrance Kiosk
              </Link>
            </div>
          </div>

          {/* 4 Stat KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Members</span>
              <div className="text-3xl font-black text-white mt-1">{stats.total_members}</div>
              <span className="text-xs text-emerald-400 font-bold mt-1 block">↑ 12% this month</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">New Members This Week</span>
              <div className="text-3xl font-black text-orange-400 mt-1">{stats.new_members_week}</div>
              <span className="text-xs text-gray-400 font-medium mt-1 block">90.4% renewal rate</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Check-ins Today</span>
              <div className="text-3xl font-black text-blue-400 mt-1">{stats.check_ins_today}</div>
              <span className="text-xs text-gray-400 font-medium mt-1 block">Peak: 08:00 - 10:00 AM</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f0f13] border border-gray-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Check-ins This Week</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">{stats.check_ins_week}</div>
              <span className="text-xs text-gray-400 font-mono mt-1 block">Revenue: ₦{stats.revenue_today.toLocaleString()}</span>
            </div>
          </div>

          {/* Financial Performance & Payment Split Widget */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Gym Financial Performance</span>
                <h3 className="text-xl font-extrabold text-white">Total Gross Revenue: ₦{stats.total_revenue_gross.toLocaleString()}</h3>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-xl bg-gray-900 border border-gray-800 text-gray-300">
                  Bank Transfer: <span className="text-emerald-400 font-mono">₦25,000</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-gray-900 border border-gray-800 text-gray-300">
                  POS Receipts: <span className="text-white font-mono">₦67,500</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-gray-900 border border-gray-800 text-gray-300">
                  Paystack Online: <span className="text-orange-400 font-mono">₦220,000</span>
                </span>
              </div>
            </div>
          </div>

          {/* LIVE: Sessions Expiring Soon Widget */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  Sessions Expiring Soon
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-black uppercase">
                    LIVE
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelAllActive}
                  className="px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold hover:bg-orange-500/20 transition"
                >
                  End All Active
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-500/20 transition"
                >
                  Clear History
                </button>
                <Link
                  href="/check-ins"
                  className="px-3 py-1.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700 transition"
                >
                  View All →
                </Link>
              </div>
            </div>

            {/* Expiring Sessions Table */}
            {expiringSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Session</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-right">Time Left & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-medium">
                    {expiringSessions.map((session) => (
                      <tr key={session.uid} className="hover:bg-gray-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-xs">
                              {session.memberName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{session.memberName}</p>
                              <span className="text-[10px] text-gray-400 uppercase font-mono">{session.method}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                            {session.sessionType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-300">
                          {session.checkInTime} - {session.endTime}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-mono font-bold text-xs animate-pulse">
                              {session.remainingMinutes}m left
                            </span>
                            <button
                              onClick={() => handleCancelSession(session.uid)}
                              className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-red-500/30 text-gray-400 hover:text-red-400 flex items-center justify-center transition"
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
            ) : (
              <div className="p-8 text-center bg-[#070709] rounded-2xl border border-dashed border-gray-800 space-y-1">
                <p className="text-sm font-bold text-white">All quiet right now</p>
                <p className="text-xs text-gray-400">No member sessions expiring within 30 minutes.</p>
              </div>
            )}
          </div>

          {/* Activity Bar Chart & Progress Analytics Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity Bar Chart */}
            <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Activity Overview</h3>
                  <p className="text-xs text-gray-400">Member entrance volume trends over time.</p>
                </div>
                <select
                  value={activityRange}
                  onChange={(e) => setActivityRange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs font-semibold outline-none"
                >
                  <option value="weekly">Weekly Range</option>
                  <option value="monthly">Monthly Range</option>
                  <option value="yearly">Yearly Range</option>
                </select>
              </div>

              {/* Chart Visual Graphic */}
              <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                {[
                  { day: 'Mon', count: 24, height: '60%' },
                  { day: 'Tue', count: 32, height: '80%' },
                  { day: 'Wed', count: 45, height: '100%' },
                  { day: 'Thu', count: 28, height: '70%' },
                  { day: 'Fri', count: 38, height: '90%' },
                  { day: 'Sat', count: 50, height: '100%' },
                  { day: 'Sun', count: 18, height: '45%' },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-400">{bar.count}</span>
                    <div
                      style={{ height: bar.height }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-amber-500 hover:from-orange-600 transition"
                    />
                    <span className="text-[10px] font-bold text-gray-400">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscriptions Access Tier Counter Pills & Progress */}
            <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Membership Access Tiers</h3>
                  <p className="text-xs text-gray-400">Active members categorized by subscription tier.</p>
                </div>
                <Link href="/subscription-types" className="text-xs font-extrabold text-orange-400 hover:underline">
                  See all plans →
                </Link>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[#070709] border border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                      🥇
                    </div>
                    <div>
                      <p className="font-extrabold text-white text-xs">Gold Tier (Monthly)</p>
                      <p className="text-[10px] text-gray-400">Standard Gym Access</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-orange-400 font-mono">28 Members</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070709] border border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-300/10 text-gray-300 border border-gray-400/30 flex items-center justify-center font-bold text-xs">
                      💎
                    </div>
                    <div>
                      <p className="font-extrabold text-white text-xs">Platinum Tier (VIP Quarterly)</p>
                      <p className="text-[10px] text-gray-400">Gym + Trainer Consult + Sauna</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-orange-400 font-mono">12 Members</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#070709] border border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                      👑
                    </div>
                    <div>
                      <p className="font-extrabold text-white text-xs">Diamond Tier (Annual All-Access)</p>
                      <p className="text-[10px] text-gray-400">365 Days Unlimited Access</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-orange-400 font-mono">5 Members</span>
                </div>
              </div>
            </div>
          </div>

          {/* Member Feedback Reception Feed Widget (Collapsible) */}
          {feedbackOpen && (
            <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    📬 Reception & Member Feedback Feed
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-orange-400 text-[10px] font-bold">
                      {feedbackMessages.length} Messages
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">Live reception desk complaints, suggestions, and member acknowledgements.</p>
                </div>

                <button
                  onClick={() => setFeedbackOpen(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Hide Feed ✕
                </button>
              </div>

              <div className="space-y-3">
                {feedbackMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                      !msg.read ? 'bg-orange-500/5 border-orange-500/30' : 'bg-[#070709] border-gray-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{msg.memberName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            msg.type === 'COMPLAINT'
                              ? 'bg-red-500/20 text-red-400'
                              : msg.type === 'SUGGESTION'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {msg.type}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">{msg.dateSent}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-200 mt-1">{msg.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{msg.message}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!msg.read && (
                        <button
                          onClick={() => handleMarkAsRead(msg.id)}
                          className="px-3 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition"
                        >
                          ✓ Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFeedback(msg.id)}
                        className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Front Desk Live Desk & Leaderboard Split Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Front Desk Desk Quick Scanner / Entry Form */}
            <div className="lg:col-span-1 p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
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
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white text-xs font-medium focus:border-orange-500 outline-none"
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
                  <div key={log.id} className="p-3 rounded-xl bg-[#070709] border border-gray-800/80 flex items-center justify-between text-xs">
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
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
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
                  <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
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
                    <option value="DAY_PASS">Day Pass (NGN 2,500)</option>
                    <option value="PERSONAL_TRAINING">Personal Training Session</option>
                    <option value="SUPPLEMENTS">Supplements / Drinks</option>
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
                        className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                          isSelected
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
