'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiFetch } from '../lib/apiClient';

interface StaffAttendanceRecord {
  id: number;
  uid: string;
  staffName: string;
  staff_name?: string;
  username: string;
  email?: string;
  date: string;
  checkedInAt: string;
  clock_in?: string;
  clock_out?: string;
  status: 'active' | 'completed' | string;
  notes?: string;
}

export default function StaffAttendancePage() {
  const [records, setRecords] = useState<StaffAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const PAGE_SIZE = 20;

  // Staff Quick Clock State
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [clockLoading, setClockLoading] = useState(false);

  // Staff QR Code Modal State
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrLink, setQrLink] = useState('');
  const [qrLoading, setQrLoading] = useState(false);

  const fetchAttendance = useCallback(async (page = 1, date = '') => {
    setLoading(true);
    try {
      let url = `/admin/staff-attendance?page=${page - 1}&size=${PAGE_SIZE}`;
      if (date) url += `&date=${date}`;

      const res = await apiFetch(url);
      if (res.success && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data.content || [];
        const total = res.data.totalElements ?? list.length;
        setRecords(list);
        setTotalRows(total);

        // Check if there is an active session for quick clock button
        const active = list.find((item: StaffAttendanceRecord) => item.status === 'active');
        if (active) {
          setIsClockedIn(true);
          setActiveSessionId(active.id);
        } else {
          setIsClockedIn(false);
          setActiveSessionId(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch staff attendance records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance(currentPage, dateFilter);
  }, [fetchAttendance, currentPage, dateFilter]);

  const handleToggleClock = async () => {
    setClockLoading(true);
    try {
      if (isClockedIn && activeSessionId) {
        // Clock Out
        const res = await apiFetch(`/admin/staff-attendance/${activeSessionId}/clock-out`, {
          method: 'POST',
        });
        if (res.success) {
          setIsClockedIn(false);
          setActiveSessionId(null);
          fetchAttendance(currentPage, dateFilter);
        } else {
          alert(res.message || 'Failed to clock out.');
        }
      } else {
        // Clock In
        const res = await apiFetch('/admin/staff-attendance/clock-in', {
          method: 'POST',
          body: JSON.stringify({ notes: 'Shift Duty' }),
        });
        if (res.success) {
          setIsClockedIn(true);
          if (res.data && res.data.id) setActiveSessionId(res.data.id);
          fetchAttendance(currentPage, dateFilter);
        } else {
          alert(res.message || 'Failed to clock in.');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Error clocking in/out.');
    } finally {
      setClockLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    setQrLoading(true);
    try {
      const res = await apiFetch('/admin/staff-attendance/qr');
      if (res.success && res.data && res.data.qrLink) {
        setQrLink(res.data.qrLink);
        setShowQRModal(true);
      } else {
        alert(res.message || 'Failed to generate Staff QR link.');
      }
    } catch (err: any) {
      alert(err.message || 'Error generating Staff QR code.');
    } finally {
      setQrLoading(false);
    }
  };

  const qrImageUrl = qrLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrLink)}`
    : '';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Staff Attendance QR Code</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: system-ui, -apple-system, sans-serif;
            background: #fff;
            padding: 40px;
            text-align: center;
            color: #0f172a;
          }
          .logo { font-size: 32px; font-weight: 900; letter-spacing: 2px; margin-bottom: 6px; color: #f97316; }
          .subtitle { font-size: 14px; font-weight: 600; color: #64748b; margin-bottom: 32px; }
          .qr-box {
            border: 3px solid #0f172a;
            border-radius: 24px;
            padding: 28px;
            display: inline-block;
            margin-bottom: 28px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          }
          .qr-box img { display: block; width: 280px; height: 280px; }
          .caption { font-size: 24px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase; }
          .note { font-size: 13px; color: #64748b; font-weight: 500; }
          @media print {
            @page { margin: 0; }
            body { padding: 30px; }
          }
        </style>
      </head>
      <body>
        <div class="logo">FITCLOUD</div>
        <div class="subtitle">Gym Management Portal — Staff Attendance</div>
        <div class="qr-box">
          <img src="${qrImageUrl}" alt="Staff Attendance QR Code" />
        </div>
        <div class="caption">STAFF ATTENDANCE CHECK-IN</div>
        <div class="note">Scan this official QR code with your mobile camera to register shift presence for today</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Staff Attendance & Shift Register"
          subtitle="Track staff shift clock-ins, generate staff check-in QR codes, and audit daily reception duty"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6 max-w-[1600px] mx-auto w-full">
          {/* Quick Clock-in / Clock-out Banner Card */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Shift Receptionist Duty</span>
              <h2 className="text-xl font-extrabold text-white mt-1">Staff Member Shift Control</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Current Shift Status:{' '}
                <span className={isClockedIn ? 'text-emerald-400 font-extrabold' : 'text-gray-400 font-bold'}>
                  {isClockedIn ? '🟢 ON DUTY (Clocked In Active Session)' : '🔴 OFF DUTY'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleGenerateQR}
                disabled={qrLoading}
                className="px-4 py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-bold text-xs transition flex items-center gap-2"
              >
                <span>📱 Generate Staff QR</span>
              </button>

              <button
                onClick={handleToggleClock}
                disabled={clockLoading}
                className={`px-6 py-3 rounded-2xl font-extrabold text-xs transition shadow-lg flex items-center gap-2 ${
                  isClockedIn
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20'
                }`}
              >
                <span>{clockLoading ? 'Processing...' : isClockedIn ? '🔴 Clock Out Shift' : '🟢 Clock In Duty'}</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">Staff Attendance Records</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Showing historical shift check-ins and active duty status
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={dateFilter}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#070709] border border-gray-800 text-white font-medium text-xs outline-none focus:border-orange-500/50"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto min-h-[350px]">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400 text-xs">
                  <div className="inline-block w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading attendance records...
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <div className="text-4xl">⏰</div>
                  <h3 className="text-sm font-bold text-gray-300">No staff attendance records found</h3>
                  <p className="text-xs text-gray-500">
                    {dateFilter ? `No check-ins registered for ${dateFilter}` : 'No staff shift records exist.'}
                  </p>
                </div>
              ) : (
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-12">S/N</th>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Email / Username</th>
                      <th className="py-3 px-4">Shift Date</th>
                      <th className="py-3 px-4">Clock In Time</th>
                      <th className="py-3 px-4">Clock Out Time</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-medium">
                    {records.map((r, index) => {
                      const name = r.staffName || r.staff_name || 'Staff Member';
                      const email = r.username || r.email || 'staff@fitfarmhq.com';
                      const clockInStr = r.clock_in || r.checkedInAt;
                      const clockOutStr = r.clock_out;
                      const isActive = r.status === 'active';

                      return (
                        <tr key={r.id} className="hover:bg-gray-800/30 transition">
                          <td className="py-3.5 px-4 text-gray-500 font-mono">
                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                              {name.slice(0, 2).toUpperCase()}
                            </span>
                            <span>{name}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-gray-300">{email}</td>
                          <td className="py-3.5 px-4 font-mono text-gray-400">{r.date}</td>
                          <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                            {clockInStr ? new Date(clockInStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-- : --'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-gray-400 font-bold">
                            {clockOutStr ? new Date(clockOutStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-- : --'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse'
                                  : 'bg-gray-800 text-gray-300'
                              }`}
                            >
                              {isActive ? 'ON DUTY (Active)' : 'Completed'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {totalRows > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-800 text-xs">
                <span className="text-gray-400">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalRows)} of {totalRows} records
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 disabled:opacity-40 text-gray-300 font-semibold"
                  >
                    Previous
                  </button>

                  <span className="px-3 py-1.5 font-mono text-orange-400 font-bold">Page {currentPage}</span>

                  <button
                    disabled={currentPage * PAGE_SIZE >= totalRows}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
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

      {/* Staff QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#121217] border border-gray-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 text-center animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 text-left">
              <h3 className="text-base font-extrabold">Staff Attendance QR</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Staff members scan this QR code with their smartphone camera to mark attendance for today.
            </p>

            {qrImageUrl && (
              <div className="p-4 bg-white rounded-2xl border border-gray-200 inline-block shadow-lg my-2">
                <img src={qrImageUrl} alt="Staff Attendance QR Code" className="w-[240px] h-[240px] mx-auto" />
                <div className="mt-2 text-xs font-black text-gray-900 uppercase tracking-wider">
                  STAFF ATTENDANCE
                </div>
                <div className="text-[10px] text-gray-500 font-medium">Scan to mark shift presence</div>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-800">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 font-extrabold text-white text-xs shadow-lg shadow-orange-500/20 flex items-center gap-1.5"
              >
                <span>🖨️ Print Staff QR</span>
              </button>

              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
