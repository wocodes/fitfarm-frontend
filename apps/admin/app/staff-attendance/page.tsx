'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function StaffAttendancePage() {
  const [staffLogs, setStaffLogs] = useState<any[]>([
    { id: 1, staffName: 'Gabriel O.', role: 'Owner / Admin', clockIn: '2026-08-27 08:00 AM', clockOut: null, status: 'active', notes: 'Morning Shift Duty' },
    { id: 2, staffName: 'Kelechi O.', role: 'Head Trainer', clockIn: '2026-08-27 07:30 AM', clockOut: '2026-08-27 12:00 PM', status: 'completed', notes: 'Personal Training Session' },
  ]);

  const [isClockedIn, setIsClockedIn] = useState(true);

  const handleToggleClock = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
      setStaffLogs((prev) =>
        prev.map((item) =>
          item.id === 1 ? { ...item, clockOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'completed' } : item
        )
      );
      alert('⏰ You have clocked out successfully.');
    } else {
      setIsClockedIn(true);
      const newShift = {
        id: Date.now(),
        staffName: 'Gabriel O.',
        role: 'Owner / Admin',
        clockIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clockOut: null,
        status: 'active',
        notes: 'Shift Duty',
      };
      setStaffLogs([newShift, ...staffLogs]);
      alert('⏰ You have clocked in successfully.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Staff Attendance & Duty Register" subtitle="Track staff shift clock-ins, clock-outs, and active receptionist duty" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl">
          {/* Clock In / Out Banner Card */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Staff Shift Clock</span>
              <h2 className="text-xl font-extrabold text-white mt-1">Gabriel O. (Owner / Admin)</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Current Shift Status:{' '}
                <span className={isClockedIn ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                  {isClockedIn ? 'ON DUTY (Clocked In at 08:00 AM)' : 'OFF DUTY'}
                </span>
              </p>
            </div>

            <button
              onClick={handleToggleClock}
              className={`px-6 py-3 rounded-2xl font-extrabold text-xs transition shadow-lg ${
                isClockedIn
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20'
              }`}
            >
              {isClockedIn ? '🔴 Clock Out Duty' : '🟢 Clock In Shift'}
            </button>
          </div>

          {/* Logs Table */}
          <div className="p-6 rounded-2xl bg-[#0f0f13] border border-gray-800 space-y-4">
            <h3 className="text-lg font-extrabold">Staff Attendance History</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070709] border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Clock In Time</th>
                    <th className="py-3 px-4">Clock Out Time</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {staffLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4 font-bold text-white">{log.staffName}</td>
                      <td className="py-3.5 px-4 text-orange-400 font-medium">{log.role}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-300">{log.clockIn}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-300">{log.clockOut || '-- : --'}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            log.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {log.status === 'active' ? 'On Duty' : 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
