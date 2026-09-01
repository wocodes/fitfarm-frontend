'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';

interface CheckInDto {
  id: number;
  uid: string;
  memberName: string;
  gender?: string;
  memberUid?: string;
  profilePictureUrl?: string;
  method?: string;
  status: string;
  denialReason?: string;
  sessionType?: string;
  checkInTime?: string;
  endTime?: string;
  checkOutTime?: string;
  totalMinutesSpent: number;
  remainingMinutes: number;
}

interface MemberOption {
  id: number;
  uid: string;
  uuid?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  member_number?: string;
  photo_url?: string;
}

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckInDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 20;

  // Filters
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Ticker for live remaining time countdown
  const [, setTicker] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulation Modal State
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [membersList, setMembersList] = useState<MemberOption[]>([]);
  const [simMemberUid, setSimMemberUid] = useState('');
  const [simDateTime, setSimDateTime] = useState('');
  const [simMethod, setSimMethod] = useState('ADMIN_SIMULATION');
  const [simSubmitting, setSimSubmitting] = useState(false);

  // Fingerprint Result Popup Modal State
  const [fingerprintResult, setFingerprintResult] = useState<{
    show: boolean;
    granted: boolean;
    memberName: string;
    message: string;
    planName?: string;
    photoUrl?: string;
  }>({
    show: false,
    granted: false,
    memberName: '',
    message: '',
  });

  const getDefaultSimDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const fetchCheckIns = useCallback(async (pageNum = 0) => {
    setLoading(true);
    try {
      let url = `/admin/checkins/all?page=${pageNum}&size=${PAGE_SIZE}`;
      if (filterText) url += `&search=${encodeURIComponent(filterText)}`;
      if (filterStatus) url += `&status=${encodeURIComponent(filterStatus)}`;
      if (filterStartDate) url += `&startDate=${encodeURIComponent(filterStartDate)}`;
      if (filterEndDate) url += `&endDate=${encodeURIComponent(filterEndDate)}`;

      const res = await apiFetch(url);
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.content || [];
        const total = res.data.totalElements ?? list.length;
        const pages = res.data.totalPages ?? Math.ceil(total / PAGE_SIZE);

        setCheckIns(list);
        setTotalElements(total);
        setTotalPages(pages);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to fetch check-in logs:', err);
    } finally {
      setLoading(false);
    }
  }, [filterText, filterStatus, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchCheckIns(0);

    intervalRef.current = setInterval(() => setTicker((t) => t + 1), 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchCheckIns]);

  // Open Simulation Modal
  const handleOpenSimulateModal = async () => {
    setSimDateTime(getDefaultSimDateTime());
    setShowSimulateModal(true);

    if (membersList.length === 0) {
      try {
        const res = await apiFetch('/admin/members?page=0&size=500');
        if (res.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : res.data.content || [];
          setMembersList(list);
          if (list.length > 0) {
            setSimMemberUid(list[0].uid || list[0].uuid || String(list[0].id));
          }
        }
      } catch (err) {
        console.error('Failed to load members for simulation dropdown:', err);
      }
    }
  };

  // Trigger Simulated Check-In
  const handleTriggerSimulatedCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMemberUid) {
      alert('Please select a member first.');
      return;
    }

    setSimSubmitting(true);
    try {
      const checkInIso = simDateTime ? new Date(simDateTime).toISOString() : new Date().toISOString();
      const res = await apiFetch('/admin/checkins/simulate', {
        method: 'POST',
        body: JSON.stringify({
          memberUid: simMemberUid,
          checkInTime: checkInIso,
          method: simMethod,
        }),
      });

      if (res.success) {
        setShowSimulateModal(false);
        fetchCheckIns(0);
      } else {
        alert(res.message || 'Failed to simulate check-in.');
      }
    } catch (err: any) {
      alert(err.message || 'Error simulating check-in.');
    } finally {
      setSimSubmitting(false);
    }
  };

  // Trigger Fingerprint Scan Simulation
  const handleTriggerFingerprintScan = async (memberUidParam?: string) => {
    const targetUid = memberUidParam || simMemberUid;
    if (!targetUid) {
      alert('Please select a member first.');
      return;
    }

    setSimSubmitting(true);
    try {
      const res = await apiFetch('/admin/checkins/simulate-fingerprint', {
        method: 'POST',
        body: JSON.stringify({ memberUid: targetUid }),
      });

      if (res.success && res.data) {
        const d = res.data;
        setFingerprintResult({
          show: true,
          granted: d.accessGranted ?? true,
          memberName: d.memberName || 'Member',
          message: d.message || 'Access Granted - Active Membership',
          planName: d.subscriptionType || 'Standard Plan',
          photoUrl: d.profilePictureUrl,
        });

        setShowSimulateModal(false);
        fetchCheckIns(0);
      } else {
        alert(res.message || 'Failed to simulate fingerprint scan.');
      }
    } catch (err: any) {
      alert(err.message || 'Error executing fingerprint scan.');
    } finally {
      setSimSubmitting(false);
    }
  };

  // Cancel Individual Session
  const handleCancelSession = async (uid: string) => {
    const isConfirmed = window.confirm("Are you sure you want to end this member's active session?");
    if (!isConfirmed) return;

    try {
      const res = await apiFetch(`/admin/checkins/${uid}/cancel`, { method: 'POST' });
      if (res.success) {
        fetchCheckIns(page);
      } else {
        alert(res.message || 'Failed to cancel session.');
      }
    } catch (err: any) {
      alert(err.message || 'Error cancelling session.');
    }
  };

  // Cancel All Active Sessions
  const handleCancelAllActive = async () => {
    const isConfirmed = window.confirm('WARNING: This will terminate EVERY active session currently in the gym. Continue?');
    if (!isConfirmed) return;

    try {
      const res = await apiFetch('/admin/checkins/cancel-all-active', { method: 'POST' });
      if (res.success) {
        fetchCheckIns(page);
      } else {
        alert(res.message || 'Failed to end sessions.');
      }
    } catch (err: any) {
      alert(err.message || 'Error ending sessions.');
    }
  };

  // Clear All Attendance History
  const handleClearAllHistory = async () => {
    const isConfirmed = window.confirm('DANGER: This will delete ALL check-in logs from the system permanently. Are you absolutely sure?');
    if (!isConfirmed) return;

    try {
      const res = await apiFetch('/admin/checkins/clear-all', { method: 'DELETE' });
      if (res.success) {
        fetchCheckIns(0);
      } else {
        alert(res.message || 'Failed to clear history.');
      }
    } catch (err: any) {
      alert(err.message || 'Error clearing history.');
    }
  };

  // Active Count
  const activeSessionsCount = checkIns.filter((c) => c.status === 'ACTIVE').length;

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Attendance & Access Control Logs"
          subtitle="Real-time entrance verification, live session countdown, biometric simulations, and check-in history"
        />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Top Banner & Control Actions */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Entrance Access Control</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  ● Live Hardware Kiosk
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">Gym Member Check-In Register</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Total Logs: <span className="text-white font-mono font-bold">{totalElements.toLocaleString()}</span> | Active in Gym Now:{' '}
                <span className="text-emerald-400 font-mono font-bold">{activeSessionsCount}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleOpenSimulateModal}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center gap-1.5"
              >
                <span>🖐️ Simulate Check-In</span>
              </button>

              <button
                onClick={handleCancelAllActive}
                className="px-4 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold text-xs transition"
              >
                <span>End All Active Sessions</span>
              </button>

              <button
                onClick={handleClearAllHistory}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs transition"
              >
                <span>🗑️ Clear History</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Search Member</label>
                <input
                  type="text"
                  placeholder="Name, email, phone, number..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070709] border border-gray-800 text-white placeholder-gray-500 outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Session Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active Sessions Only</option>
                  <option value="COMPLETED">Completed Sessions</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none"
                />
              </div>
            </div>

            {(filterText || filterStatus || filterStartDate || filterEndDate) && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    setFilterText('');
                    setFilterStatus('');
                    setFilterStartDate('');
                    setFilterEndDate('');
                  }}
                  className="text-xs text-orange-400 hover:underline font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="overflow-x-auto min-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400 text-xs">
                  <div className="inline-block w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading attendance check-ins...
                </div>
              ) : checkIns.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <div className="text-4xl">🚪</div>
                  <h3 className="text-sm font-bold text-gray-300">No check-in logs found</h3>
                  <p className="text-xs text-gray-500">Try adjusting your search criteria or trigger a simulated check-in.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-12">S/N</th>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Check-In Time</th>
                      <th className="py-3 px-4">Scan Method</th>
                      <th className="py-3 px-4">Duration Spent</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-medium">
                    {checkIns.map((row, index) => {
                      const isActive = row.status === 'ACTIVE';
                      const checkInFormatted = row.checkInTime
                        ? new Date(row.checkInTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                        : '—';

                      return (
                        <tr key={row.id} className="hover:bg-gray-800/30 transition">
                          <td className="py-3.5 px-4 text-gray-500 font-mono">
                            {page * PAGE_SIZE + index + 1}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                            {row.profilePictureUrl ? (
                              <img
                                src={row.profilePictureUrl}
                                alt={row.memberName}
                                className="w-7 h-7 rounded-full object-cover border border-orange-500/30"
                              />
                            ) : (
                              <span className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                                {row.memberName ? row.memberName.slice(0, 2).toUpperCase() : 'MB'}
                              </span>
                            )}
                            <span>{row.memberName}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-gray-300">{checkInFormatted}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 font-mono text-[10px] font-bold">
                              {row.method || 'MANUAL'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                            {row.totalMinutesSpent > 0 ? `${row.totalMinutesSpent} mins` : '< 1 min'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse'
                                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                              }`}
                            >
                              {isActive ? 'Active Session' : 'Completed'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isActive && (
                              <button
                                onClick={() => handleCancelSession(row.uid || String(row.id))}
                                className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px]"
                                title="End Session"
                              >
                                End Session
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-800 text-xs">
                <span className="text-gray-400">
                  Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements.toLocaleString()} records
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => fetchCheckIns(page - 1)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 disabled:opacity-40 text-gray-300 font-semibold"
                  >
                    Previous
                  </button>

                  <span className="px-3 py-1.5 font-mono text-orange-400 font-bold">
                    Page {page + 1} of {totalPages}
                  </span>

                  <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => fetchCheckIns(page + 1)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 disabled:opacity-40 text-gray-300 font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal 1: Simulation Options Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-extrabold">Simulate Member Access Check-In</h3>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTriggerSimulatedCheckIn} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Select Member</label>
                <select
                  value={simMemberUid}
                  onChange={(e) => setSimMemberUid(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold outline-none"
                  required
                >
                  {membersList.map((m) => {
                    const uid = m.uid || m.uuid || String(m.id);
                    const name = m.first_name && m.last_name ? `${m.first_name} ${m.last_name}` : m.name || m.email;
                    return (
                      <option key={uid} value={uid}>
                        {name} ({m.member_number || m.email || 'Member'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Check-In Date & Time</label>
                <input
                  type="datetime-local"
                  value={simDateTime}
                  onChange={(e) => setSimDateTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase tracking-wider">Verification Method</label>
                <select
                  value={simMethod}
                  onChange={(e) => setSimMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-gray-800 text-white font-bold outline-none"
                >
                  <option value="ADMIN_SIMULATION">Admin Simulation</option>
                  <option value="FINGERPRINT">Fingerprint Scanner</option>
                  <option value="QR_SCAN">Mobile App QR Scan</option>
                  <option value="MANUAL">Manual Front Desk Entry</option>
                </select>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleTriggerFingerprintScan()}
                  disabled={simSubmitting}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition"
                >
                  🖐️ Simulate Instant Hardware Fingerprint Scan
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold"
                  disabled={simSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={simSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-white shadow-lg shadow-orange-500/20"
                >
                  {simSubmitting ? 'Logging...' : 'Log Check-In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Fingerprint Scan Access Result Popup */}
      {fingerprintResult.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              🖐️
            </div>

            <div>
              <h3 className="text-xl font-black text-white">{fingerprintResult.memberName}</h3>
              <p className="text-xs font-bold text-emerald-400 mt-1">{fingerprintResult.message}</p>
              <p className="text-xs text-gray-400 mt-0.5">Plan: {fingerprintResult.planName}</p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setFingerprintResult({ ...fingerprintResult, show: false })}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-white text-xs shadow-lg shadow-orange-500/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
